"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Mail, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMemberAction, updateMemberAction, deleteMemberAction } from "../actions";
import { TeamMember, Team, Role } from "./TeamClient";

export function MemberList({ members, teams, roles }: { members: TeamMember[], teams: Team[], roles: Role[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  
  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    phoneCountry: "+1",
    role_id: "",
    team_id: "",
  });

  const openNew = () => {
    setEditId(null);
    setMemberForm({
      name: "",
      email: "",
      phoneNumber: "",
      phoneCountry: "+1",
      role_id: "",
      team_id: "",
    });
    setIsOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditId(m.id);
    let c = "+1";
    let p = m.phone || "";
    if (p.includes(" ")) {
      const parts = p.split(" ");
      c = parts[0];
      p = parts[1];
    } else if (p.startsWith("+")) {
      const match = p.match(/^(\+\d{1,3})(.*)$/);
      if (match) {
        c = match[1];
        p = match[2];
      }
    }
    setMemberForm({
      name: m.name,
      email: m.email,
      phoneNumber: p,
      phoneCountry: c,
      role_id: m.role_id || "",
      team_id: m.team_id || "",
    });
    setIsOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = `${memberForm.phoneCountry} ${memberForm.phoneNumber}`;
    try {
      if (editId) {
        await updateMemberAction(editId, {
          name: memberForm.name,
          email: memberForm.email,
          phone,
          team_id: (memberForm.team_id || null) as unknown as string,
          role_id: (memberForm.role_id || null) as unknown as string,
        });
      } else {
        await addMemberAction({
          name: memberForm.name,
          email: memberForm.email,
          phone,
          team_id: (memberForm.team_id || null) as unknown as string,
          role_id: (memberForm.role_id || null) as unknown as string,
        });
      }
      setIsOpen(false);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    try {
      await deleteMemberAction(id);
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden lg:col-span-3">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Team Members</h2>
          <p className="text-sm text-slate-500 mt-1">Manage everyone in your agency</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500" onClick={openNew}><Plus className="w-4 h-4 mr-2" /> Add Member</Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editId ? "Edit Team Member" : "Add Team Member"}</DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <Input type="text" required value={memberForm.name} onChange={(e) => setMemberForm({...memberForm, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <Input type="email" required value={memberForm.email} onChange={(e) => setMemberForm({...memberForm, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-28">
                      <Select value={memberForm.phoneCountry} onValueChange={(val) => setMemberForm({...memberForm, phoneCountry: val as string})}>
                        <SelectTrigger><SelectValue placeholder="Code" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+1">US (+1)</SelectItem>
                          <SelectItem value="+44">UK (+44)</SelectItem>
                          <SelectItem value="+91">IN (+91)</SelectItem>
                          <SelectItem value="+880">BD (+880)</SelectItem>
                          <SelectItem value="+61">AU (+61)</SelectItem>
                          <SelectItem value="+49">DE (+49)</SelectItem>
                          <SelectItem value="+33">FR (+33)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Input type="tel" required pattern="[0-9]{7,15}" value={memberForm.phoneNumber} onChange={(e) => setMemberForm({...memberForm, phoneNumber: e.target.value.replace(/[^0-9]/g, '')})} className="flex-1" placeholder="1234567890" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Team</label>
                    <Select value={memberForm.team_id} onValueChange={(val) => setMemberForm({...memberForm, team_id: val as string})}>
                      <SelectTrigger><span className={memberForm.team_id ? "text-slate-900" : "text-slate-500"}>{memberForm.team_id ? teams.find(t => t.id === memberForm.team_id)?.name || "Select Team" : "Select Team"}</span></SelectTrigger>
                      <SelectContent>
                        {teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                    <Select value={memberForm.role_id} onValueChange={(val) => setMemberForm({...memberForm, role_id: val as string})}>
                      <SelectTrigger><span className={memberForm.role_id ? "text-slate-900" : "text-slate-500"}>{memberForm.role_id ? roles.find(r => r.id === memberForm.role_id)?.name || "Select Role" : "Select Role"}</span></SelectTrigger>
                      <SelectContent>
                        {roles.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-500">Save</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-slate-200">
            <TableRow>
              <TableHead className="py-4 px-6 font-semibold text-slate-700">Member</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-slate-700">Contact</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-slate-700">Team</TableHead>
              <TableHead className="py-4 px-6 font-semibold text-slate-700">Role</TableHead>
              <TableHead className="py-4 px-6 text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No team members</h3>
                    <p className="mt-1 text-sm text-slate-500">Get started by adding a new member.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id} className="hover:bg-slate-50/50">
                  <TableCell className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                        <span className="text-indigo-700 font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="font-medium text-slate-900">{member.name}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <a href={`mailto:${member.email}`} className="hover:text-indigo-600 hover:underline">
                          {member.email}
                        </a>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      {member.teams?.name || "No Team"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                      {member.roles?.name || "No Role"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(member)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
