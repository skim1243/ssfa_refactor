import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { AdminApplicationsTable } from '@/app/components/AdminApplicationsTable'

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

  const { data: applications, error } = await supabase.from('Applications').select('*')

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
        <p className="text-sm text-gray-600">Manage all submitted application rows.</p>
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