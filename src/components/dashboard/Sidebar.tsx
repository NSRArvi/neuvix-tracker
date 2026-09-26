"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  CheckSquare,
  Users,
  FolderKanban,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface SidebarProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  };

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      name: "Messages",
      href: "/dashboard/messages",
      icon: MessageSquare,
      badge: "3",
    },
    {
      name: "Projects",
      href: "/dashboard/projects",
      icon: FolderKanban,
      badge: null,
    },
    {
      name: "Planner",
      href: "/dashboard/planner",
      icon: CalendarDays,
      badge: null,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: CheckSquare,
      badge: null,
    },
    {
      name: "Teams",
      href: "/dashboard/teams",
      icon: Users,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-30">
      <div>
        {/* Workspace / Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
              N
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                Neuvix
              </span>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Agency CRM
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>

          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                <span>{item.name}</span>

                {item.badge && (
                  <span
                    className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                      isActive
                        ? "bg-indigo-100/70 text-indigo-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isActive && !item.badge && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm shadow-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50/80 text-xs font-semibold border border-transparent hover:border-rose-200 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
