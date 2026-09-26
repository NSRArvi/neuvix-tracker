import React from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAccessLevel } from "@/lib/auth";
import { PlannerClient } from "./_components/PlannerClient";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const supabase = await createClient();
  const accessLevel = await getCurrentUserAccessLevel();

  // Redirect members if they shouldn't see the overall planner
  // or you can just fetch only their projects like we did in projects/page.tsx
  let currentMemberId = null;
  if (accessLevel === "member") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: member } = await supabase.from('team_members').select('id').eq('email', user.email).single();
      if (member) currentMemberId = member.id;
    }
  }

  // Fetch planners
  const { data: planners } = await supabase
    .from("planners")
    .select("*, manager:team_members(name)")
    .order("created_at", { ascending: false });

  // Filter planners if member
  const filteredPlanners = planners ? planners.filter((planner) => {
    if (accessLevel === 'member' && currentMemberId) {
      const isAssigned = planner.teams?.some((team: any) => team.members?.includes(currentMemberId));
      return isAssigned;
    }
    return true; // Admins and Managers see all
  }) : [];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader 
        title="Planner"
        subtitle="Overview of project services, teams, and documents."
      />

      <PlannerClient planners={filteredPlanners} accessLevel={accessLevel} />
    </div>
  );
}
