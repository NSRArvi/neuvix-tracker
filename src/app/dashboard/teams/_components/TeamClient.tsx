"use client";

import React from "react";
import { TeamList } from "./TeamList";
import { RoleList } from "./RoleList";
import { MemberList } from "./MemberList";

export type Team = { id: string; name: string };
export type Role = { id: string; name: string };
export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
  team_id: string;
  roles?: { name: string } | null;
  teams?: { name: string } | null;
};

interface TeamClientProps {
  initialTeams: Team[];
  initialRoles: Role[];
  initialMembers: TeamMember[];
}

export default function TeamClient({ initialTeams, initialRoles, initialMembers }: TeamClientProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <TeamList teams={initialTeams} />
        <RoleList roles={initialRoles} />
      </div>
      <div className="lg:col-span-3">
        <MemberList members={initialMembers} teams={initialTeams} roles={initialRoles} />
      </div>
    </div>
  );
}
