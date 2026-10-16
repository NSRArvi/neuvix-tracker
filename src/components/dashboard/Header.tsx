'use client'

import { Search, Bell, Plus, Menu } from 'lucide-react'
import Link from 'next/link'
import { useMobileNav } from './MobileNavContext'

export default function Header({ accessLevel = 'member' }: { accessLevel?: string | null }) {
  const { toggle } = useMobileNav()

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md mr-2">
        {/* Mobile / Tablet Drawer Toggle Button */}
        <button
          type="button"
          onClick={toggle}
          aria-label="Open navigation menu"
          className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-xs sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects, tasks, clients..."
            className="w-full pl-9 pr-3 sm:pr-4 py-2 rounded-xl bg-slate-100/70 border border-transparent focus:bg-white focus:border-indigo-400 focus:outline-none text-xs text-slate-700 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">New Project</span>
              <span className="sm:hidden">New</span>
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
