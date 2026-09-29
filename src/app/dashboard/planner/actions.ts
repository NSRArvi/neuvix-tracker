"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getAuthenticatedMember } from "@/lib/auth";
import {
  sanitizeString,
  sanitizeOptionalString,
  sanitizeUrl,
  sanitizeEnum,
  sanitizeId,
} from "@/lib/validation";

// ─── Documents ───────────────────────────────────────────

export async function updatePlannerDocuments(
  plannerId: string,
  documents: { name: string; url: string }[]
) {
  const { accessLevel } = await getAuthenticatedMember();
  if (accessLevel === "member") {
    throw new Error("Unauthorized: Members cannot update documents.");
  }

  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");

  // Validate and sanitize each document URL and name (prevents Stored XSS via javascript: URLs)
  const cleanDocs = (documents || []).map((doc, idx) => ({
    name: sanitizeString(doc.name, `Document ${idx + 1} name`, 1, 150),
    url: sanitizeUrl(doc.url, `Document ${idx + 1} URL`),
  }));

  const supabase = await createClient();

  const { data: planner, error } = await supabase
    .from("planners")
    .update({ documents: cleanDocs })
    .eq("id", cleanPlannerId)
    .select("project_id")
    .single();

  if (error) throw new Error(error.message);

  if (planner?.project_id) {
    const { error: projError } = await supabase
      .from("projects")
      .update({ documents: cleanDocs })
      .eq("id", planner.project_id);

    if (projError) throw new Error(projError.message);
  }

  revalidatePath("/dashboard/planner/" + cleanPlannerId);
  if (planner?.project_id) {
    revalidatePath("/dashboard/projects/" + planner.project_id);
  }
}

// ─── Tasks ───────────────────────────────────────────────

export interface TaskPayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  assigned_team?: string | null;
  assigned_member?: string | null;
  priority?: string;
  labels?: string[];
}

const ALLOWED_PRIORITIES = ["high", "medium", "low"] as const;
const ALLOWED_STATUSES = ["pending", "in_progress", "completed"] as const;

function sanitizeTaskPayload(task: TaskPayload) {
  const title = sanitizeString(task.title, "Task title", 1, 200);
  const description = sanitizeOptionalString(task.description, "Task description", 2000);
  const priority = sanitizeEnum(
    (task.priority || "medium").toLowerCase(),
    ALLOWED_PRIORITIES,
    "Task priority"
  );
  const labels = Array.isArray(task.labels)
    ? task.labels
        .filter((l) => typeof l === "string" && l.trim())
        .slice(0, 10)
        .map((l) => l.trim().slice(0, 30))
    : [];

  return {
    title,
    description,
    priority,
    labels,
    due_date: task.due_date || null,
    assigned_team: sanitizeOptionalString(task.assigned_team, "Assigned team", 100),
    assigned_member: sanitizeOptionalString(task.assigned_member, "Assigned member", 100),
  };
}

export async function createPlannerTask(plannerId: string, task: TaskPayload) {
  const { accessLevel } = await getAuthenticatedMember();
  if (accessLevel === "member") {
    throw new Error("Unauthorized: Members cannot create tasks.");
  }

  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanPayload = sanitizeTaskPayload(task);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .insert([
      {
        planner_id: cleanPlannerId,
        ...cleanPayload,
      },
    ])
    .select("*, task_subtasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
  return data;
}

export async function updatePlannerTask(plannerId: string, taskId: string, task: TaskPayload) {
  const { accessLevel } = await getAuthenticatedMember();
  if (accessLevel === "member") {
    throw new Error("Unauthorized: Members cannot edit tasks.");
  }

  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanTaskId = sanitizeId(taskId, "Task ID");
  const cleanPayload = sanitizeTaskPayload(task);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .update({ ...cleanPayload, updated_at: new Date().toISOString() })
    .eq("id", cleanTaskId)
    .select("*, task_subtasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
  return data;
}

export async function updatePlannerTaskStatus(
  plannerId: string,
  taskId: string,
  status: "pending" | "in_progress" | "completed"
) {
  const { member, accessLevel } = await getAuthenticatedMember();
  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanTaskId = sanitizeId(taskId, "Task ID");
  const cleanStatus = sanitizeEnum(status, ALLOWED_STATUSES, "Task status");

  const supabase = await createClient();

  // If member, strictly verify that the task is assigned to this member
  if (accessLevel === "member") {
    const { data: task, error: taskError } = await supabase
      .from("planner_tasks")
      .select("assigned_member")
      .eq("id", cleanTaskId)
      .single();

    if (taskError || !task) {
      throw new Error("Task not found.");
    }

    if (task.assigned_member !== member.id) {
      throw new Error("Unauthorized: Only the assigned member can update the progress of this task.");
    }
  }

  const { error } = await supabase
    .from("planner_tasks")
    .update({ status: cleanStatus, updated_at: new Date().toISOString() })
    .eq("id", cleanTaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
}

export async function deletePlannerTask(plannerId: string, taskId: string) {
  const { accessLevel } = await getAuthenticatedMember();
  if (accessLevel === "member") {
    throw new Error("Unauthorized: Members cannot delete tasks.");
  }

  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanTaskId = sanitizeId(taskId, "Task ID");

  const supabase = await createClient();
  const { error } = await supabase
    .from("planner_tasks")
    .delete()
    .eq("id", cleanTaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
}

// ─── Subtasks ────────────────────────────────────────────

export async function createSubtask(plannerId: string, taskId: string, title: string) {
  await getAuthenticatedMember(); // Strict auth check
  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanTaskId = sanitizeId(taskId, "Task ID");
  const cleanTitle = sanitizeString(title, "Subtask title", 1, 250);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_subtasks")
    .insert([{ task_id: cleanTaskId, title: cleanTitle }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
  return data;
}

export async function toggleSubtask(plannerId: string, subtaskId: string, isCompleted: boolean) {
  await getAuthenticatedMember(); // Strict auth check
  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanSubtaskId = sanitizeId(subtaskId, "Subtask ID");

  const supabase = await createClient();
  const { error } = await supabase
    .from("task_subtasks")
    .update({ is_completed: Boolean(isCompleted) })
    .eq("id", cleanSubtaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
}

export async function deleteSubtask(plannerId: string, subtaskId: string) {
  const { accessLevel } = await getAuthenticatedMember();
  if (accessLevel === "member") {
    throw new Error("Unauthorized: Members cannot delete subtasks.");
  }

  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanSubtaskId = sanitizeId(subtaskId, "Subtask ID");

  const supabase = await createClient();
  const { error } = await supabase
    .from("task_subtasks")
    .delete()
    .eq("id", cleanSubtaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
}

// ─── Comments ────────────────────────────────────────────

export async function getTaskComments(taskId: string) {
  await getAuthenticatedMember(); // Strict auth check
  const cleanTaskId = sanitizeId(taskId, "Task ID");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, author:team_members!author_id(id, name)")
    .eq("task_id", cleanTaskId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTaskComment(
  plannerId: string,
  taskId: string,
  authorId: string,
  content: string
) {
  const { member } = await getAuthenticatedMember();
  const cleanPlannerId = sanitizeId(plannerId, "Planner ID");
  const cleanTaskId = sanitizeId(taskId, "Task ID");
  const cleanContent = sanitizeString(content, "Comment content", 1, 2000);

  // Author ID is strictly derived from authenticated session to prevent author spoofing
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .insert([
      {
        task_id: cleanTaskId,
        author_id: member.id,
        content: cleanContent,
      },
    ])
    .select("*, author:team_members!author_id(id, name)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + cleanPlannerId);
  return data;
}
