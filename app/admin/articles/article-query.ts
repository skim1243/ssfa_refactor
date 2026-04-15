import type { SupabaseClient } from '@supabase/supabase-js'

export type ArticleListFilters = {
  title: string
  dateFrom: string
  dateTo: string
  status: string
}

function firstParam(v: string | string[] | undefined): string {
  if (v == null) return ''
  return (Array.isArray(v) ? v[0] : v) ?? ''
}

export function parseArticleSearchParams(
  sp: Record<string, string | string[] | undefined>,
): ArticleListFilters {
  return {
    title: firstParam(sp.title),
    dateFrom: firstParam(sp.dateFrom),
    dateTo: firstParam(sp.dateTo),
    status: firstParam(sp.status),
  }
}

/** PostgREST `ilike` wildcard escape for `%` and `_`. */
function escapeIlikePattern(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_')
}

/**
 * Applies title (ilike), datePublished range, and status to an Articles select query.
 * Column names match the Articles table: title, datePublished, status.
 */
export function applyArticleListFilters<T extends SupabaseClient>(
  supabase: T,
  filters: ArticleListFilters,
) {
  let q = supabase.from('Articles').select('*')

  const title = filters.title.trim()
  if (title) {
    q = q.ilike('title', `%${escapeIlikePattern(title)}%`)
  }

  const status = filters.status.trim().toLowerCase()
  if (status === 'draft' || status === 'published' || status === 'archive') {
    q = q.eq('status', status)
  }

  const from = filters.dateFrom.trim()
  const to = filters.dateTo.trim()
  if (from) q = q.gte('datePublished', from)
  if (to) q = q.lte('datePublished', to)

  return q
}

export function filtersAreActive(f: ArticleListFilters): boolean {
  return Boolean(
    f.title.trim() || f.dateFrom.trim() || f.dateTo.trim() || f.status.trim().toLowerCase(),
  )
}
