"use client";

import React, { useState } from "react";
import { TeamList } from "./TeamList";
import { RoleList } from "./RoleList";
import { MemberList } from "./MemberList";

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
  access_level: 'admin' | 'manager' | 'member';
  roles?: { name: string } | null;
  teams?: { name: string } | null;
};

interface TeamClientProps {
  initialTeams: Team[];
  initialRoles: Role[];
  initialMembers: TeamMember[];
  initialAuthUsers: AuthUser[];
  currentUserAccessLevel: 'admin' | 'manager' | 'member';
}

export default function TeamClient({ initialTeams, initialRoles, initialMembers, initialAuthUsers, currentUserAccessLevel }: TeamClientProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'auth'>('members');

  return (
    <div className={`grid grid-cols-1 ${currentUserAccessLevel === 'admin' ? 'lg:grid-cols-4 gap-6' : ''}`}>
      {currentUserAccessLevel === 'admin' && (
        <div className="lg:col-span-1 space-y-6">
          <TeamList teams={initialTeams} />
          <RoleList roles={initialRoles} />
        </div>
      )}

      <div className={currentUserAccessLevel === 'admin' ? "lg:col-span-3" : "w-full"}>
        <MemberList 
          members={initialMembers} 
          teams={initialTeams} 
          roles={initialRoles} 
          authUsers={initialAuthUsers}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUserAccessLevel={currentUserAccessLevel}
        />
      </div>
    </div>
  );
}
