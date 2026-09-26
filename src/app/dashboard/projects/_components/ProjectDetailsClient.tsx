/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
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
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeamPaymentModal } from "@/components/projects/team-payment-modal";
import { confirmTeamPayment, markPaymentDue } from "../actions";

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
  milestones: {
    name: string;
    description: string;
    payment_percent: string;
    expected_complete_date: string;
    status: string;
    team_payments?: Record<string, { amount?: string; status: "paid" | "due"; paid_date?: string; proof_url?: string }>;
  }[];
  teams: { name: string; budget: string; members: string[] }[];
  manager?: { name: string };
};

const statusConfig: Record<string, { label: string; icon: React.ReactNode; classes: string }> = {
  completed: { label: "Completed", icon: <CheckCircle2 className="w-3.5 h-3.5" />, classes: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  in_progress: { label: "In Progress", icon: <Clock className="w-3.5 h-3.5" />, classes: "bg-amber-50 text-amber-700 border-amber-100" },
  pending: { label: "Pending", icon: <Circle className="w-3.5 h-3.5" />, classes: "bg-slate-50 text-slate-600 border-slate-200" },
};

export function ProjectDetailsClient({ project, allMembers }: { project: Project, allMembers: { id: string; name: string }[] }) {
  // Payment Proof Modal State
const [paymentModal, setPaymentModal] = useState<{
    open: boolean;
    milestoneIndex: number;
    teamName: string;
    amount: string;
    proofUrl: string;
    paidDate: string;
  }>({
    open: false,
    milestoneIndex: -1,
    teamName: "",
    amount: "0",
    proofUrl: "",
    paidDate: new Date().toISOString().split("T")[0],
  });

  const getMemberName = (id: string) => allMembers.find((m) => m.id === id)?.name ?? id;

  const openPaymentModal = (milestoneIndex: number, teamName: string, amount: string) => {
    const current = project.milestones?.[milestoneIndex]?.team_payments?.[teamName];
    setPaymentModal({
      open: true,
      milestoneIndex,
      teamName,
      amount,
      proofUrl: current?.proof_url || "",
      paidDate: current?.paid_date || new Date().toISOString().split("T")[0],
    });
  };

  const handleConfirmTeamPayment = async (data: { paidDate: string; proofUrl: string }) => {
    const { milestoneIndex, teamName } = paymentModal;
    try {
      await confirmTeamPayment(project.id, milestoneIndex, teamName, data);
    } catch (err: any) {
      alert("Failed to update team payment status: " + err.message);
    }
  };

  const handleMarkPaymentDue = async (milestoneIndex: number, teamName: string) => {
    try {
      await markPaymentDue(project.id, milestoneIndex, teamName);
    } catch (err: any) {
      alert("Failed to update status to due: " + err.message);
    }
  };

  const totalBudget = parseFloat(String(project.budget || 0));
  const totalMilestonePercent = (project.milestones ?? []).reduce(
    (sum, m) => sum + (parseFloat(m.payment_percent) || 0), 0
  );

  const completedMilestonesAmount = (project.milestones ?? [])
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => {
      const pct = parseFloat(m.payment_percent) || 0;
      return sum + (totalBudget * (pct / 100));
    }, 0);

  const remainingBudget = Math.max(0, totalBudget - completedMilestonesAmount);

  return (
    <div className="max-w-5xl mx-auto pb-16 pt-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
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
        {/* Stats Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/30">
            <div className="p-5">
              <p className="text-sm font-medium text-slate-500 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-slate-900">
                ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-500">Paid Budget</p>
                <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Received
                </span>
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                ${completedMilestonesAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-500">Due Budget</p>
                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                  Pending
                </span>
              </div>
              <p className="text-3xl font-bold text-amber-600">
                ${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-white">
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5 uppercase tracking-wide">Project Manager</p>
                <p className="text-base font-semibold text-slate-900">
                  {project.manager?.name || "Unassigned"}
                </p>
              </div>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 mb-0.5 uppercase tracking-wide">Expected Deadline</p>
                <p className="text-base font-semibold text-slate-900">
                  {project.expected_delivery_date ? new Date(project.expected_delivery_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Not set"}
                </p>
              </div>
            </div>
          </div>
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
                        <div className="text-xs text-slate-500 mt-1 mb-2 whitespace-pre-wrap">{m.description}</div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        {m.expected_complete_date && (
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {m.expected_complete_date}</span>
                        )}
                        <span>{m.payment_percent}% of budget</span>
                      </div>

                      {(project.teams ?? []).length > 0 && parseFloat(m.payment_percent) > 0 && (
                        <div className="mt-3 p-3 bg-slate-50/80 rounded-lg border border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">
                            Team Payables ({m.payment_percent}%)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {project.teams.map((team, tIdx) => {
                              if (!team.name || !team.budget) return null;
                              const teamBudget = parseFloat(team.budget) || 0;
                              const percent = parseFloat(m.payment_percent) || 0;
                              const payable = (teamBudget * (percent / 100)).toFixed(2);
                              const paymentInfo = m.team_payments?.[team.name];
                              const isPaid = paymentInfo?.status === "paid";

                              return (
                                <div
                                  key={tIdx}
                                  className="flex flex-col justify-between p-2.5 bg-white rounded-md border border-slate-200/70 shadow-xs"
                                >
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-medium text-slate-700 truncate mr-2">
                                      {team.name}
                                    </span>
                                    <span className="text-xs font-bold text-emerald-600">
                                      ${payable}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100">
                                    {isPaid ? (
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          Paid {paymentInfo.paid_date ? `(${paymentInfo.paid_date})` : ""}
                                        </span>
                                        {paymentInfo.proof_url && (
                                          <a
                                            href={paymentInfo.proof_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-0.5 text-[10px]"
                                          >
                                            <FileCheck className="w-3 h-3" /> Proof
                                          </a>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        Due
                                      </span>
                                    )}

                                    <div className="flex items-center gap-1.5 ml-auto">
                                      {isPaid ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => openPaymentModal(i, team.name, payable)}
                                            className="text-[10px] text-slate-500 hover:text-indigo-600 underline font-medium"
                                          >
                                            Edit
                                          </button>
                                          <span className="text-slate-300">|</span>
                                          <button
                                            type="button"
                                            onClick={() => handleMarkPaymentDue(i, team.name)}
                                            className="text-[10px] text-amber-600 hover:text-amber-700 font-medium"
                                          >
                                            Mark Due
                                          </button>
                                        </>
                                      ) : (
                                        <Button
                                          type="button"
                                          size="xs"
                                          variant="outline"
                                          onClick={() => openPaymentModal(i, team.name, payable)}
                                          className="text-[10px] h-5 px-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                        >
                                          Mark Paid
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
              <FileText className="w-4 h-4 text-indigo-500" /> Documents Links
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

      <TeamPaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => setPaymentModal((prev) => ({ ...prev, open }))}
        teamName={paymentModal.teamName}
        amount={paymentModal.amount}
        initialPaidDate={paymentModal.paidDate}
        initialProofUrl={paymentModal.proofUrl}
        projectId={project?.id}
        onConfirm={handleConfirmTeamPayment}
      />
    </div>
  );
}
