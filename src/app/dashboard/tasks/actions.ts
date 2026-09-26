"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTaskStatus(taskId: string, status: 'pending' | 'in_progress' | 'completed') {
  const supabase = await createClient();
  const { error } = await supabase
    .from("planner_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/tasks`);
  revalidatePath(`/dashboard/planner`);
}
