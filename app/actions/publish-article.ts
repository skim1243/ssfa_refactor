'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

function normalizeId(raw: string | number | null | undefined): string | number | null {
  if (raw === '' || raw === null || raw === undefined) return null
  if (typeof raw === 'number') return Number.isNaN(raw) ? null : raw
  const trimmed = String(raw).trim()
  return trimmed || null
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || 'article'
}

async function allocateUniqueLink(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  title: string,
): Promise<string | null> {
  const base = slugify(title)
  for (let i = 0; i < 25; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const { data, error } = await supabase
      .from('Articles')
      .select('id')
      .eq('link', candidate)
      .maybeSingle()
    if (error) return null
    if (!data) return candidate
  }
  return null
}

/** Publishes an article and sets datePublished to the server press date (admin only). */
export async function publishArticleById(params: { id: string | number }) {
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

  const { data: row, error: rowErr } = await supabase
    .from('Articles')
    .select('title, link')
    .eq('id', id)
    .maybeSingle()
  if (rowErr) return { error: rowErr.message }
  if (!row) return { error: 'Article not found.' as const }

  const existingLink = String(row.link ?? '').trim()
  const link = existingLink || (await allocateUniqueLink(supabase, String(row.title ?? 'article')))
  if (!link) return { error: 'Could not allocate a unique article link.' as const }

  const today = new Date().toISOString().slice(0, 10)
  const { error } = await supabase
    .from('Articles')
    .update({
      status: 'published',
      datePublished: today,
      link,
    })
    .eq('id', id)

  if (error) {
    console.error('PUBLISH ARTICLE:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/articles')
  revalidatePath('/admin/articles/editor')
  revalidatePath('/events')
  revalidatePath('/')
  return { success: true as const, id, datePublished: today, link }
}
