"use client";

import React, { useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Users,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  addMemberAction,
  updateMemberAction,
  deleteMemberAction,
} from "../actions";
import { TeamMember, Team, Role, AuthUser } from "./TeamClient";
import { CountryCodeSelect } from "@/components/ui/country-code-select";
import { PageHeader } from "@/components/ui/page-header";

export function MemberList({
  members,
  teams,
  roles,
  authUsers,
  activeTab,
  setActiveTab,
  currentUserAccessLevel,
}: {
  members: TeamMember[];
  teams: Team[];
  roles: Role[];
  authUsers: AuthUser[];
  activeTab: "members" | "auth";
  setActiveTab: (val: "members" | "auth") => void;
  currentUserAccessLevel: "admin" | "manager" | "member";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [memberForm, setMemberForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    phoneCountry: "+1",
    role_id: "",
    team_id: "",
    access_level: "member",
  });

  const [emailReadOnly, setEmailReadOnly] = useState(false);

  // Custom alert / confirm dialog state
  const [alertDialog, setAlertDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const showAlert = (title: string, message: string) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      isConfirm: false,
      onConfirm: () => setAlertDialog((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
  ) => {
    setAlertDialog({
      isOpen: true,
      title,
      message,
      isConfirm: true,
      onConfirm: () => {
        onConfirm();
        setAlertDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const openNew = (
    defaultEmail = "",
    defaultName = "",
    isUpdate = false,
    existingId: string | null = null,
  ) => {
    setEditId(existingId);
    setEmailReadOnly(!!defaultEmail);
    setMemberForm({
      name: defaultName,
      email: defaultEmail,
      phoneNumber: "",
      phoneCountry: "+1",
      role_id: "",
      team_id: "",
      access_level: "member",
    });
    setIsOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditId(m.id);
    setEmailReadOnly(true);
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
      access_level: m.access_level || "member",
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
          access_level: memberForm.access_level,
        });
      } else {
        await addMemberAction({
          name: memberForm.name,
          email: memberForm.email,
          phone,
          team_id: (memberForm.team_id || null) as unknown as string,
          role_id: (memberForm.role_id || null) as unknown as string,
          access_level: memberForm.access_level,
        });
      }
      setIsOpen(false);
    } catch (err: unknown) {
      showAlert("Error", (err as Error).message);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm(
      "Delete Member",
      "Are you sure you want to delete this team member? This action cannot be undone.",
      async () => {
        try {
          await deleteMemberAction(id);
        } catch (err: unknown) {
          showAlert("Error", (err as Error).message);
        }
      },
    );
  };

  const showActionsColumn = currentUserAccessLevel !== "member";

  return (
    <div className="max-w-7xl mx-auto overflow-hidden lg:col-span-3">
      {/* Custom Alert/Confirm Dialog */}
      <Dialog
        open={alertDialog.isOpen}
        onOpenChange={(open) =>
          setAlertDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle
                className={`w-5 h-5 ${alertDialog.isConfirm ? "text-amber-500" : "text-red-500"}`}
              />
              {alertDialog.title}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">{alertDialog.message}</div>
          <DialogFooter>
            {alertDialog.isConfirm && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setAlertDialog((prev) => ({ ...prev, isOpen: false }))
                }
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              className={
                alertDialog.isConfirm
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }
              onClick={alertDialog.onConfirm}
            >
              {alertDialog.isConfirm ? "Confirm" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-6">
        <PageHeader 
          title="Teams & Members"
          subtitle="Manage your organization's teams, roles, and staff members."
          action={
            <div className="flex flex-col md:flex-row items-center gap-4">
          {currentUserAccessLevel !== "member" && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "members"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Team Members
              </button>
              <button
                onClick={() => setActiveTab("auth")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "auth"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Auth Users
              </button>
            </div>
          )}
          {activeTab === "members" && currentUserAccessLevel !== "member" && (
            <Button
              className="bg-indigo-600 hover:bg-indigo-500"
              onClick={() => openNew()}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          )}
        </div>
          }
        />
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Edit Team Member" : "Add Team Member"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  required
                  value={memberForm.email}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, email: e.target.value })
                  }
                  placeholder="john@example.com"
                  disabled={emailReadOnly}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <CountryCodeSelect
                    value={memberForm.phoneCountry}
                    onChange={(val) =>
                      setMemberForm({ ...memberForm, phoneCountry: val })
                    }
                  />
                  <Input
                    type="tel"
                    required
                    pattern="[0-9]{7,15}"
                    value={memberForm.phoneNumber}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        phoneNumber: e.target.value.replace(/[^0-9]/g, ""),
                      })
                    }
                    className="flex-1"
                    placeholder="1234567890"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Team
                  </label>
                  <Select
                    value={memberForm.team_id}
                    onValueChange={(val) =>
                      setMemberForm({ ...memberForm, team_id: val as string })
                    }
                  >
                    <SelectTrigger>
                      <span
                        className={
                          memberForm.team_id
                            ? "text-slate-900"
                            : "text-slate-500"
                        }
                      >
                        {memberForm.team_id
                          ? teams.find((t) => t.id === memberForm.team_id)
                              ?.name || "Select Team"
                          : "Select Team"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <Select
                    value={memberForm.role_id}
                    onValueChange={(val) =>
                      setMemberForm({ ...memberForm, role_id: val as string })
                    }
                  >
                    <SelectTrigger>
                      <span
                        className={
                          memberForm.role_id
                            ? "text-slate-900"
                            : "text-slate-500"
                        }
                      >
                        {memberForm.role_id
                          ? roles.find((r) => r.id === memberForm.role_id)
                              ?.name || "Select Role"
                          : "Select Role"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {currentUserAccessLevel === "admin" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Access Level
                  </label>
                  <Select
                    value={memberForm.access_level}
                    onValueChange={(val) =>
                      setMemberForm({
                        ...memberForm,
                        access_level: val as string,
                      })
                    }
                  >
                    <SelectTrigger>
                      <span className="text-slate-900 capitalize">
                        {memberForm.access_level}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto px-6">
        {activeTab === "members" || currentUserAccessLevel === "member" ? (
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Member
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Contact
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Team / Role
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Access
                </TableHead>
                {showActionsColumn && (
                  <TableHead className="py-4 px-6 text-right font-semibold text-slate-700">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showActionsColumn ? 5 : 4}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300 mb-3" />
                      <h3 className="text-sm font-medium text-slate-900">
                        No team members
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Get started by adding a new member.
                      </p>
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
                        <div className="font-medium text-slate-900">
                          {member.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a
                            href={`mailto:${member.email}`}
                            className="hover:text-indigo-600 hover:underline"
                          >
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
                      <div className="flex flex-col gap-2 items-start">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {member.teams?.name || "No Team"}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                          {member.roles?.name || "No Role"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-slate-200 text-slate-700 capitalize">
                        {member.access_level || "member"}
                      </span>
                    </TableCell>
                    {showActionsColumn && (
                      <TableCell className="px-6 text-right">
                        <div className="flex justify-end gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(member)}
                            className="text-slate-400 hover:text-indigo-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          {currentUserAccessLevel === "admin" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(member.id)}
                              className="text-slate-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Name
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-700">
                  Email
                </TableHead>
                <TableHead className="py-4 px-6 font-semibold text-slate-700 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {authUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-12 h-12 text-slate-300 mb-3" />
                      <h3 className="text-sm font-medium text-slate-900">
                        No auth users found
                      </h3>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                authUsers.map((user) => {
                  const existingMember = members.find(
                    (m) => m.email === user.email,
                  );
                  const isMissingInfo =
                    existingMember &&
                    (!existingMember.team_id ||
                      !existingMember.role_id ||
                      !existingMember.phone);

                  return (
                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                      <TableCell className="px-6 font-medium text-slate-900">
                        {user.name || "N/A"}
                      </TableCell>
                      <TableCell className="px-6 text-slate-600">
                        {user.email}
                      </TableCell>
                      <TableCell className="px-6 text-right">
                        {existingMember && !isMissingInfo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            In Team
                          </span>
                        ) : existingMember && isMissingInfo ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                            onClick={() => openEdit(existingMember)}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Update
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openNew(user.email, user.name || "")}
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add to Team
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
