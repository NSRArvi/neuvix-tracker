import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUserAccessLevel } from '@/lib/auth'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import { MobileNavProvider } from '@/components/dashboard/MobileNavContext'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const accessLevel = await getCurrentUserAccessLevel()

  const userEmail = user.email ?? 'admin@neuvix.io'
  const userName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    userEmail.split('@')[0]
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-white text-slate-800 flex font-sans antialiased overflow-x-hidden">
        {/* Left Sidebar (fixed on desktop, drawer on mobile/tablet) */}
        <Sidebar
          user={{
            name: userName,
            email: userEmail,
            avatarUrl,
          }}
        />

        {/* Right Content Area */}
        <div className="flex-1 w-full min-w-0 lg:ml-64 flex flex-col min-h-screen bg-white">
          <Header accessLevel={accessLevel} />
          <main className="p-4 sm:p-6 lg:p-8 flex-1 w-full min-w-0">{children}</main>
        </div>
      </div>
    </MobileNavProvider>
  )
}
