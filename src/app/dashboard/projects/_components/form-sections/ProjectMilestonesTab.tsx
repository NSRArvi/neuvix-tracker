/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { CircleDollarSign, Plus, Trash2, Send, Loader2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export interface MilestoneItem {
  name: string;
  description: string;
  payment_percent: string;
  expected_complete_date: string;
  status: string;
  team_payments?: Record<
    string,
    {
      amount?: string;
      status: "paid" | "due";
      paid_date?: string;
      proof_url?: string;
    }
  >;
}

interface ProjectMilestonesTabProps {
  milestones: MilestoneItem[];
  budget: string;
  teams: any[];
  initialProjectId?: string;
  sendingInvoiceIndex: number | null;
  handleSendInvoice: (index: number, amount: string) => Promise<void>;
  addMilestone: () => void;
  removeMilestone: (index: number) => void;
  handleMilestoneChange: (
    index: number,
    field: keyof MilestoneItem,
    value: MilestoneItem[keyof MilestoneItem]
  ) => void;
  openPaymentModal: (
    milestoneIndex: number,
    teamName: string,
    amount: string
  ) => void;
  handleMarkPaymentDue: (milestoneIndex: number, teamName: string) => void;
}

export function ProjectMilestonesTab({
  milestones,
  budget,
  teams,
  initialProjectId,
  sendingInvoiceIndex,
  handleSendInvoice,
  addMilestone,
  removeMilestone,
  handleMilestoneChange,
  openPaymentModal,
  handleMarkPaymentDue,
}: ProjectMilestonesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CircleDollarSign className="w-5 h-5 text-primary" />
            Milestones
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Define project phases, payment percentages, and track team payables.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addMilestone}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone, index) => {
          const amountNum =
            budget && milestone.payment_percent
              ? parseFloat(budget) * (parseFloat(milestone.payment_percent) / 100)
              : 0;
          const amount = amountNum.toFixed(2);

          return (
            <div
              key={index}
              className="relative p-5 rounded-xl border border-border bg-card shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pr-8 border-b border-border pb-3 gap-2">
                <h3 className="text-sm font-semibold text-foreground">
                  Milestone {index + 1}
                </h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Payable: ${amount}
                  </div>
                  {initialProjectId && milestone.status !== "In Progress" && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSendInvoice(index, amount)}
                      disabled={sendingInvoiceIndex === index}
                      className="h-7 text-xs"
                    >
                      {sendingInvoiceIndex === index ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 mr-1" />
                      )}
                      {milestone.status === "Invoice Sent"
                        ? "Resend Invoice"
                        : "Send Invoice"}
                    </Button>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMilestone(index)}
                disabled={milestones.length === 1}
                className="absolute top-3 right-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                title="Remove milestone"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Milestone Name
                  </label>
                  <Input
                    type="text"
                    value={milestone.name}
                    onChange={(e) =>
                      handleMilestoneChange(index, "name", e.target.value)
                    }
                    placeholder="e.g. Phase 1 - UI & UX"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Payment Percent (%)
                  </label>
                  <Input
                    type="number"
                    value={milestone.payment_percent}
                    onChange={(e) =>
                      handleMilestoneChange(
                        index,
                        "payment_percent",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 25"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Description
                  </label>
                  <Textarea
                    value={milestone.description}
                    onChange={(e) =>
                      handleMilestoneChange(index, "description", e.target.value)
                    }
                    placeholder="Enter milestone scope, objectives, or notes..."
                    className="min-h-[80px] text-sm"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Expected Complete Date
                  </label>
                  <Input
                    type="date"
                    value={milestone.expected_complete_date}
                    onChange={(e) =>
                      handleMilestoneChange(
                        index,
                        "expected_complete_date",
                        e.target.value
                      )
                    }
                    className="h-9 text-sm"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Milestone Status
                  </label>
                  <Select
                    value={milestone.status}
                    onValueChange={(val) =>
                      handleMilestoneChange(index, "status", val as string)
                    }
                  >
                    <SelectTrigger className="h-9 w-full">
                      {milestone.status ? (
                        milestone.status.charAt(0).toUpperCase() +
                        milestone.status.slice(1).replace("_", " ")
                      ) : (
                        <span className="text-muted-foreground">Status</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Invoice Sent">Invoice Sent</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {teams.length > 0 && milestone.payment_percent && (
                <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Team Payables for this Milestone ({milestone.payment_percent}%)
                    </h4>
                    <span className="text-[11px] text-muted-foreground">
                      Status updates & payment proof
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {teams.map((team: any, i: number) => {
                      if (!team.name || !team.budget) return null;
                      const teamBudget = parseFloat(team.budget) || 0;
                      const percent =
                        parseFloat(milestone.payment_percent) || 0;
                      const payable = (teamBudget * (percent / 100)).toFixed(2);
                      const paymentInfo = milestone.team_payments?.[team.name];
                      const isPaid = paymentInfo?.status === "paid";

                      return (
                        <div
                          key={i}
                          className="p-3 bg-card rounded-lg border border-border flex flex-col justify-between gap-2.5 shadow-xs"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-foreground truncate mr-2 font-medium text-sm">
                              {team.name}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm font-mono">
                              ${payable}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                            {isPaid ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Paid • {paymentInfo.paid_date}
                                </span>
                                {paymentInfo.proof_url && (
                                  <a
                                    href={paymentInfo.proof_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-0.5 text-[11px] font-medium"
                                  >
                                    <FileCheck className="w-3.5 h-3.5" /> Proof
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Payment Due
                              </span>
                            )}

                            <div className="flex items-center gap-1.5 ml-auto">
                              {isPaid ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openPaymentModal(index, team.name, payable)
                                    }
                                    className="text-[11px] text-muted-foreground hover:text-foreground underline font-medium cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-border">|</span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleMarkPaymentDue(index, team.name)
                                    }
                                    className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                                  >
                                    Mark Due
                                  </button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    openPaymentModal(index, team.name, payable)
                                  }
                                  className="text-xs h-6 px-2 text-primary border-primary/30 hover:bg-primary/10"
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
          );
        })}
      </div>
    </div>
  );
}

