'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState, useTransition } from 'react'
import { deleteArticle } from '@/app/actions/delete-article'
import { publishArticleById } from '@/app/actions/publish-article'
import { archiveArticleById } from '@/app/actions/archive-article'
import type { ArticleListFilters } from '@/app/admin/articles/article-query'

type ArticleRow = Record<string, unknown>

const TABLE_FIELDS = [
  { key: 'id', camel: 'id', snake: 'id', label: 'ID' },
  { key: 'title', camel: 'title', snake: 'title', label: 'Title' },
  { key: 'titleImage', camel: 'titleImage', snake: 'title_image', label: 'Title image' },
  { key: 'shortDescription', camel: 'shortDescription', snake: 'short_description', label: 'Short description' },
  { key: 'datePublished', camel: 'datePublished', snake: 'date_published', label: 'Date published' },
  { key: 'status', camel: 'status', snake: 'status', label: 'Status' },
  { key: 'article', camel: 'article', snake: 'article', label: 'Article (JSON)' },
] as const

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archive', label: 'Archive' },
] as const

function pickField(row: ArticleRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

function toDisplayValue(value: unknown, maxLen?: number): string {
  if (value == null) return '-'
  if (typeof value === 'string') {
    const t = value.trim() || '-'
    if (maxLen != null && t.length > maxLen) return `${t.slice(0, maxLen)}…`
    return t
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  const s = JSON.stringify(value)
  if (maxLen != null && s.length > maxLen) return `${s.slice(0, maxLen)}…`
  return s || '-'
}

function stableArticleRowKey(row: ArticleRow, index: number): string {
  const id = pickField(row, 'id', 'id')
  if (id != null && id !== '') return String(id)
  return `__${index}`
}

function rowIdForDelete(row: ArticleRow): string | number | null {
  const id = pickField(row, 'id', 'id')
  if (id == null || id === '') return null
  if (typeof id === 'number' && !Number.isNaN(id)) return String(Math.trunc(id))
  if (typeof id === 'bigint') return id.toString()
  return String(id).trim()
}

function rowStatusLower(row: ArticleRow): string {
  const s = pickField(row, 'status', 'status')
  if (s == null) return ''
  return String(s).trim().toLowerCase()
}

type Props = {
  articles: ArticleRow[]
  initialFilters: ArticleListFilters
  filtersActive: boolean
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-xs font-medium text-gray-600'

export function AdminArticlesTable({ articles, initialFilters, filtersActive }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [isPublishPending, startPublishTransition] = useTransition()
  const [isArchivePending, startArchiveTransition] = useTransition()
  const [deleteRowKey, setDeleteRowKey] = useState<string | null>(null)
  const [publishRowKey, setPublishRowKey] = useState<string | null>(null)
  const [archiveRowKey, setArchiveRowKey] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [titleInput, setTitleInput] = useState(initialFilters.title)

  useEffect(() => {
    setTitleInput(initialFilters.title)
  }, [initialFilters.title])

  const replaceQuery = useCallback(
    (next: URLSearchParams) => {
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router],
  )

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const v = titleInput.trim()
      if (v) params.set('title', v)
      else params.delete('title')
      const newQs = params.toString()
      if (newQs === searchParams.toString()) return
      replaceQuery(params)
    }, 400)
    return () => window.clearTimeout(handle)
  }, [titleInput, searchParams, replaceQuery])

  function mergeAndNavigate(updates: Partial<Record<'title' | 'dateFrom' | 'dateTo' | 'status', string>>) {
    const params = new URLSearchParams(searchParams.toString())
    const titleDraft = titleInput.trim()
    if (titleDraft) params.set('title', titleDraft)
    else params.delete('title')
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === '') params.delete(key)
      else params.set(key, value)
    }
    replaceQuery(params)
  }

  function clearAllFilters() {
    setTitleInput('')
    router.replace(pathname, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Search &amp; filters</h2>
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="filter-article-title">
              Title
            </label>
            <input
              id="filter-article-title"
              type="search"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              placeholder="Search by title (matches database with a short delay)…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-article-status">
              Status
            </label>
            <select
              id="filter-article-status"
              value={initialFilters.status}
              onChange={(e) => mergeAndNavigate({ status: e.target.value })}
              className={inputClass}
            >
              {STATUS_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>Date published</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label="Published from"
                value={initialFilters.dateFrom}
                onChange={(e) => mergeAndNavigate({ dateFrom: e.target.value })}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                aria-label="Published to"
                value={initialFilters.dateTo}
                onChange={(e) => mergeAndNavigate({ dateTo: e.target.value })}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          {filtersActive
            ? `${articles.length} article${articles.length === 1 ? '' : 's'} match the current filters (loaded from the database).`
            : `${articles.length} article${articles.length === 1 ? '' : 's'} loaded.`}
        </p>
        {actionMessage ? (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {actionMessage}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {articles.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">
            {filtersActive
              ? 'No articles match the current title, date, and status filters.'
              : 'No articles found in the Articles table.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_FIELDS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
                <th scope="col" className="w-12 px-2 py-3 text-right font-semibold text-gray-700">
                  <span className="sr-only">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((row, index) => {
                const rowKey = stableArticleRowKey(row, index)
                const deleteId = rowIdForDelete(row)
                const deleteBusy = isDeletePending && deleteRowKey === rowKey
                const publishBusy = isPublishPending && publishRowKey === rowKey
                const archiveBusy = isArchivePending && archiveRowKey === rowKey
                const canArchive = rowStatusLower(row) === 'published'

                return (
                  <tr key={rowKey} className="align-top">
                    {TABLE_FIELDS.map((col) => {
                      const raw = pickField(row, col.camel, col.snake)
                      const isJsonCol = col.key === 'article'
                      const isImageCol = col.key === 'titleImage'
                      const display = isJsonCol ? toDisplayValue(raw, 200) : toDisplayValue(raw, 120)

                      return (
                        <td key={col.key} className="max-w-[14rem] px-4 py-3 text-gray-700">
                          {isImageCol && typeof raw === 'string' && raw.trim() ? (
                            <div className="space-y-1 break-words">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={raw.trim()}
                                alt=""
                                className="h-12 w-auto max-w-[8rem] rounded border border-gray-200 object-cover"
                              />
                              <div className="text-xs">{display}</div>
                            </div>
                          ) : (
                            <div className="break-words text-xs sm:text-sm">{display}</div>
                          )}
                        </td>
                      )
                    })}
                    <td className="relative px-2 py-3 text-right align-top">
                      <details className="inline-block text-left">
                        <summary
                          className="cursor-pointer list-none rounded-md px-2 py-1 text-xl leading-none text-gray-600 hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
                          aria-label="Row actions"
                        >
                          &#8942;
                        </summary>
                        <div className="absolute right-2 z-20 mt-1 min-w-[10rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                          <Link
                            href={
                              deleteId == null
                                ? '/admin/articles/edit'
                                : `/admin/articles/edit?id=${encodeURIComponent(String(deleteId))}`
                            }
                            className="block rounded px-3 py-2 text-left text-sm text-gray-800 hover:bg-gray-50"
                            onClick={(e) => {
                              ;(e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute(
                                'open',
                              )
                            }}
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={deleteId == null || publishBusy || deleteBusy || archiveBusy}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
                            onClick={() => {
                              if (deleteId == null) return
                              setActionMessage(null)
                              setPublishRowKey(rowKey)
                              startPublishTransition(async () => {
                                try {
                                  const result = await publishArticleById({ id: deleteId })
                                  if ('error' in result && result.error) {
                                    setActionMessage(result.error)
                                    return
                                  }
                                  router.refresh()
                                } finally {
                                  setPublishRowKey(null)
                                }
                              })
                            }}
                          >
                            {publishBusy ? 'Publishing…' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            disabled={deleteId == null || !canArchive || archiveBusy || publishBusy || deleteBusy}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                            onClick={() => {
                              if (deleteId == null) return
                              setActionMessage(null)
                              setArchiveRowKey(rowKey)
                              startArchiveTransition(async () => {
                                try {
                                  const result = await archiveArticleById({ id: deleteId })
                                  if ('error' in result && result.error) {
                                    setActionMessage(result.error)
                                    return
                                  }
                                  router.refresh()
                                } finally {
                                  setArchiveRowKey(null)
                                }
                              })
                            }}
                          >
                            {archiveBusy ? 'Archiving…' : 'Archive'}
                          </button>
                          <button
                            type="button"
                            disabled={deleteId == null || deleteBusy || publishBusy || archiveBusy}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                            onClick={() => {
                              if (deleteId == null) return
                              if (!window.confirm('Delete this article from the database? This cannot be undone.')) {
                                return
                              }
                              setActionMessage(null)
                              setDeleteRowKey(rowKey)
                              startDeleteTransition(async () => {
                                try {
                                  const result = await deleteArticle({ id: deleteId })
                                  if ('error' in result && result.error) {
                                    setActionMessage(result.error)
                                    return
                                  }
                                  router.refresh()
                                } finally {
                                  setDeleteRowKey(null)
                                }
                              })
                            }}
                          >
                            {deleteBusy ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
