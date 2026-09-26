"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTeamAction(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("teams").insert([{ name }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function updateTeamAction(id: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("teams").update({ name }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function deleteTeamAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
}

export async function addRoleAction(name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").insert([{ name }]).select();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function updateRoleAction(id: string, name: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").update({ name }).eq("id", id).select();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function deleteRoleAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("roles").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
}

export async function addMemberAction(member: { name: string; email: string; phone: string; role_id: string; team_id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").insert([member]).select("*, roles(name), teams(name)");
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function updateMemberAction(id: string, member: { name: string; email: string; phone: string; role_id: string; team_id: string }) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").update(member).eq("id", id).select("*, roles(name), teams(name)");
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return data[0];
}

export async function deleteMemberAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
}
