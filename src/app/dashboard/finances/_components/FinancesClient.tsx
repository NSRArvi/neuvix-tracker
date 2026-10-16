/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileCheck,
  Search,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/utils";
import {
  addFinanceItem,
  updateFinanceItem,
  deleteFinanceItem,
  type AgencyFinanceItem,
} from "../actions";

interface AutoNeuvixCut {
  id: string;
  projectId: string;
  projectName: string;
  milestoneIndex: number;
  milestoneName: string;
  amount: number;
  status: "paid" | "due";
  paidDate?: string;
  proofUrl?: string;
}

interface FinancesClientProps {
  manualItems: AgencyFinanceItem[];
  autoNeuvixCuts: AutoNeuvixCut[];
  projects: { id: string; name: string }[];
  currentUserAccessLevel: "admin" | "manager" | "member";
}

const EXPENSE_CATEGORIES = [
  "Marketing & Ads",
  "Hosting & Cloud",
  "Domain Registration",
  "Software & Subscriptions",
  "Office & Hardware",
  "Legal & Accounting",
  "Contractors & Freelancers",
  "Other Expenses",
];

const INCOME_CATEGORIES = [
  "Neuvix Project Cut",
  "Bug Fix / Maintenance",
  "Hosting Resale",
  "Domain Resale",
  "Consulting & Strategy",
  "Retainer Service",
  "Other Income",
];

export function FinancesClient({
  manualItems,
  autoNeuvixCuts,
  projects,
  currentUserAccessLevel,
}: FinancesClientProps) {
  const isManagerOrAdmin = currentUserAccessLevel !== "member";

  // Tab & Filters
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expenses" | "neuvix">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "due">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editItem, setEditItem] = useState<AgencyFinanceItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Marketing & Ads");
  const [formAmount, setFormAmount] = useState("");
  const [formStatus, setFormStatus] = useState<"paid" | "due">("paid");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formProjectId, setFormProjectId] = useState<string>("none");
  const [formNotes, setFormNotes] = useState("");
  const [formProofUrl, setFormProofUrl] = useState("");

  // Delete modal
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    id: string | null;
    title: string;
  }>({
    isOpen: false,
    id: null,
    title: "",
  });

  const openNew = (type: "income" | "expense" = "expense") => {
    setEditItem(null);
    setFormType(type);
    setFormTitle("");
    setFormCategory(
      type === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[1]
    );
    setFormAmount("");
    setFormStatus("paid");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormProjectId("none");
    setFormNotes("");
    setFormProofUrl("");
    setIsOpen(true);
  };

  const openEdit = (item: AgencyFinanceItem) => {
    setEditItem(item);
    setFormType(item.type);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormAmount(String(item.amount));
    setFormStatus(item.status);
    setFormDate(item.date);
    setFormProjectId(item.project_id || "none");
    setFormNotes(item.notes || "");
    setFormProofUrl(item.proof_url || "");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount) return;

    try {
      setSubmitting(true);
      const payload: Omit<AgencyFinanceItem, "id"> = {
        type: formType,
        title: formTitle.trim(),
        category: formCategory,
        amount: parseFloat(formAmount) || 0,
        status: formStatus,
        date: formDate,
        project_id: formProjectId === "none" ? null : formProjectId,
        notes: formNotes.trim() || null,
        proof_url: formProofUrl.trim() || null,
      };

      if (editItem?.id) {
        await updateFinanceItem(editItem.id, payload);
      } else {
        await addFinanceItem(payload);
      }
      setIsOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to save item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;
    try {
      await deleteFinanceItem(deleteDialog.id);
      setDeleteDialog({ isOpen: false, id: null, title: "" });
    } catch (err: any) {
      alert(err.message || "Failed to delete item");
    }
  };

  // Convert auto Neuvix cuts to standard unified view items
  const autoCutsAsItems: AgencyFinanceItem[] = autoNeuvixCuts.map((cut) => ({
    id: `auto-${cut.id}`,
    type: "income",
    title: `${cut.projectName} - ${cut.milestoneName}`,
    category: "Neuvix Project Cut (Auto)",
    amount: cut.amount,
    status: cut.status,
    date: cut.paidDate || new Date().toISOString().split("T")[0],
    project_id: cut.projectId,
    notes: `Automatically pulled from project ${cut.projectName} (Milestone ${cut.milestoneIndex + 1})`,
    proof_url: cut.proofUrl,
  }));

  // Combined records
  const allRecords = [...autoCutsAsItems, ...manualItems];

  // Calculate Metrics: Total Fund, Paid Income, Due Income, Total Expenses, Paid Expenses, Due Expenses
  let totalIncomePaid = 0;
  let totalIncomeDue = 0;
  let totalExpensePaid = 0;
  let totalExpenseDue = 0;

  allRecords.forEach((item) => {
    const val = Number(item.amount) || 0;
    if (item.type === "income") {
      if (item.status === "paid") totalIncomePaid += val;
      else totalIncomeDue += val;
    } else {
      if (item.status === "paid") totalExpensePaid += val;
      else totalExpenseDue += val;
    }
  });

  // Total Available Fund = Realized Paid Income - Paid Expenses
  const totalFund = totalIncomePaid - totalExpensePaid;
  // Net Expected Fund = (Total Income) - (Total Expense)
  const netExpectedFund =
    totalIncomePaid + totalIncomeDue - (totalExpensePaid + totalExpenseDue);

  // Filter records for list
  const filteredRecords = allRecords.filter((item) => {
    // Tab filter
    if (activeTab === "income" && item.type !== "income") return false;
    if (activeTab === "expenses" && item.type !== "expense") return false;
    if (
      activeTab === "neuvix" &&
      !item.category.toLowerCase().includes("neuvix")
    )
      return false;

    // Status filter
    if (statusFilter !== "all" && item.status !== statusFilter) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCat = item.category.toLowerCase().includes(q);
      const matchNotes = (item.notes || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchNotes) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Agency Finances"
        subtitle="Track company income, Neuvix project shares, operational expenses, marketing, hosting, and domains."
        action={
          isManagerOrAdmin ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                onClick={() => openNew("expense")}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4 text-destructive" />
                Add Expense
              </Button>
              <Button
                onClick={() => openNew("income")}
                className="gap-1.5 bg-primary"
              >
                <Plus className="w-4 h-4" />
                Add Income
              </Button>
            </div>
          ) : null
        }
      />

      {/* Top Financial Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Available Fund */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Available Net Fund
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div
              className={cn(
                "text-2xl sm:text-3xl font-bold font-mono",
                totalFund >= 0
                  ? "text-foreground"
                  : "text-destructive"
              )}
            >
              ${totalFund.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <span>Paid Income</span>
              <span className="font-semibold text-emerald-600">
                (${totalIncomePaid.toLocaleString()})
              </span>
              <span>- Paid Costs</span>
            </p>
          </div>
        </div>

        {/* Realized Income */}
        <div className="bg-card rounded-2xl p-5 border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Total Realized Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              ${totalIncomePaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From paid milestones & sales
            </p>
          </div>
        </div>

        {/* Total Due / Pending Income */}
        <div className="bg-card rounded-2xl p-5 border border-amber-500/20 bg-amber-50/20 dark:bg-amber-950/10 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Pending / Due Income
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400 font-mono">
              ${totalIncomeDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting milestone client settlements
            </p>
          </div>
        </div>

        {/* Total Cost / Expenses */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
              ${(totalExpensePaid + totalExpenseDue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Paid: ${totalExpensePaid.toLocaleString()} • Due: ${totalExpenseDue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Auto Neuvix Cuts Highlight Banner */}
      <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <span className="text-muted-foreground">
            <strong className="text-foreground">Neuvix Project Integration:</strong> {autoNeuvixCuts.length} milestone cuts are automatically synced from projects. Paid:{" "}
            <strong className="text-emerald-600">
              ${autoNeuvixCuts.filter((c) => c.status === "paid").reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
            </strong>
            {" "}| Due:{" "}
            <strong className="text-amber-600">
              ${autoNeuvixCuts.filter((c) => c.status === "due").reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
            </strong>.
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab("neuvix")}
          className="text-primary hover:underline font-semibold shrink-0 cursor-pointer text-left"
        >
          View Neuvix Cuts →
        </button>
      </div>

      {/* Controls: Tabs, Filters, and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex bg-muted/60 p-1 rounded-xl border border-border/80 self-start">
          {[
            { id: "all", label: "All Items" },
            { id: "income", label: "Income" },
            { id: "expenses", label: "Expenses" },
            { id: "neuvix", label: "Neuvix Cuts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Search title, category, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 text-xs rounded-xl"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="h-9 w-32 text-xs rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="due">Due / Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table / List View */}
      <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4">Title & Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                {isManagerOrAdmin && (
                  <th className="py-3 px-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={isManagerOrAdmin ? 7 : 6}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <Receipt className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium text-foreground">No records found</p>
                    <p className="text-[11px] mt-0.5">
                      Adjust your filters or record new income and expenses.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const isAuto = String(item.id).startsWith("auto-");
                  const isIncome = item.type === "income";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      {/* Title & Notes */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">
                            {item.title}
                          </span>
                          {isAuto && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-medium shrink-0 border border-primary/20">
                              Auto Project
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            {item.notes}
                          </p>
                        )}
                        {item.proof_url && (
                          <a
                            href={item.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline mt-0.5 font-medium"
                          >
                            <FileCheck className="w-3 h-3" /> View Proof
                          </a>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted text-muted-foreground">
                          {item.category}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                            isIncome
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          )}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {isIncome ? "Income" : "Expense"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted-foreground font-mono text-[11px]">
                        {item.date}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <span
                          className={
                            isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          }
                        >
                          {isIncome ? "+" : "-"}${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                            item.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                          )}
                        >
                          {item.status === "paid" ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          {item.status === "paid" ? "Paid" : "Due"}
                        </span>
                      </td>

                      {/* Actions */}
                      {isManagerOrAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          {!isAuto ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEdit(item)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                title="Edit Item"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setDeleteDialog({
                                    isOpen: true,
                                    id: item.id || null,
                                    title: item.title,
                                  })
                                }
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                title="Delete Item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Synced
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editItem ? "Edit Financial Record" : `Add New ${formType === "income" ? "Income" : "Expense"}`}
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs">
              {/* Type Switcher */}
              {!editItem && (
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Record Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType("income");
                        setFormCategory(INCOME_CATEGORIES[1]);
                      }}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer",
                        formType === "income"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Income / Revenue
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormType("expense");
                        setFormCategory(EXPENSE_CATEGORIES[0]);
                      }}
                      className={cn(
                        "py-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer",
                        formType === "expense"
                          ? "bg-destructive/10 text-destructive border-destructive/30 font-bold"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      Agency Expense / Cost
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  Title / Description *
                </label>
                <Input
                  required
                  placeholder={
                    formType === "income"
                      ? "e.g. Bug Fix - Client Portal, Annual Domain Resale"
                      : "e.g. Google Ads Marketing, AWS Cloud Hosting, Domain renew"
                  }
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Amount and Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Amount ($) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Category
                  </label>
                    <Select
                    value={formCategory}
                    onValueChange={(val) => setFormCategory(val as string)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {(formType === "income"
                        ? INCOME_CATEGORIES
                        : EXPENSE_CATEGORIES
                      ).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Status and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Payment Status
                  </label>
                  <Select
                    value={formStatus}
                    onValueChange={(val) => setFormStatus(val as any)}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="due">Due / Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Optional Project Link */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  Linked Project (Optional)
                </label>
                <Select
                  value={formProjectId}
                  onValueChange={(val) => setFormProjectId(val as string)}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder="No Linked Project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (General Agency Cost)</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Proof URL */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  Proof URL / Receipt Link (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/... or invoice link"
                  value={formProofUrl}
                  onChange={(e) => setFormProofUrl(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-medium text-muted-foreground">
                  Notes
                </label>
                <Textarea
                  placeholder="Additional context, invoice number, or vendor details..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="min-h-[70px] text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : editItem ? "Update Record" : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: null, title: "" })}
        onConfirm={handleDelete}
        title="Delete Record"
        message={`Are you sure you want to delete "${deleteDialog.title}"? This action cannot be undone.`}
        isConfirm={true}
      />
    </div>
  );
}
