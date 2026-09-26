import React, { Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { SearchInput } from "./SearchInput";
import { PageHeader } from "@/components/ui/page-header";

export function ProjectHeader({ isLoading = false, accessLevel = 'member' }: { isLoading?: boolean; accessLevel?: string }) {
  return (
    <PageHeader 
      title="Projects"
      subtitle="Manage your ongoing and completed projects."
      action={
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                disabled
                placeholder="Search projects..." 
                className="pl-9 pr-4 py-2 w-full sm:w-64 rounded-lg border-0 ring-1 ring-inset ring-slate-200 bg-slate-50 text-sm shadow-sm outline-none cursor-not-allowed"
              />
            </div>
          ) : (
            <Suspense fallback={<div className="w-full sm:w-64 h-9 bg-slate-100 animate-pulse rounded-lg" />}>
              <SearchInput />
            </Suspense>
          )}
          
          {accessLevel !== 'member' && (
            isLoading ? (
              <button
                disabled
                className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600/50 px-4 py-2 text-sm font-semibold text-white shadow-sm shrink-0 cursor-not-allowed"
              >
                <Plus className="-ml-0.5 h-4 w-4" />
                New Project
              </button>
            ) : (
              <Link
                href="/dashboard/projects/new"
                className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors shrink-0"
              >
                <Plus className="-ml-0.5 h-4 w-4" />
                New Project
              </Link>
            )
          )}
        </div>
      }
    />
  );
}
