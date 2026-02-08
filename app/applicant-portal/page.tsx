import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'

export default async function ApplicantPortal() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/applicant-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('"user"', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'applicant') {
    redirect('/auth-error')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicant Portal</h1>
        <p className="text-gray-600">Portal content coming soon.</p>
      </div>
    </main>
  )
}
