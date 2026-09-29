import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectDetailsClient } from "../_components/ProjectDetailsClient";
import { notFound, redirect } from "next/navigation";

import { getCurrentUserAccessLevel } from "@/lib/auth";

export default async function ProjectViewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const supabase = await createClient();
  const accessLevel = await getCurrentUserAccessLevel();

  if (!accessLevel) {
    redirect("/auth");
  }

  const [projectRes, membersRes] = await Promise.all([
    supabase
      .from("projects")
      .select("*, manager:team_members(name)")
      .eq("id", id)
      .single(),
    supabase.from("team_members").select("id, name"),
  ]);

  if (!projectRes.data) {
    notFound();
  }

  return <ProjectDetailsClient project={projectRes.data} allMembers={membersRes.data || []} accessLevel={accessLevel} />;
}
