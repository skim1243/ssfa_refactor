'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

const ALLOWED_ACCEPTENCE = new Set(['Pending', 'Accepted', 'Rejected'])

export async function updateApplicationAcceptanceStatus(payload: {
  applicationId?: string | null
  applicationUserId?: string | null
  acceptenceStatus: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' as const }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') return { error: 'Not allowed.' as const }

  const applicationId = String(payload.applicationId ?? '').trim()
  const applicationUserId = String(payload.applicationUserId ?? '').trim()
  const acceptenceStatus = String(payload.acceptenceStatus ?? '').trim()

  if (!acceptenceStatus) return { error: 'Missing status.' as const }
  if (!ALLOWED_ACCEPTENCE.has(acceptenceStatus)) {
    return { error: 'Status must be Pending, Accepted, or Rejected.' as const }
  }
  if (!applicationId && !applicationUserId) return { error: 'Missing application.' as const }

  const query = supabase.from('Applications').update({ acceptenceStatus })
  const { error } = applicationId
    ? await query.eq('id', applicationId)
    : await query.eq('user_id', applicationUserId)

  if (error) {
    console.error('UPDATE APPLICATION ACCEPTANCE:', error)
    return { error: error.message as const }
  }

  revalidatePath('/admin/applications')
  return { success: true as const }
}
