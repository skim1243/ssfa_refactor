'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

/** Deletes a row from `Articles` (admin only). */
function normalizeId(raw: string | number | null | undefined): string | number | null {
  if (raw === '' || raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  const trimmed = String(raw).trim()
  return trimmed || null
}

export async function deleteArticle(params: { id: string | number }) {
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

  const id = normalizeId(params.id)
  if (id == null) return { error: 'Invalid article id.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return { error: 'Missing SUPABASE_SERVICE_ROLE_KEY on server.' as const }
  }

  const { error } = await admin.from('Articles').delete().eq('id', id)

  if (error) {
    console.error('DELETE ARTICLE:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/articles')
  return { success: true as const }
}
