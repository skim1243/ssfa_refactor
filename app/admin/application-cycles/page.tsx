import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { AdminApplicationCyclesTable } from '@/app/components/AdminApplicationCyclesTable'
import { AdminCreateApplicationCycleForm } from '@/app/components/AdminCreateApplicationCycleForm'
import { CurrentApplicationCycleBanner } from '@/app/components/CurrentApplicationCycleBanner'
import {
  findCurrentRunningCycle,
  syncApplicationCycleStatuses,
} from '@/app/lib/application-cycle-helpers'

export default async function AdminApplicationCyclesPage() {
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

  await syncApplicationCycleStatuses(supabase)

  const { data: cycles, error } = await supabase.from('applicationCycle').select('*')
  const cycleRows = (cycles ?? []) as Record<string, unknown>[]
  const currentCycle = findCurrentRunningCycle(cycleRows, Date.now())

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Application cycles</h1>
        <p className="text-sm text-gray-600">
          Manage rows from the applicationCycle table with live search filtering.
        </p>
      </div>

      <CurrentApplicationCycleBanner cycle={currentCycle} />

      <AdminCreateApplicationCycleForm />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load application cycles: {error.message}
        </div>
      ) : (
        <AdminApplicationCyclesTable cycles={cycleRows} />
      )}
    </div>
  )
}
