'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

export async function deleteApplication(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') return

  const applicationId = String(formData.get('applicationId') ?? '').trim()
  const applicationUserId = String(formData.get('applicationUserId') ?? '').trim()

  if (!applicationId && !applicationUserId) return

  const query = supabase.from('Applications').delete()
  const { error } = applicationId
    ? await query.eq('id', applicationId)
    : await query.eq('user_id', applicationUserId)

  if (error) {
    console.error('DELETE APPLICATION:', error)
    return
  }

  revalidatePath('/admin/applications')
}
