import { notFound, redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { AdminApplicationDetailView } from '@/app/components/AdminApplicationDetailView'

type PageProps = {
  params: Promise<{ applicationRef: string }>
}

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  const { applicationRef: rawParam } = await params
  const applicationRef = decodeURIComponent(rawParam)

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

  const byId = await supabase.from('Applications').select('*').eq('id', applicationRef).maybeSingle()

  if (byId.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load application: {byId.error.message}
      </div>
    )
  }

  let row = byId.data

  if (!row) {
    const byUser = await supabase.from('Applications').select('*').eq('user_id', applicationRef).maybeSingle()
    if (byUser.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load application: {byUser.error.message}
        </div>
      )
    }
    row = byUser.data
  }

  if (!row) notFound()

  return <AdminApplicationDetailView application={row as Record<string, unknown>} />
}
