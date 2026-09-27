"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Users,
  FileText,
  Briefcase,
  Calendar,
  Clock,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { updatePlannerDocuments } from "../actions";
import { EditDocumentsModal } from "./EditDocumentsModal";
import { PlannerTasksKanban } from "./PlannerTasksKanban";

interface Planner {
  id: string;
  project_id: string;
  project_name: string;
  expected_delivery_date?: string | null;
  created_at: string;
  services: string[];
  manager?: { name: string } | null;
  documents: { name: string; url: string }[];
  teams: { name: string; members: string[] }[];
  milestones?: {
    name: string;
    description?: string;
    status: string;
    expected_complete_date?: string;
  }[];
}

export function PlannerDetailsClient({
  planner,
  tasks = [],
  allMembers,
  accessLevel,
}: {
  planner: Planner;
  tasks?: any[];
  allMembers: { id: string; name: string }[];
  accessLevel: string;
}) {
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMemberName = (id: string) =>
    allMembers.find((m) => m.id === id)?.name || "Unknown Member";

  const handleSaveDocs = async (validDocs: { name: string; url: string }[]) => {
    setError(null);
    try {
      await updatePlannerDocuments(planner.id, validDocs);
      setDocsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw so the modal can catch it and show its own error state
    }
  };

  const openDocsModal = () => {
    setDocsModalOpen(true);
  };

  return (
    <div className="mx-6 pb-16">
      <Link
        href="/dashboard/planner"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Planner List
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* LEFT SIDE  */}
        <div className="md:col-span-3 space-y-6">

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 leading-tight">
              {planner.project_name}
            </h1>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Manager</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {planner.manager?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Delivery Date
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {planner.expected_delivery_date
                      ? new Date(
                          planner.expected_delivery_date,
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">
                    Created On
                  </p>
                  <p className="text-sm font-semibold text-slate-800">
                    {new Date(planner.created_at).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-indigo-500" /> Services
              </h2>
              {planner.services && planner.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {planner.services.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No services listed.</p>
              )}
            </div>

            {/* Documents */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" /> Documents
                </h2>
                {accessLevel !== "member" && (
                  <button
                    onClick={openDocsModal}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>

              {planner.documents &&
              planner.documents.filter((d) => d.name || d.url).length > 0 ? (
                <div className="space-y-2">
                  {planner.documents
                    .filter((d) => d.name || d.url)
                    .map((doc, idx) => (
                      <a
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group"
                      >
                        <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium truncate group-hover:text-indigo-700">
                          {doc.name || doc.url}
                        </span>
                      </a>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  No documents attached.
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-indigo-600" /> Teams
            </h2>

            {planner.teams && planner.teams.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {planner.teams
                  .filter((t) => t.name)
                  .map((team, tIdx) => (
                    <div
                      key={tIdx}
                      className="border border-slate-100 rounded-xl bg-slate-50/50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
                        <h3 className="font-bold text-slate-800">
                          {team.name}
                        </h3>
                      </div>
                      <div className="p-4">
                        {team.members && team.members.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((memberId, mIdx) => (
                              <span
                                key={mIdx}
                                className="inline-flex items-center px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-xs"
                              >
                                {getMemberName(memberId)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400 italic">
                            No members assigned.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-slate-800 font-medium">
                  No Teams Assigned
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  There are no teams working on this project plan yet.
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Calendar className="w-5 h-5 text-indigo-600" /> Project Timeline
            </h2>
            {planner.milestones && planner.milestones.length > 0 ? (
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-4">
                {planner.milestones.map((m, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div
                      className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                        m.status === "completed"
                          ? "bg-emerald-500"
                          : m.status === "in_progress"
                            ? "bg-amber-500"
                            : "bg-slate-300"
                      }`}
                    />
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-bold text-slate-800">
                        {m.name || `Milestone ${idx + 1}`}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : m.status === "in_progress"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {m.status === "in_progress"
                          ? "IN PROGRESS"
                          : m.status.toUpperCase()}
                      </span>
                    </div>
                    {m.description && (
                      <p className="text-xs text-slate-500 mb-2">
                        {m.description}
                      </p>
                    )}
                    {m.expected_complete_date && (
                      <p className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due{" "}
                        {new Date(
                          m.expected_complete_date,
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                No milestones defined for this project.
              </p>
            )}
          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className="md:col-span-9">
          <PlannerTasksKanban
            plannerId={planner.id}
            tasks={tasks}
            teams={planner.teams || []}
            accessLevel={accessLevel}
          />
        </div>
      </div>

      {/* Edit Documents Modal */}
      <EditDocumentsModal
        open={docsModalOpen}
        onOpenChange={setDocsModalOpen}
        initialDocuments={planner.documents || []}
        onSave={handleSaveDocs}
      />
    </div>
  );
}
