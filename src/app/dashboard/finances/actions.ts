/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserAccessLevel } from "@/lib/auth";

async function checkAccess() {
  const role = await getCurrentUserAccessLevel();
  if (role === "member") {
    throw new Error("Unauthorized: Only admins and managers can manage agency finances.");
  }
}

export type AgencyFinanceItem = {
  id?: string;
  type: "income" | "expense";
  title: string;
  category: string;
  amount: number;
  status: "paid" | "due";
  date: string;
  project_id?: string | null;
  milestone_index?: number | null;
  notes?: string | null;
  proof_url?: string | null;
};

export async function addFinanceItem(data: Omit<AgencyFinanceItem, "id">) {
  await checkAccess();
  const supabase = await createClient();

  const { data: inserted, error } = await supabase
    .from("agency_finances")
    .insert([
      {
        type: data.type,
        title: data.title,
        category: data.category,
        amount: data.amount,
        status: data.status,
        date: data.date,
        project_id: data.project_id || null,
        milestone_index: data.milestone_index ?? null,
        notes: data.notes || null,
        proof_url: data.proof_url || null,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard");
  return inserted;
}

export async function updateFinanceItem(
  id: string,
  data: Partial<AgencyFinanceItem>
) {
  await checkAccess();
  const supabase = await createClient();

  const updatePayload: Record<string, any> = {
    ...data,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("agency_finances")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteFinanceItem(id: string) {
  await checkAccess();
  const supabase = await createClient();

  const { error } = await supabase
    .from("agency_finances")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/finances");
  revalidatePath("/dashboard");
  return { success: true };
}

