import React from "react";
import { ProjectForm } from "../../_components/ProjectForm";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProjectEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const supabase = await createClient();
  
  const [projectRes, membersRes] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).single(),
    supabase.from("team_members").select("id, name"),
  ]);

  if (!projectRes.data) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8" suppressHydrationWarning>
        <Link
          href={`/dashboard/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Edit Project</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update the details for <span className="font-semibold text-foreground">{projectRes.data.name}</span>.
        </p>
      </div>
      <ProjectForm initialProject={projectRes.data} allMembers={membersRes.data || []} />
    </div>
  );
}
