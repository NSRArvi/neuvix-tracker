import React from "react";
import { ProjectSkeleton } from "@/components/projects/project-skeleton";

export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto pb-16 pt-8">
      <ProjectSkeleton />
    </div>
  );
}
