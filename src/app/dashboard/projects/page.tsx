import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectHeader } from "./_components/ProjectHeader";
import { ProjectsTableClient } from "./_components/ProjectsTableClient";

import { getCurrentUserAccessLevel } from "@/lib/auth";

// Opt into dynamic rendering if needed, though searchParams does it.
export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>
}) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";
  
  const supabase = await createClient();
  const accessLevel = await getCurrentUserAccessLevel();
  
  // Get current member ID for filtering if they are a member
  let currentMemberId: string | null = null;
  if (accessLevel === 'member') {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.email) {
      const { data: member } = await supabase.from('team_members').select('id').eq('email', user.email).single();
      if (member) currentMemberId = member.id;
    }
  }

  let queryBuilder = supabase
    .from("projects")
    .select(`*, manager:team_members(name)`)
    .order("created_at", { ascending: false });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,client_name.ilike.%${query}%,client_email.ilike.%${query}%,network.ilike.%${query}%`);
  }

  const { data: projects } = await queryBuilder;

  // Manual filter for manager name and member assignments
  const filteredProjects = projects ? projects.filter((project) => {
    // 1. Filter by access level (members only see projects they are assigned to)
    if (accessLevel === 'member' && currentMemberId) {
      const isAssigned = project.teams?.some((team: any) => team.members?.includes(currentMemberId));
      if (!isAssigned) return false;
    }

    // 2. Filter by search query
    if (!query) return true;
    const lowerQuery = query.toLowerCase();
    const managerName = project.manager?.name?.toLowerCase();
    if (managerName && managerName.includes(lowerQuery)) return true;
    return (
      (project.name && project.name.toLowerCase().includes(lowerQuery)) ||
      (project.client_name && project.client_name.toLowerCase().includes(lowerQuery)) ||
      (project.client_email && project.client_email.toLowerCase().includes(lowerQuery)) ||
      (project.network && project.network.toLowerCase().includes(lowerQuery))
    );
  }) : [];

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <ProjectHeader accessLevel={accessLevel} />

      <ProjectsTableClient projects={filteredProjects} hasQuery={!!query} accessLevel={accessLevel} />
    </div>
  );
}
