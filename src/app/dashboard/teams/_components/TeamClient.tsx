"use client";

import React, { useState } from "react";
import { Users, Shield, UserCheck, KeyRound } from "lucide-react";
import { TeamList } from "./TeamList";
import { RoleList } from "./RoleList";
import { MemberList } from "./MemberList";
import { cn } from "@/lib/utils";

export type Team = { id: string; name: string };
export type Role = { id: string; name: string };
export type AuthUser = { id: string; name: string; email: string };
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
  team_id: string;
  access_level: "admin" | "manager" | "member";
  roles?: { name: string } | null;
  teams?: { name: string } | null;
};

interface TeamClientProps {
  initialTeams: Team[];
  initialRoles: Role[];
  initialMembers: TeamMember[];
  initialAuthUsers: AuthUser[];
  currentUserAccessLevel: "admin" | "manager" | "member";
}

type TabType = "members" | "auth" | "teams" | "roles";

export default function TeamClient({
  initialTeams,
  initialRoles,
  initialMembers,
  initialAuthUsers,
  currentUserAccessLevel,
}: TeamClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("members");

  const isAdmin = currentUserAccessLevel === "admin";
  const isManagerOrAdmin = currentUserAccessLevel !== "member";

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    {
      id: "members",
      label: "Team Members",
      icon: UserCheck,
      count: initialMembers.length,
    },
    ...(isManagerOrAdmin
      ? [
          {
            id: "auth" as TabType,
            label: "Auth Users",
            icon: KeyRound,
            count: initialAuthUsers.length,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            id: "teams" as TabType,
            label: "Teams",
            icon: Users,
            count: initialTeams.length,
          },
          {
            id: "roles" as TabType,
            label: "Roles",
            icon: Shield,
            count: initialRoles.length,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Top Tab Switcher */}
      <div className="bg-muted/40 p-1.5 rounded-2xl border border-border">
        <nav
          className={cn(
            "grid gap-1.5",
            tabs.length === 4
              ? "grid-cols-2 sm:grid-cols-4"
              : tabs.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : tabs.length === 2
              ? "grid-cols-2"
              : "grid-cols-1"
          )}
          aria-label="Teams Management Tabs"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-card text-foreground shadow-xs border border-border/80 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span className="truncate">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0",
                      isActive
                        ? "bg-primary/15 text-primary font-bold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Panes */}
      <div>
        {(activeTab === "members" || activeTab === "auth") && (
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <MemberList
              members={initialMembers}
              teams={initialTeams}
              roles={initialRoles}
              authUsers={initialAuthUsers}
              activeTab={activeTab}
              setActiveTab={(tab) => setActiveTab(tab)}
              currentUserAccessLevel={currentUserAccessLevel}
            />
          </div>
        )}

        {isAdmin && activeTab === "teams" && (
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <TeamList teams={initialTeams} />
          </div>
        )}

        {isAdmin && activeTab === "roles" && (
          <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden">
            <RoleList roles={initialRoles} />
          </div>
        )}
      </div>
    </div>
  );
}
