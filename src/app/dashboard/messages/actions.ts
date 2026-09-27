"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  // Realtime handles the UI, but this is good for cache
  return data;
}

export async function markMessagesAsRead(senderId: string, receiverId: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", senderId)
    .eq("receiver_id", receiverId)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return true;
}
