'use client'

import { Search, Bell, Plus } from 'lucide-react'
import Link from 'next/link'

export default function Header({ accessLevel = 'member' }: { accessLevel?: string }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100/70 border border-transparent focus:bg-white focus:border-indigo-400 focus:outline-none text-xs text-slate-700 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>
        {accessLevel !== 'member' && (
          <>
            <div className="h-4 w-px bg-slate-200" />
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
