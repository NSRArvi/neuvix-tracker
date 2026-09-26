"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserAccessLevel } from "@/lib/auth";

export async function updatePlannerDocuments(plannerId: string, documents: { name: string; url: string }[]) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot update documents.");
  }

  const supabase = await createClient();
  
  // Update the planner
  const { data: planner, error } = await supabase
    .from("planners")
    .update({ documents })
    .eq("id", plannerId)
    .select("project_id")
    .single();

  if (error) throw new Error(error.message);

  // Sync to the project table to keep them consistent
  if (planner?.project_id) {
    const { error: projError } = await supabase
      .from("projects")
      .update({ documents })
      .eq("id", planner.project_id);
      
    if (projError) throw new Error(projError.message);
  }

  revalidatePath(`/dashboard/planner/${plannerId}`);
  if (planner?.project_id) {
    revalidatePath(`/dashboard/projects/${planner.project_id}`);
  }
}

export async function createPlannerTask(plannerId: string, task: { title: string; description?: string | null; due_date?: string | null; assigned_team?: string | null }) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot create tasks.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .insert([{ planner_id: plannerId, ...task }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/planner/${plannerId}`);
  return data;
}

export async function updatePlannerTask(plannerId: string, taskId: string, task: { title: string; description?: string | null; due_date?: string | null; assigned_team?: string | null }) {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot edit tasks.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("planner_tasks")
    .update({ ...task, updated_at: new Date().toISOString() })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/planner/${plannerId}`);
  return data;
}

export async function updatePlannerTaskStatus(plannerId: string, taskId: string, status: 'pending' | 'in_progress' | 'completed') {
  // Anyone can update status
  const supabase = await createClient();
  const { error } = await supabase
    .from("planner_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/planner/${plannerId}`);
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
  revalidatePath(`/dashboard/planner/${plannerId}`);
}
