import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { ApplicantApplicationsTable } from '@/app/components/ApplicantApplicationsTable'
import { ApplicantArchiveMenu } from '@/app/components/ApplicantArchiveMenu'
import { syncApplicationCycleStatuses } from '@/app/lib/application-cycle-helpers'

export default async function ApplicantArchivePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/applicant-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('"user"', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'applicant') {
    redirect('/auth-error')
  }

  await syncApplicationCycleStatuses(supabase)

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
            <ApplicantArchiveMenu />
          </div>
          <h1 className="text-4xl font-bold md:text-5xl">Application archive</h1>
        </section>

        <section className="flex flex-col gap-3">
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
