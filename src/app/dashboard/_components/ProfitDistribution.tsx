/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  PieChart as PieChartIcon,
  Layers,
  Receipt,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMemberProfit {
  key: string;
  name: string;
  expected: number;
  paid: number;
  due: number;
  color: string;
  bgLight: string;
  borderColor: string;
  ringColor: string;
}

interface ProfitDistributionProps {
  projects: any[];
}

// Configured list of key team members / partners as requested:
// Sajjad, Mamun, Arvi, and Neuvix
const PARTNERS = [
  {
    key: "neuvix",
    name: "Neuvix",
    color: "#4f46e5", // Indigo
    bgLight: "bg-indigo-50/60 dark:bg-indigo-950/20",
    borderColor: "border-indigo-100 dark:border-indigo-900/50",
    ringColor: "ring-indigo-500",
  },
  {
    key: "sajjad",
    name: "Sajjad",
    color: "#0284c7", // Sky
    bgLight: "bg-sky-50/60 dark:bg-sky-950/20",
    borderColor: "border-sky-100 dark:border-sky-900/50",
    ringColor: "ring-sky-500",
  },
  {
    key: "mamun",
    name: "Mamun",
    color: "#0d9488", // Teal
    bgLight: "bg-teal-50/60 dark:bg-teal-950/20",
    borderColor: "border-teal-100 dark:border-teal-900/50",
    ringColor: "ring-teal-500",
  },
  {
    key: "arvi",
    name: "Arvi",
    color: "#d97706", // Amber
    bgLight: "bg-amber-50/60 dark:bg-amber-950/20",
    borderColor: "border-amber-100 dark:border-amber-900/50",
    ringColor: "ring-amber-500",
  },
];

export function ProfitDistribution({ projects }: ProfitDistributionProps) {
  const [selectedView, setSelectedView] = useState<"expected" | "paid">("expected");

  // 1. Calculate Project Revenue, Partner Allocations, and Project Costs
  let totalRevenue = 0;
  let totalRevenueCollected = 0;

  // Partner tracking map
  const partnerDataMap: Record<string, { expected: number; paid: number; due: number }> = {
    neuvix: { expected: 0, paid: 0, due: 0 },
    sajjad: { expected: 0, paid: 0, due: 0 },
    mamun: { expected: 0, paid: 0, due: 0 },
    arvi: { expected: 0, paid: 0, due: 0 },
  };

  // Other team payables (outside the 4 main partners) that act as direct team / contractor product costs
  let otherTeamCostsExpected = 0;
  let otherTeamCostsPaid = 0;

  projects.forEach((p) => {
    const projBudget = parseFloat(String(p.budget || 0)) || 0;
    totalRevenue += projBudget;

    const milestones = p.milestones || [];
    const teams = p.teams || [];

    // Milestone client collections
    milestones.forEach((m: any) => {
      const percent = parseFloat(String(m.payment_percent || 0)) || 0;
      const milestoneAmount = projBudget * (percent / 100);
      const isCompleted =
        m.status === "Completed" || m.status === "completed";
      if (isCompleted) {
        totalRevenueCollected += milestoneAmount;
      }
    });

    // Check project teams for partner budget allocation and milestone payables
    teams.forEach((t: any) => {
      const teamName = String(t.name || "").trim().toLowerCase();
      const teamBudget = parseFloat(String(t.budget || 0)) || 0;

      // Identify if this team matches any of our key partners
      const matchedPartner = PARTNERS.find((partner) => {
        const pKey = partner.key.toLowerCase();
        const pName = partner.name.toLowerCase();
        return teamName.includes(pKey) || teamName.includes(pName);
      });

      if (matchedPartner) {
        // Accumulate expected allocation
        partnerDataMap[matchedPartner.key].expected += teamBudget;

        // Check milestones for paid vs due payments to this team
        milestones.forEach((m: any) => {
          const percent = parseFloat(String(m.payment_percent || 0)) || 0;
          const payable = teamBudget * (percent / 100);
          const paymentInfo = m.team_payments?.[t.name];

          if (paymentInfo?.status === "paid") {
            partnerDataMap[matchedPartner.key].paid += payable;
          } else {
            partnerDataMap[matchedPartner.key].due += payable;
          }
        });
      } else {
        // Other teams (e.g. external contractors, developers, qa, product cost)
        otherTeamCostsExpected += teamBudget;

        milestones.forEach((m: any) => {
          const percent = parseFloat(String(m.payment_percent || 0)) || 0;
          const payable = teamBudget * (percent / 100);
          const paymentInfo = m.team_payments?.[t.name];

          if (paymentInfo?.status === "paid") {
            otherTeamCostsPaid += payable;
          }
        });
      }
    });
  });

  // Calculate totals for partners
  let totalPartnersExpected = 0;
  let totalPartnersPaid = 0;

  const partnerList: TeamMemberProfit[] = PARTNERS.map((partner) => {
    const data = partnerDataMap[partner.key];
    totalPartnersExpected += data.expected;
    totalPartnersPaid += data.paid;

    return {
      key: partner.key,
      name: partner.name,
      expected: data.expected,
      paid: data.paid,
      due: data.due,
      color: partner.color,
      bgLight: partner.bgLight,
      borderColor: partner.borderColor,
      ringColor: partner.ringColor,
    };
  });

  // Product / Project Cost:
  // "left amount is product cost. Mean sajjad, mamun, arvi, neuvix individuals income and their income is total profit and left is project cost"
  const totalCostExpected = Math.max(0, totalRevenue - totalPartnersExpected);
  const totalCostPaid = Math.max(0, totalRevenueCollected - totalPartnersPaid);

  const activeMetricTotal =
    selectedView === "expected" ? totalRevenue : totalRevenueCollected;
  const activePartnersTotal =
    selectedView === "expected" ? totalPartnersExpected : totalPartnersPaid;
  const activeCostTotal =
    selectedView === "expected" ? totalCostExpected : totalCostPaid;

  const profitMarginPercent =
    activeMetricTotal > 0
      ? ((activePartnersTotal / activeMetricTotal) * 100).toFixed(1)
      : "0";

  return (
    <div className="bg-card rounded-2xl border border-border p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header and View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              Profit & Team Distribution Chart
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tracking individual income for Neuvix, Sajjad, Mamun, and Arvi against project costs.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex bg-muted/60 p-1 rounded-xl self-start sm:self-auto border border-border/60">
          <button
            type="button"
            onClick={() => setSelectedView("expected")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              selectedView === "expected"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Expected Collection
          </button>
          <button
            type="button"
            onClick={() => setSelectedView("paid")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
              selectedView === "paid"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Paid / Realized
          </button>
        </div>
      </div>

      {/* Top High-Level Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Project Revenue */}
        <div className="p-4 rounded-xl border border-border bg-muted/20">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            {selectedView === "expected" ? "Total Pipeline Budget" : "Total Collected"}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-foreground mt-1 font-mono">
            ${activeMetricTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            {selectedView === "expected" ? "Total agreed project contract value" : "Collected from completed client milestones"}
          </p>
        </div>

        {/* Total Profit (Combined Partner Income) */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Total Profit (Income)
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600/10 text-emerald-700 dark:text-emerald-400">
              {profitMarginPercent}% Margin
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
            ${activePartnersTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Total income across Neuvix, Sajjad, Mamun & Arvi
          </p>
        </div>

        {/* Product / Project Cost */}
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Product & Project Cost
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-600/10 text-amber-700 dark:text-amber-400">
              Left Amount
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 font-mono">
            ${activeCostTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Budget remaining after partner profit shares
          </p>
        </div>
      </div>

      {/* Visual Proportional Bar Breakdown */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Distribution Breakdown
          </span>
          <span className="text-muted-foreground font-mono">
            {activeMetricTotal > 0 ? "100% of Total Revenue" : "No project budget recorded"}
          </span>
        </div>

        {/* Segmented Progress Bar */}
        <div className="h-6 w-full rounded-xl overflow-hidden bg-muted flex p-0.5 gap-0.5 border border-border">
          {activeMetricTotal > 0 ? (
            <>
              {partnerList.map((p) => {
                const val = selectedView === "expected" ? p.expected : p.paid;
                const widthPercent = (val / activeMetricTotal) * 100;
                if (widthPercent <= 0) return null;

                return (
                  <div
                    key={p.key}
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: p.color,
                    }}
                    title={`${p.name}: $${val.toFixed(2)} (${widthPercent.toFixed(1)}%)`}
                    className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-300 relative group cursor-pointer"
                  />
                );
              })}
              {/* Product Cost Segment */}
              {activeCostTotal > 0 && (
                <div
                  style={{
                    width: `${(activeCostTotal / activeMetricTotal) * 100}%`,
                    backgroundColor: "#f59e0b",
                  }}
                  title={`Product Cost (Left amount): $${activeCostTotal.toFixed(2)} (${((activeCostTotal / activeMetricTotal) * 100).toFixed(1)}%)`}
                  className="h-full first:rounded-l-lg last:rounded-r-lg transition-all duration-300 relative group cursor-pointer"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-[11px] text-muted-foreground">
              Add projects with budgets to visualize profit distribution
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          {partnerList.map((p) => (
            <div key={p.key} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: p.color }}
              />
              <span className="text-muted-foreground">{p.name}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-muted-foreground">Product Cost (Left)</span>
          </div>
        </div>
      </div>

      {/* Partner Cards: Sajjad, Mamun, Arvi, and Neuvix */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Individual Partners Income ({selectedView === "expected" ? "Expected" : "Paid"})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerList.map((partner) => {
            const activeAmount =
              selectedView === "expected" ? partner.expected : partner.paid;
            const percentOfProfit =
              activePartnersTotal > 0
                ? ((activeAmount / activePartnersTotal) * 100).toFixed(1)
                : "0";
            const percentOfTotal =
              activeMetricTotal > 0
                ? ((activeAmount / activeMetricTotal) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={partner.key}
                className={cn(
                  "p-4 rounded-xl border transition-all duration-150 flex flex-col justify-between space-y-3",
                  partner.bgLight,
                  partner.borderColor
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: partner.color }}
                      />
                      {partner.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-card/80 border border-border/80">
                      {percentOfProfit}% of profit
                    </span>
                  </div>

                  {/* Main Amount */}
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground block">
                      {selectedView === "expected" ? "Expected Income" : "Realized Income"}
                    </span>
                    <div className="text-xl font-bold text-foreground font-mono mt-0.5">
                      ${activeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Sub-breakdown (Expected vs Paid) */}
                <div className="pt-2.5 border-t border-border/60 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Expected:</span>
                    <span className="font-mono font-medium text-foreground">
                      ${partner.expected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Paid Collection:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      ${partner.paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Due Collection:</span>
                    <span className="font-mono font-medium text-amber-600 dark:text-amber-400">
                      ${partner.due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px] text-muted-foreground">
                    <span>% of Total Project:</span>
                    <span className="font-mono">{percentOfTotal}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Product Cost Explanatory Banner */}
      <div className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong className="text-foreground">Profit & Cost Formula:</strong> Total Revenue (${activeMetricTotal.toLocaleString()}) = Partners Profit (${activePartnersTotal.toLocaleString()}) + Left Product Cost (${activeCostTotal.toLocaleString()}).
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Profit: {profitMarginPercent}%
          </span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            Cost: {activeMetricTotal > 0 ? (100 - parseFloat(profitMarginPercent)).toFixed(1) : "0"}%
          </span>
        </div>
      </div>
    </div>
  );
}

