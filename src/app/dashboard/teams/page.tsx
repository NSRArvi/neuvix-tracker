"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2, Users, Shield, Phone, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Types
type Team = { id: string; name: string };
type Role = { id: string; name: string };
type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role_id: string;
  team_id: string;
  roles?: { name: string };
  teams?: { name: string };
};

export default function TeamsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Data states
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  // Edit states
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  // Form states
  const [newTeamName, setNewTeamName] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phoneCountry: "+1",
    phoneNumber: "",
    role_id: "",
    team_id: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchAllData = async () => {
      const [teamsRes, rolesRes, membersRes] = await Promise.all([
        supabase.from("teams").select("*").order("created_at", { ascending: false }),
        supabase.from("roles").select("*").order("created_at", { ascending: false }),
        supabase.from("team_members").select("*, roles(name), teams(name)").order("created_at", { ascending: false }),
      ]);

      if (isMounted) {
        if (teamsRes.data) setTeams(teamsRes.data);
        if (rolesRes.data) setRoles(rolesRes.data);
        if (membersRes.data) setMembers(membersRes.data);
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  // Handlers
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    if (editTeamId) {
      const { data, error } = await supabase.from("teams").update({ name: newTeamName }).eq("id", editTeamId).select();
      if (!error && data) {
        setTeams(teams.map(t => t.id === editTeamId ? data[0] : t));
        setNewTeamName("");
        setIsTeamModalOpen(false);
        setEditTeamId(null);
      }
    } else {
      const { data, error } = await supabase.from("teams").insert([{ name: newTeamName }]).select();
      if (!error && data) {
        setTeams([data[0], ...teams]);
        setNewTeamName("");
        setIsTeamModalOpen(false);
      }
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    if (editRoleId) {
      const { data, error } = await supabase.from("roles").update({ name: newRoleName }).eq("id", editRoleId).select();
      if (!error && data) {
        setRoles(roles.map(r => r.id === editRoleId ? data[0] : r));
        setNewRoleName("");
        setIsRoleModalOpen(false);
        setEditRoleId(null);
      }
    } else {
      const { data, error } = await supabase.from("roles").insert([{ name: newRoleName }]).select();
      if (!error && data) {
        setRoles([data[0], ...roles]);
        setNewRoleName("");
        setIsRoleModalOpen(false);
      }
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${memberForm.phoneCountry} ${memberForm.phoneNumber}`;
    
    if (editMemberId) {
      const { data, error } = await supabase.from("team_members").update({
        name: memberForm.name,
        email: memberForm.email,
        phone: fullPhone,
        role_id: memberForm.role_id,
        team_id: memberForm.team_id,
      }).eq("id", editMemberId).select("*, roles(name), teams(name)");

      if (!error && data) {
        setMembers(members.map(m => m.id === editMemberId ? data[0] : m));
        setMemberForm({ name: "", email: "", phoneCountry: "+1", phoneNumber: "", role_id: "", team_id: "" });
        setIsMemberModalOpen(false);
        setEditMemberId(null);
      }
    } else {
      const { data, error } = await supabase.from("team_members").insert([{
        name: memberForm.name,
        email: memberForm.email,
        phone: fullPhone,
        role_id: memberForm.role_id,
        team_id: memberForm.team_id,
      }]).select("*, roles(name), teams(name)");

      if (!error && data) {
        setMembers([data[0], ...members]);
        setMemberForm({ name: "", email: "", phoneCountry: "+1", phoneNumber: "", role_id: "", team_id: "" });
        setIsMemberModalOpen(false);
      }
    }
  };

  const openEditTeam = (t: Team) => {
    setEditTeamId(t.id);
    setNewTeamName(t.name);
    setIsTeamModalOpen(true);
  };

  const openEditRole = (r: Role) => {
    setEditRoleId(r.id);
    setNewRoleName(r.name);
    setIsRoleModalOpen(true);
  };

  const openEditMember = (m: TeamMember) => {
    setEditMemberId(m.id);
    const splitPhone = m.phone.split(" ");
    const phoneCountry = splitPhone.length > 1 ? splitPhone[0] : "+1";
    const phoneNumber = splitPhone.length > 1 ? splitPhone[1] : m.phone;
    
    setMemberForm({
      name: m.name,
      email: m.email,
      phoneCountry,
      phoneNumber,
      role_id: m.role_id || "",
      team_id: m.team_id || "",
    });
    setIsMemberModalOpen(true);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) return;
    await supabase.from("team_members").delete().eq("id", id);
    setMembers(members.filter((m) => m.id !== id));
  };

  const deleteTeam = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete team "${name}"?`)) return;
    const { error } = await supabase.from("teams").delete().eq("id", id);
    if (!error) {
      setTeams(teams.filter((t) => t.id !== id));
    } else {
      alert("Failed to delete team. Make sure no members are assigned.");
    }
  };

  const deleteRole = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete role "${name}"?`)) return;
    const { error } = await supabase.from("roles").delete().eq("id", id);
    if (!error) {
      setRoles(roles.filter((r) => r.id !== id));
    } else {
      alert("Failed to delete role. Make sure no members are assigned.");
    }
  };

  const inputClass = "block w-full rounded-md border-0 py-2 px-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6";

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams & Members</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your organization&apos;s teams, roles, and staff members.
          </p>
        </div>
        <button
          onClick={() => {
            setEditMemberId(null);
            setMemberForm({ name: "", email: "", phoneCountry: "+1", phoneNumber: "", role_id: "", team_id: "" });
            setIsMemberModalOpen(true);
          }}
          className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <Plus className="-ml-0.5 h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Teams Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" />
              Teams
            </h2>
            <button
              onClick={() => {
                setEditTeamId(null);
                setNewTeamName("");
                setIsTeamModalOpen(true);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Team
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {teams.length === 0 && <span className="text-sm text-slate-400">No teams created.</span>}
            {teams.map((t) => (
              <div key={t.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                <span>{t.name}</span>
                <button onClick={() => openEditTeam(t)} className="text-slate-400 hover:text-indigo-600 transition-colors ml-1" title="Edit Team">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteTeam(t.id, t.name)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete Team">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Roles Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Roles
            </h2>
            <button
              onClick={() => {
                setEditRoleId(null);
                setNewRoleName("");
                setIsRoleModalOpen(true);
              }}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
            >
              <Plus className="h-4 w-4 mr-1" /> Add Role
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.length === 0 && <span className="text-sm text-slate-400">No roles created.</span>}
            {roles.map((r) => (
              <div key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                <span>{r.name}</span>
                <button onClick={() => openEditRole(r)} className="text-indigo-400 hover:text-indigo-700 transition-colors ml-1" title="Edit Role">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteRole(r.id, r.name)} className="text-indigo-400 hover:text-red-500 transition-colors" title="Delete Role">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold leading-6 text-slate-900">Team Members List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Team</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">Loading data...</td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">No team members found.</td></tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-500 flex items-center gap-2 mb-1"><Mail className="w-3 h-3" /> {member.email}</div>
                      <div className="text-sm text-slate-500 flex items-center gap-2"><Phone className="w-3 h-3" /> {member.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {member.teams?.name || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                        {member.roles?.name || "No Role"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditMember(member)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteMember(member.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editTeamId ? "Edit Team" : "Add New Team"}</h3>
              <button onClick={() => setIsTeamModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
                <input type="text" required value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} className={inputClass} placeholder="e.g. Design Team" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTeamModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm">Save Team</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editRoleId ? "Edit Role" : "Add New Role"}</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddRole} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role Name</label>
                <input type="text" required value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className={inputClass} placeholder="e.g. Senior Developer" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm">Save Role</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{editMemberId ? "Edit Team Member" : "Add Team Member"}</h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-400 hover:text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" required value={memberForm.name} onChange={(e) => setMemberForm({...memberForm, name: e.target.value})} className={inputClass} placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" required value={memberForm.email} onChange={(e) => setMemberForm({...memberForm, email: e.target.value})} className={inputClass} placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <select 
                    value={memberForm.phoneCountry} 
                    onChange={(e) => setMemberForm({...memberForm, phoneCountry: e.target.value})} 
                    className="block w-24 rounded-md border-0 py-2 pl-3 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="+1">US (+1)</option>
                    <option value="+44">UK (+44)</option>
                    <option value="+91">IN (+91)</option>
                    <option value="+880">BD (+880)</option>
                    <option value="+61">AU (+61)</option>
                    <option value="+49">DE (+49)</option>
                    <option value="+33">FR (+33)</option>
                  </select>
                  <input type="tel" required pattern="[0-9]{7,15}" title="Please enter a valid phone number (digits only, no spaces)" value={memberForm.phoneNumber} onChange={(e) => setMemberForm({...memberForm, phoneNumber: e.target.value.replace(/[^0-9]/g, '')})} className={`flex-1 ${inputClass}`} placeholder="1234567890" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
                  <select required value={memberForm.team_id} onChange={(e) => setMemberForm({...memberForm, team_id: e.target.value})} className={inputClass}>
                    <option value="">Select Team</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select required value={memberForm.role_id} onChange={(e) => setMemberForm({...memberForm, role_id: e.target.value})} className={inputClass}>
                    <option value="">Select Role</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsMemberModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm">Save Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
