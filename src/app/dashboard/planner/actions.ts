"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserAccessLevel } from "@/lib/auth";

// ─── Documents ───────────────────────────────────────────

export async function updatePlannerDocuments(plannerId: string, documents: { name: string; url: string }[]) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot update documents.");
  }

  const supabase = await createClient();
  
  const { data: planner, error } = await supabase
    .from("planners")
    .update({ documents })
    .eq("id", plannerId)
    .select("project_id")
    .single();

  if (error) throw new Error(error.message);

  if (planner?.project_id) {
    const { error: projError } = await supabase
      .from("projects")
      .update({ documents })
      .eq("id", planner.project_id);
      
    if (projError) throw new Error(projError.message);
  }

  revalidatePath("/dashboard/planner/" + plannerId);
  if (planner?.project_id) {
    revalidatePath("/dashboard/projects/" + planner.project_id);
  }
}

// ─── Tasks ───────────────────────────────────────────────

interface TaskPayload {
  title: string;
  description?: string | null;
  due_date?: string | null;
  assigned_team?: string | null;
  assigned_member?: string | null;
  priority?: string;
  labels?: string[];
}

export async function createPlannerTask(plannerId: string, task: TaskPayload) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot create tasks.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .insert([{
      planner_id: plannerId,
      ...task,
      priority: task.priority || "medium",
      labels: task.labels || [],
    }])
    .select("*, task_subtasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
  return data;
}

export async function updatePlannerTask(plannerId: string, taskId: string, task: TaskPayload) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot edit tasks.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .update({ ...task, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select("*, task_subtasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
  return data;
}

export async function updatePlannerTaskStatus(plannerId: string, taskId: string, status: 'pending' | 'in_progress' | 'completed') {
  const role = await getCurrentUserAccessLevel();
  const supabase = await createClient();

  if (role === 'member') {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      throw new Error("Unauthorized: Please sign in.");
    }

    const { data: member } = await supabase
      .from("team_members")
      .select("id")
      .eq("email", user.email)
      .single();

    if (!member) {
      throw new Error("Unauthorized: Member record not found.");
    }

    const { data: task, error: taskError } = await supabase
      .from("planner_tasks")
      .select("assigned_member")
      .eq("id", taskId)
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
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
}

export async function deletePlannerTask(plannerId: string, taskId: string) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot delete tasks.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("planner_tasks")
    .delete()
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
}

// ─── Subtasks ────────────────────────────────────────────

export async function createSubtask(plannerId: string, taskId: string, title: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_subtasks")
    .insert([{ task_id: taskId, title }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
  return data;
}

export async function toggleSubtask(plannerId: string, subtaskId: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_subtasks")
    .update({ is_completed: isCompleted })
    .eq("id", subtaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
}

export async function deleteSubtask(plannerId: string, subtaskId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("task_subtasks")
    .delete()
    .eq("id", subtaskId);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
}

// ─── Comments ────────────────────────────────────────────

export async function getTaskComments(taskId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .select("*, author:team_members!author_id(id, name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createTaskComment(plannerId: string, taskId: string, authorId: string, content: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_comments")
    .insert([{ task_id: taskId, author_id: authorId, content }])
    .select("*, author:team_members!author_id(id, name)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/planner/" + plannerId);
  return data;
}

