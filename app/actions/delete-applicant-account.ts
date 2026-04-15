'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

/** Deletes the applicant’s application row, `user_roles` row, and Supabase Auth user (admin only). */
export async function deleteApplicantAccountAndApplication(params: { targetUserId: string }) {
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

  const targetUserId = String(params.targetUserId ?? '').trim()
  if (!targetUserId) return { error: 'Missing applicant user id.' as const }
  if (targetUserId === user.id) return { error: 'You cannot delete your own account.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return {
      error:
        'Full account deletion requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it to your environment and restart.',
    } as const
  }

  const { error: appErr } = await admin.from('Applications').delete().eq('user_id', targetUserId)
  if (appErr) {
    console.error('DELETE APPLICATIONS:', appErr)
    return { error: appErr.message as const }
  }

  const { error: roleErr } = await admin.from('user_roles').delete().eq('user', targetUserId)
  if (roleErr) {
    console.error('DELETE USER ROLES:', roleErr)
    return { error: roleErr.message as const }
  }

  const { error: authErr } = await admin.auth.admin.deleteUser(targetUserId)
  if (authErr) {
    console.error('DELETE AUTH USER:', authErr)
    return { error: authErr.message as const }
  }

  revalidatePath('/admin/applications')
  return { success: true as const }
}
