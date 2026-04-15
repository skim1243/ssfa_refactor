import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { AdminArticlesTable } from '@/app/components/AdminArticlesTable'
import {
  applyArticleListFilters,
  filtersAreActive,
  parseArticleSearchParams,
  type ArticleListFilters,
} from '@/app/admin/articles/article-query'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminArticlesPage({ searchParams }: PageProps) {
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

  const sp = searchParams != null ? await searchParams : {}
  const filters: ArticleListFilters = parseArticleSearchParams(sp)

  const { data: articles, error } = await applyArticleListFilters(supabase, filters)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-600">
            Manage article rows from the Articles table. Filters load matching rows from the database.
          </p>
        </div>
        <Link
          href="/admin/articles/editor"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Create new article
        </Link>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          Failed to load articles: {error.message}
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
              Loading articles…
            </div>
          }
        >
          <AdminArticlesTable
            articles={(articles ?? []) as Record<string, unknown>[]}
            initialFilters={filters}
            filtersActive={filtersAreActive(filters)}
          />
        </Suspense>
      )}
    </div>
  )
}
