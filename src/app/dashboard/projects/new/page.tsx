import React from "react";
import { ProjectForm } from "../_components/ProjectForm";
import { createClient } from "@/lib/supabase/server";

export default async function NewProjectPage() {
  const supabase = await createClient();
  const { data: allMembers } = await supabase.from("team_members").select("id, name");

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fill in the details below to add a new project to your workspace.
        </p>
      </div>
      <ProjectForm allMembers={allMembers || []} />
    </div>
  );
}
