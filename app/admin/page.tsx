import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'

export default async function AdminPortal() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/staff-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'admin') {
    redirect('/auth-error')
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Portal</h1>
      <p className="text-gray-600">Dashboard</p>
    </div>
  )
}
