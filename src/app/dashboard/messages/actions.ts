"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedMember } from "@/lib/auth";
import { sanitizeString, sanitizeId } from "@/lib/validation";

export async function sendMessage(senderId: string, receiverId: string, content: string) {
  // 1. Verify authenticated user identity (prevents sender spoofing)
  const { member } = await getAuthenticatedMember();
  
  if (senderId && senderId !== member.id) {
    throw new Error("Forbidden: Cannot send messages on behalf of another team member.");
  }

  // 2. Validate and sanitize inputs
  const cleanContent = sanitizeString(content, "Message content", 1, 5000);
  const cleanReceiverId = sanitizeId(receiverId, "Receiver ID");

  if (cleanReceiverId === member.id) {
    throw new Error("Invalid request: Cannot send a message to yourself.");
  }

  const supabase = await createClient();

  // 3. Verify recipient exists
  const { data: recipient, error: recipientError } = await supabase
    .from("team_members")
    .select("id")
    .eq("id", cleanReceiverId)
    .single();

  if (recipientError || !recipient) {
    throw new Error("Recipient team member not found.");
  }

  // 4. Secure Insert (sender_id is strictly derived from the authenticated session)
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        sender_id: member.id,
        receiver_id: cleanReceiverId,
        content: cleanContent,
      },
    ])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markMessagesAsRead(senderId: string, receiverId: string) {
  // 1. Verify authenticated user identity
  const { member } = await getAuthenticatedMember();

  // Only the actual recipient can mark messages sent to them as read (prevents IDOR)
  if (receiverId && receiverId !== member.id) {
    throw new Error("Forbidden: You can only mark messages sent to your own inbox as read.");
  }

  const cleanSenderId = sanitizeId(senderId, "Sender ID");
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("sender_id", cleanSenderId)
    .eq("receiver_id", member.id)
    .eq("is_read", false);

  if (error) throw new Error(error.message);
  return true;
}
