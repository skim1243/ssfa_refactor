'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

const ALLOWED_ROLES = ['admin', 'applicant'] as const
export type AdminAssignableRole = (typeof ALLOWED_ROLES)[number]

export async function updateUserRole(params: { targetUserId: string; role: string }) {
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
  const nextRole = String(params.role ?? '').trim() as AdminAssignableRole

  if (!targetUserId) return { error: 'Missing user id.' as const }
  if (!ALLOWED_ROLES.includes(nextRole)) return { error: 'Invalid role.' as const }
  if (targetUserId === user.id) return { error: 'You cannot change your own role.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return {
      error:
        'Updating roles requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it to your environment and restart.',
    } as const
  }

  const { data: existing, error: selErr } = await admin
    .from('user_roles')
    .select('user')
    .eq('user', targetUserId)
    .maybeSingle()

  if (selErr) {
    console.error('SELECT USER ROLE:', selErr)
    return { error: selErr.message } as const
  }

  if (existing) {
    const { error: updErr } = await admin.from('user_roles').update({ role: nextRole }).eq('user', targetUserId)
    if (updErr) {
      console.error('UPDATE USER ROLE:', updErr)
      return { error: updErr.message } as const
    }
  } else {
    const { error: insErr } = await admin.from('user_roles').insert({ user: targetUserId, role: nextRole })
    if (insErr) {
      console.error('INSERT USER ROLE:', insErr)
      return { error: insErr.message } as const
    }
  }

  revalidatePath('/admin/users')
  return { success: true as const }
}
