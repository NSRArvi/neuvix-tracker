/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Users, Plus, Trash2, X, ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface TeamItem {
  name: string;
  budget: string;
  members: string[];
}

interface ProjectTeamsTabProps {
  teams: TeamItem[];
  dbTeams: { id: string; name: string }[];
  allMembers: { id: string; name: string; team_id?: string }[];
  addTeam: () => void;
  removeTeam: (index: number) => void;
  handleTeamChange: (index: number, field: string, value: string | any) => void;
  addTeamMember: (teamIndex: number, memberId: string) => void;
  removeTeamMember: (teamIndex: number, memberIndex: number) => void;
}

export function ProjectTeamsTab({
  teams,
  dbTeams = [],
  allMembers = [],
  addTeam,
  removeTeam,
  handleTeamChange,
  addTeamMember,
  removeTeamMember,
}: ProjectTeamsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Teams
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Allocate budgets to teams and assign specific team members.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTeam}
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Team
        </Button>
      </div>

      <div className="space-y-4">
        {teams.map((team: any, index: number) => (
          <div
            key={index}
            className="flex items-start gap-3 p-5 rounded-xl border border-border bg-card shadow-xs"
          >
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Team Name
                  </label>
                  <Select
                    value={team.name}
                    onValueChange={(val) =>
                      handleTeamChange(index, "name", val as string)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <span
                        className={
                          team.name ? "text-foreground" : "text-muted-foreground"
                        }
                      >
                        {team.name || "Select Team"}
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      {dbTeams.map((t) => (
                        <SelectItem key={t.id} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-muted-foreground">
                    Team Budget ($)
                  </label>
                  <Input
                    type="number"
                    value={team.budget}
                    onChange={(e) =>
                      handleTeamChange(index, "budget", e.target.value)
                    }
                    placeholder="0.00"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2">
                  Team Members
                </label>
                {team.members.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {team.members.map((memberId: string, mIdx: number) => {
                      const m = allMembers.find((item) => item.id === memberId);
                      if (!m) return null;
                      return (
                        <span
                          key={mIdx}
                          className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {m.name}
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index, mIdx)}
                            className="hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                <Popover>
                  <PopoverTrigger
                    render={
                      <Button
                        variant="outline"
                        role="combobox"
                        type="button"
                        className="w-full justify-between font-normal rounded-lg border-input px-3 h-9 text-muted-foreground hover:text-foreground text-sm"
                      />
                    }
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3.5 w-3.5" /> Add member...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[280px]" align="start">
                    <Command>
                      <CommandInput placeholder="Search team members..." />
                      <CommandList>
                        <CommandEmpty>No member found.</CommandEmpty>
                        <CommandGroup>
                          {(() => {
                            const selectedTeamData = dbTeams.find(
                              (t) => t.name === team.name
                            );
                            const filteredMembers = selectedTeamData
                              ? allMembers.filter(
                                  (m) => m.team_id === selectedTeamData.id
                                )
                              : allMembers;

                            if (filteredMembers.length === 0) {
                              return (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No members in this team.
                                </div>
                              );
                            }

                            return filteredMembers.map((m) => (
                              <CommandItem
                                key={m.id}
                                value={m.name}
                                onSelect={() => addTeamMember(index, m.id)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    team.members.includes(m.id)
                                      ? "opacity-100 text-primary"
                                      : "opacity-0"
                                  )}
                                />
                                {m.name}
                              </CommandItem>
                            ));
                          })()}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeTeam(index)}
              disabled={teams.length === 1}
              className="mt-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Remove team"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

