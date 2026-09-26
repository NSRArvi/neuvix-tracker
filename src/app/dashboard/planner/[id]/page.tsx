import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { PlannerDetailsClient } from "../_components/PlannerDetailsClient";

export default async function PlannerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  const accessLevel = await getCurrentUserAccessLevel();

  const { data: planner } = await supabase
    .from("planners")
    .select("*, manager:team_members!manager_id(name)")
    .eq("id", id)
    .single();

  if (!planner) {
    notFound();
  }

  // Security check for members
  if (accessLevel === "member") {
    const { data: { user } } = await supabase.auth.getUser();
    let isAssigned = false;
    
    if (user?.email) {
      const { data: member } = await supabase
        .from("team_members")
        .select("id")
        .eq("email", user.email)
        .single();
        
      if (member && planner.teams) {
        isAssigned = planner.teams.some((team: any) => 
          team.members?.includes(member.id)
        );
      }
    }
    
    if (!isAssigned) {
      redirect("/dashboard/planner");
    }
  }

  // Fetch all members for name mapping on the right side
  const { data: allMembers } = await supabase.from("team_members").select("id, name");

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("planner_tasks")
    .select("*")
    .eq("planner_id", id)
    .order("created_at", { ascending: true });

  return (
    <PlannerDetailsClient 
      planner={planner} 
      tasks={tasks || []}
      allMembers={allMembers || []} 
      accessLevel={accessLevel} 
    />
  );
}

