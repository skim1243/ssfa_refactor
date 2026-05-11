import { redirect } from 'next/navigation'
import { AdminApplicationsTable } from '@/app/components/AdminApplicationsTable'
import { runGlobalApplicationCycleSync } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

// Loads all applications for admins and renders the management table view.
export default async function AdminApplicationsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/staff-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'admin') {
    redirect('/auth-error')
  }

  await runGlobalApplicationCycleSync(supabase)

  const { data: applications, error } = await supabase.from('Applications').select('*')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-600">
          Filter and review application rows. Row actions delete <strong>that application only</strong> (by id); the
          applicant account stays. To remove an Auth user and all their applications, use the Users admin page.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load applications: {error.message}
        </div>
      ) : (
        <AdminApplicationsTable applications={(applications ?? []) as Record<string, unknown>[]} />
      )}
    </div>
  )
}