'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import type { ArticleLoaderJson } from '@/app/components/ArticleLoader'

type SaveArticleDraftInput = {
  id?: string | number | null
  title: string
  titleImage?: string
  shortDescription: string
  article: ArticleLoaderJson
}

function randomDigitString(length: number): string {
  let out = ''
  while (out.length < length) {
    out += Math.floor(Math.random() * 10)
  }
  return out
}

/** Generates a random positive int8-compatible id as a string. */
function generateRandomInt8Id(): string {
  // Keep inside JS safe integer range so client-side routing/edit ids stay exact.
  // 15 digits <= 9,007,199,254,740,991 (MAX_SAFE_INTEGER).
  const first = String(Math.floor(Math.random() * 9) + 1)
  return first + randomDigitString(14)
}

function normalizeId(raw: string | number | null | undefined): string | number | null {
  if (raw === '' || raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  const trimmed = String(raw).trim()
  return trimmed || null
}

/** Creates/updates an article and always keeps status as draft (admin only). */
export async function saveArticleDraft(input: SaveArticleDraftInput) {
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

  const title = String(input.title ?? '').trim()
  if (!title) return { error: 'Title is required.' as const }

  const payload = {
    title,
    titleImage: String(input.titleImage ?? '').trim(),
    shortDescription: String(input.shortDescription ?? '').trim(),
    status: 'draft' as const,
    article: JSON.stringify(input.article),
  }

  const normalizedId = normalizeId(input.id)
  if (normalizedId == null) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const generatedId = generateRandomInt8Id()
      const { data, error } = await supabase
        .from('Articles')
        .insert({ ...payload, id: generatedId })
        .select('id')
        .single()

      if (!error) {
        revalidatePath('/admin/articles')
        return { success: true as const, id: data?.id ?? generatedId }
      }

      // Retry if random id collided with an existing row.
      if (error.code === '23505') continue
      console.error('INSERT ARTICLE:', error)
      return { error: error.message }
    }
    return { error: 'Could not allocate a unique article id. Please retry.' }
  }

  const { data, error } = await supabase
    .from('Articles')
    .update(payload)
    .eq('id', normalizedId)
    .select('id')
    .single()
  if (error) {
    console.error('UPDATE ARTICLE:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/admin/articles/editor')
  return { success: true as const, id: data?.id ?? normalizedId }
}
