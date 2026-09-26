/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserAccessLevel } from "@/lib/auth";

async function checkAccess() {
  const role = await getCurrentUserAccessLevel();
  if (role === 'member') {
    throw new Error("Unauthorized: Members cannot perform this action.");
  }
}

export async function deleteProject(id: string) {
  await checkAccess();
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/projects");
}

export async function createProject(data: any) {
  await checkAccess();
  const supabase = await createClient();
  const { error, data: insertedData } = await supabase.from("projects").insert([data]).select().single();
  if (error) throw new Error(error.message);
  
  // Strip budget/payment info for the planner
  const strippedTeams = insertedData.teams?.map((t: any) => ({ name: t.name, members: t.members }));
  const strippedMilestones = insertedData.milestones?.map((m: any) => ({
    name: m.name,
    description: m.description,
    status: m.status,
    expected_complete_date: m.expected_complete_date
  }));

  // Create planner
  await supabase.from("planners").insert([{
    project_id: insertedData.id,
    project_name: insertedData.name,
    expected_delivery_date: insertedData.expected_delivery_date,
    manager_id: insertedData.manager_id,
    services: insertedData.services,
    documents: insertedData.documents,
    teams: strippedTeams,
    milestones: strippedMilestones,
  }]);

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/planner");
  return insertedData;
}

export async function updateProject(id: string, data: any) {
  await checkAccess();
  const supabase = await createClient();
  const { error, data: updatedData } = await supabase.from("projects").update(data).eq("id", id).select().single();
  if (error) throw new Error(error.message);

  // Strip budget/payment info for the planner
  const strippedTeams = updatedData.teams?.map((t: any) => ({ name: t.name, members: t.members }));
  const strippedMilestones = updatedData.milestones?.map((m: any) => ({
    name: m.name,
    description: m.description,
    status: m.status,
    expected_complete_date: m.expected_complete_date
  }));

  // Update planner
  await supabase.from("planners").update({
    project_name: updatedData.name,
    expected_delivery_date: updatedData.expected_delivery_date,
    manager_id: updatedData.manager_id,
    services: updatedData.services,
    documents: updatedData.documents,
    teams: strippedTeams,
    milestones: strippedMilestones,
  }).eq("project_id", id);

  revalidatePath("/dashboard/projects");
  revalidatePath("/dashboard/planner");
  revalidatePath(`/dashboard/projects/${id}`);
  revalidatePath(`/dashboard/projects/${id}/edit`);
  return updatedData;
}

export async function confirmTeamPayment(projectId: string, milestoneIndex: number, teamName: string, data: { paidDate: string; proofUrl: string }) {
  await checkAccess();
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
  await checkAccess();
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
