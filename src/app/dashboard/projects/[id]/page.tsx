"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Edit2,
  Building2,
  CircleDollarSign,
  Users,
  FileText,
  Briefcase,
  Calendar,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react";
import Link from "next/link";

type Project = {
  id: string;
  name: string;
  budget: number;
  expected_delivery_date: string;
  network: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  services: string[];
  documents: { name: string; url: string }[];
  milestones: { name: string; description: string; payment_percent: string; expected_complete_date: string; status: string }[];
  teams: { name: string; budget: string; members: string[] }[];
  manager?: { name: string };
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  completed: { label: "Completed", icon: <CheckCircle2 className="w-3.5 h-3.5" />, classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  in_progress: { label: "In Progress", icon: <Clock className="w-3.5 h-3.5" />, classes: "bg-amber-50 text-amber-700 border-amber-100" },
  pending: { label: "Pending", icon: <Circle className="w-3.5 h-3.5" />, classes: "bg-slate-50 text-slate-600 border-slate-200" },
};

export default function ProjectViewPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [project, setProject] = useState<Project | null>(null);
  const [allMembers, setAllMembers] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [projectRes, membersRes] = await Promise.all([
        supabase
          .from("projects")
          .select("*, manager:team_members(name)")
          .eq("id", params.id)
          .single(),
        supabase.from("team_members").select("id, name"),
      ]);
      if (projectRes.data) setProject(projectRes.data);
      if (membersRes.data) setAllMembers(membersRes.data);
      setLoading(false);
    };
    fetchData();
  }, [params.id, supabase]);

  const getMemberName = (id: string) => allMembers.find((m) => m.id === id)?.name ?? id;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Project not found.</p>
        <Link href="/dashboard/projects" className="text-indigo-600 text-sm mt-2 inline-block">← Back to Projects</Link>
      </div>
    );
  }

  const totalMilestonePercent = (project.milestones ?? []).reduce(
    (sum, m) => sum + (parseFloat(m.payment_percent) || 0), 0
  );

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{project.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {project.network && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                <Globe className="w-3 h-3" /> {project.network}
              </span>
            )}
            <span className="inline-flex items-center text-xs font-semibold bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
              Active
            </span>
          </div>
        </div>
        <Link
          href={`/dashboard/projects/${project.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors shrink-0"
        >
          <Edit2 className="w-4 h-4" /> Edit Project
        </Link>
      </div>

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Budget", value: `$${parseFloat(String(project.budget)).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, color: "text-emerald-600" },
            { label: "Due Date", value: project.expected_delivery_date || "Not set", color: "text-slate-900" },
            { label: "Project Manager", value: project.manager?.name || "Unassigned", color: "text-slate-900" },
            { label: "Milestones", value: `${(project.milestones ?? []).length} total`, color: "text-slate-900" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-indigo-500" /> Client Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Client Name</p>
              <p className="text-sm font-semibold text-slate-800">{project.client_name || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Email</p>
              <a href={`mailto:${project.client_email}`} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                <Mail className="w-3.5 h-3.5" /> {project.client_email || "—"}
              </a>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Phone</p>
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {project.client_phone || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Services */}
        {(project.services ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Services
            </h2>
            <div className="flex flex-wrap gap-2">
              {project.services.map((s) => (
                <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Milestones */}
        {(project.milestones ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <CircleDollarSign className="w-4 h-4 text-indigo-500" /> Milestones
              </h2>
              <span className="text-xs text-slate-500">{totalMilestonePercent}% allocated</span>
            </div>
            <div className="divide-y divide-slate-100">
              {project.milestones.map((m, i) => {
                const amount = (project.budget * (parseFloat(m.payment_percent) || 0) / 100).toFixed(2);
                const cfg = statusConfig[m.status] ?? statusConfig.pending;
                return (
                  <div key={i} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-900">{m.name || `Milestone ${i + 1}`}</span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.classes}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </div>
                      {m.description && (
                        <div className="text-xs text-slate-500 mt-1 mb-2" dangerouslySetInnerHTML={{ __html: m.description }} />
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {m.expected_complete_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.expected_complete_date}</span>
                        )}
                        <span>{m.payment_percent}% of budget</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-emerald-600">${amount}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Teams */}
        {(project.teams ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-indigo-500" /> Teams
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.teams.map((team, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-4 bg-slate-50/40">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-800">{team.name}</p>
                    <p className="text-sm font-semibold text-emerald-600">${parseFloat(team.budget || "0").toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(team.members ?? []).filter(Boolean).map((id, j) => (
                      <span key={j} className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium">
                        {getMemberName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        {(project.documents ?? []).filter(d => d.name || d.url).length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-indigo-500" /> Documents & Links
            </h2>
            <div className="space-y-2">
              {project.documents.filter(d => d.name || d.url).map((doc, i) => (
                <a
                  key={i}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-700 group-hover:text-indigo-700">{doc.name || doc.url}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
