import React from "react";
import { SkeletonTable } from "@/components/ui/skeleton-table";
import { ProjectHeader } from "./_components/ProjectHeader";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <ProjectHeader isLoading />

      <SkeletonTable rows={5} columns={6} />
    </div>
  );
}
