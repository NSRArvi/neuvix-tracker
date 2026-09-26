/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/projects");
}

export async function createProject(data: any) {
  const supabase = await createClient();
  const { error, data: insertedData } = await supabase.from("projects").insert([data]).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/projects");
  return insertedData;
}

export async function updateProject(id: string, data: any) {
  const supabase = await createClient();
  const { error, data: updatedData } = await supabase.from("projects").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath(`/dashboard/projects/${id}/edit`);
  return updatedData;
}

export async function confirmTeamPayment(projectId: string, milestoneIndex: number, teamName: string, data: { paidDate: string; proofUrl: string }) {
  const supabase = await createClient();
  const { data: projectRes } = await supabase.from("projects").select("milestones").eq("id", projectId).single();
  if (!projectRes) throw new Error("Project not found");

  const milestones = projectRes.milestones || [];
  const currentMilestone = milestones[milestoneIndex];
  if (!currentMilestone) throw new Error("Milestone not found");

  const currentPayments = currentMilestone.team_payments || {};
  const currentPayment = currentPayments[teamName] || {};
  
  currentPayments[teamName] = {
    ...currentPayment,
    status: "paid",
    paid_date: data.paidDate,
    proof_url: data.proofUrl,
  };
  milestones[milestoneIndex].team_payments = currentPayments;

  const { error } = await supabase.from("projects").update({ milestones }).eq("id", projectId);
  if (error) throw new Error(error.message);
  
  revalidatePath(`/dashboard/projects/${projectId}`);
  return true;
}

export async function markPaymentDue(projectId: string, milestoneIndex: number, teamName: string) {
  const supabase = await createClient();
  const { data: projectRes } = await supabase.from("projects").select("milestones").eq("id", projectId).single();
  if (!projectRes) throw new Error("Project not found");

  const milestones = projectRes.milestones || [];
  const currentMilestone = milestones[milestoneIndex];
  if (!currentMilestone) throw new Error("Milestone not found");

  const currentPayments = currentMilestone.team_payments || {};
  delete currentPayments[teamName];
  milestones[milestoneIndex].team_payments = currentPayments;

  const { error } = await supabase.from("projects").update({ milestones }).eq("id", projectId);
  if (error) throw new Error(error.message);
  
  revalidatePath(`/dashboard/projects/${projectId}`);
  return true;
}
