import React from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./_components/ChatClient";

export default async function MessagesPage() {
  const supabase = await createClient();

  // 1. Get Current Auth User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // 2. Get Current Team Member Profile
  const { data: currentUserMember } = await supabase
    .from("team_members")
    .select("*")
    .eq("email", user.email)
    .single();

  if (!currentUserMember) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 text-amber-700 p-4 rounded-lg border border-amber-200">
          You must be added as a team member by an admin to access messages.
        </div>
      </div>
    );
  }

  // 3. Get All Other Team Members
  const { data: teamMembers } = await supabase
    .from("team_members")
    .select("id, name, email, roles(name)")
    .neq("id", currentUserMember.id)
    .order("name");

  // 4. Get Initial Messages History
  // We'll fetch messages where the current user is either sender or receiver
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${currentUserMember.id},receiver_id.eq.${currentUserMember.id}`)
    .order("created_at", { ascending: true });

  return (
    <div className="h-[calc(100vh-128px)] w-full flex flex-col border border-slate-200 rounded-2xl shadow-sm overflow-hidden bg-white">
      <ChatClient 
        currentUser={currentUserMember} 
        members={teamMembers || []} 
        initialMessages={messages || []} 
      />
    </div>
  );
}
