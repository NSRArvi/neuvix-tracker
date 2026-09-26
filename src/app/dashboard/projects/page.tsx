import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectHeader } from "./_components/ProjectHeader";
import { ProjectsTableClient } from "./_components/ProjectsTableClient";

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
  
  let queryBuilder = supabase
    .from("projects")
    .select(`*, manager:team_members(name)`)
    .order("created_at", { ascending: false });

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,client_name.ilike.%${query}%,client_email.ilike.%${query}%,network.ilike.%${query}%`);
  }

  const { data: projects } = await queryBuilder;

  // Manual filter for manager name since it's a joined table and .or() syntax is complex for relations
  const filteredProjects = projects ? projects.filter((project) => {
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
      <ProjectHeader />

      <ProjectsTableClient projects={filteredProjects} hasQuery={!!query} />
    </div>
  );
}
