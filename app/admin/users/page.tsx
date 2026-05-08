import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'
import { AdminUsersTable, type AdminUserRow } from '@/app/components/AdminUsersTable'

export default async function AdminUsersPage() {
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

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-600">Manage Auth accounts and roles.</p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Set <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> on the server to load the
          user list and perform deletes or role changes.
        </div>
      </div>
    )
  }

  const authUsers: { id: string; email?: string | null }[] = []
  let page = 1
  const perPage = 1000
  const maxPages = 50
  while (page <= maxPages) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) {
      return (
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <p className="text-sm text-gray-600">Manage Auth accounts and roles.</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Failed to list Auth users: {error.message}
          </div>
        </div>
      )
    }
    const batch = data?.users ?? []
    for (const u of batch) {
      authUsers.push({ id: u.id, email: u.email })
    }
    if (batch.length < perPage) break
    page += 1
  }

  const { data: roleRows, error: rolesError } = await admin.from('user_roles').select('user, role')

  if (rolesError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-600">Manage Auth accounts and roles.</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load roles: {rolesError.message}
        </div>
      </div>
    )
  }

  const roleByUserId = new Map<string, string>()
  for (const r of roleRows ?? []) {
    const uid = typeof r.user === 'string' ? r.user : null
    const role = typeof r.role === 'string' ? r.role : null
    if (uid && role) roleByUserId.set(uid, role)
  }

  const rows: AdminUserRow[] = authUsers.map((u) => ({
    id: u.id,
    email: u.email?.trim() || '',
    role: roleByUserId.get(u.id) ?? null,
  }))

  rows.sort((a, b) => {
    const ae = a.email || a.id
    const be = b.email || b.id
    return ae.localeCompare(be, undefined, { sensitivity: 'base' })
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-600">
          Search by UUID, email, or role. Update roles or delete a user. For applicants (or anyone with an application
          row), document buckets are cleared before the application and Auth user are removed.
        </p>
      </div>
      <AdminUsersTable users={rows} />
    </div>
  )
}
