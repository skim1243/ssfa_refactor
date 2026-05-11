import { redirect } from 'next/navigation'
import { ApplicantNoCurrentCycleNotice } from '@/app/components/ApplicantNoCurrentCycleNotice'
import { ApplicantApplicationsTable } from '@/app/components/ApplicantApplicationsTable'
import { ApplicantPortalDirectoryMenu } from '@/app/components/ApplicantPortalDirectoryMenu'
import { findCurrentRunningCycle, type ApplicationCycleRow } from '@/app/lib/application-cycle-helpers'
import { runApplicantPortalLifecycle } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

export default async function ApplicantArchivePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/applicant-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'applicant') {
    redirect('/auth-error')
  }

  await runApplicantPortalLifecycle(supabase, user.id, user.email?.trim() ?? '')

  const { data: cyclesRaw } = await supabase.from('applicationCycle').select('*')
  const cycles = (cyclesRaw ?? []) as ApplicationCycleRow[]
  const hasActiveCycle = findCurrentRunningCycle(cycles, Date.now()) != null

  const { data: applicationsRaw, error: applicationsError } = await supabase
    .from('Applications')
    .select('*')
    .eq('user_id', user.id)

  const applications = (applicationsRaw ?? []) as Record<string, unknown>[]

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section
          className="relative min-h-[180px] p-10 text-white shadow-md md:min-h-[220px] md:p-12"
          style={{ backgroundColor: 'var(--color-blue)' }}
        >
          <div className="absolute right-4 top-4">
            <ApplicantPortalDirectoryMenu />
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">Application portal directory</h1>
          <p className="mt-3 max-w-2xl text-base text-white/90 md:text-lg">
            This is your home as an applicant. Every application record is listed below. Open one to
            load that entry in the application workspace. When a cycle is open, use Application
            workspace in the menu for the default current application.
          </p>
        </section>

        {!hasActiveCycle ? (
          <ApplicantNoCurrentCycleNotice embedded showApplicantLoginLink={false} />
        ) : null}

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-gray-900">All application records</h2>
          {applicationsError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Failed to load applications: {applicationsError.message}
            </div>
          ) : (
            <ApplicantApplicationsTable applications={applications} selectedApplicationId={null} />
          )}
        </section>
      </div>
    </main>
  )
}
