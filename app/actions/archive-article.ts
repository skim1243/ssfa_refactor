'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

function normalizeId(raw: string | number | null | undefined): string | number | null {
  if (raw === '' || raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  const trimmed = String(raw).trim()
  return trimmed || null
}

/** Archives an article only if it is currently published (admin only). */
export async function archiveArticleById(params: { id: string | number }) {
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
  if (id == null) return { error: 'Missing article id.' as const }

  const { data: current, error: currentErr } = await supabase
    .from('Articles')
    .select('status')
    .eq('id', id)
    .maybeSingle()

  if (currentErr) {
    console.error('ARCHIVE ARTICLE SELECT:', currentErr)
    return { error: currentErr.message }
  }

  const currentStatus = String(current?.status ?? '').trim().toLowerCase()
  if (currentStatus !== 'published') {
    return { error: 'Archive is only allowed after an article is published.' as const }
  }

  const { error } = await supabase
    .from('Articles')
    .update({
      status: 'archive',
    })
    .eq('id', id)

  if (error) {
    console.error('ARCHIVE ARTICLE UPDATE:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/articles')
  return { success: true as const, id }
}
