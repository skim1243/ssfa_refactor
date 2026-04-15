'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteApplicantAccountAndApplication } from '@/app/actions/delete-applicant-account'
import { updateApplicationAcceptanceStatus } from '@/app/actions/update-application-acceptance-status'

type ApplicationRow = Record<string, unknown>

/** Summary columns on the list page (full record opens on the detail route). */
const TABLE_TEXT_FIELDS = [
  { key: 'firstName', camel: 'firstName', snake: 'first_name', label: 'First name' },
  { key: 'lastName', camel: 'lastName', snake: 'last_name', label: 'Last name' },
  { key: 'email', camel: 'email', snake: 'email', label: 'Email' },
  { key: 'parentsEmail', camel: 'parentsEmail', snake: 'parents_email', label: "Parents' email" },
] as const

/** New applications and empty UI state use this `acceptenceStatus` (see register-applicant). */
const DEFAULT_ACCEPTENCE_STATUS = 'Pending' as const

/** Values admins may set per row (must match `acceptenceStatus` in the database). */
const ACCEPTANCE_ROW_OPTIONS = [DEFAULT_ACCEPTENCE_STATUS, 'Accepted', 'Rejected'] as const

const GRADE_FILTER_OPTIONS = [
  { value: '', label: 'All grades' },
  { value: '9th', label: '9th' },
  { value: '10th', label: '10th' },
  { value: '11th', label: '11th' },
  { value: '12th', label: '12th' },
  { value: 'collegeFreshman', label: 'College — Freshman' },
  { value: 'collegeSophomore', label: 'College — Sophomore' },
  { value: 'collegeJunior', label: 'College — Junior' },
  { value: 'collegeSenior', label: 'College — Senior' },
] as const

function pickField(row: ApplicationRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

function rowFullName(row: ApplicationRow): string {
  const fn = String(pickField(row, 'firstName', 'first_name') ?? '').trim()
  const ln = String(pickField(row, 'lastName', 'last_name') ?? '').trim()
  return `${fn} ${ln}`.trim().toLowerCase()
}

function normText(v: unknown): string {
  if (v == null || v === '') return ''
  return String(v).trim().toLowerCase()
}

function normExact(v: unknown): string {
  if (v == null || v === '') return ''
  return String(v).trim()
}

/** Parses row date to UTC midnight for calendar-day comparison, or null if missing/invalid. */
function rowSubmissionDay(row: ApplicationRow): number | null {
  const raw = pickField(row, 'submissionDate', 'submission_date')
  if (raw == null || raw === '') return null
  const d = new Date(String(raw))
  if (Number.isNaN(d.getTime())) return null
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function parseInputDateToUtcDay(isoYmd: string): number | null {
  if (!isoYmd.trim()) return null
  const [y, m, day] = isoYmd.split('-').map((n) => Number(n))
  if (!y || !m || !day) return null
  return Date.UTC(y, m - 1, day)
}

// Converts unknown DB cell values into user-friendly table text.
function toDisplayValue(value: unknown): string {
  if (value == null) return '-'
  if (typeof value === 'string') return value.trim() || '-'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value)
}

function readOptionalStringField(row: ApplicationRow, key: string): string | null {
  const v = row[key]
  if (v == null || v === '') return null
  return String(v)
}

function stableRowKey(row: ApplicationRow, index: number): string {
  return (
    readOptionalStringField(row, 'user_id') ??
    readOptionalStringField(row, 'id') ??
    `__${index}`
  )
}

/** Prefer auth user id in the URL so the segment is not tied to the table primary key when both exist. */
function detailHrefForRow(row: ApplicationRow): string | null {
  const userId = readOptionalStringField(row, 'user_id')
  if (userId) return `/admin/applications/${encodeURIComponent(userId)}`
  const pk = readOptionalStringField(row, 'id')
  if (pk) return `/admin/applications/${encodeURIComponent(pk)}`
  return null
}

function currentAcceptenceValue(row: ApplicationRow): string {
  return (
    normExact(pickField(row, 'acceptenceStatus', 'acceptence_status')) ||
    normExact(pickField(row, 'acceptence_status', 'acceptence_status')) ||
    ''
  )
}

function uniqueSortedStrings(rows: ApplicationRow[], camel: string, snake: string): string[] {
  const set = new Set<string>()
  for (const row of rows) {
    const v = normExact(pickField(row, camel, snake))
    if (v) set.add(v)
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

type Props = {
  applications: ApplicationRow[]
}

type FilterState = {
  name: string
  school: string
  major: string
  grade: string
  completionStatus: string
  acceptanceStatus: string
  submissionDateFrom: string
  submissionDateTo: string
}

const initialFilters: FilterState = {
  name: '',
  school: '',
  major: '',
  grade: '',
  completionStatus: '',
  acceptanceStatus: '',
  submissionDateFrom: '',
  submissionDateTo: '',
}

function filterRows(rows: ApplicationRow[], f: FilterState): ApplicationRow[] {
  const nameQ = f.name.trim().toLowerCase()
  const schoolQ = f.school.trim().toLowerCase()
  const majorQ = f.major.trim().toLowerCase()
  const fromDay = parseInputDateToUtcDay(f.submissionDateFrom)
  const toDay = parseInputDateToUtcDay(f.submissionDateTo)

  return rows.filter((row) => {
    if (nameQ && !rowFullName(row).includes(nameQ)) return false

    const school = normText(pickField(row, 'school', 'school'))
    if (schoolQ && !school.includes(schoolQ)) return false

    const major = normText(pickField(row, 'major', 'major'))
    if (majorQ && !major.includes(majorQ)) return false

    if (f.grade) {
      const g = normExact(pickField(row, 'grade', 'grade'))
      if (g !== f.grade) return false
    }

    if (f.completionStatus) {
      const c =
        normExact(pickField(row, 'completionStatus', 'completion_status')) ||
        normExact(pickField(row, 'completion_status', 'completion_status'))
      if (c !== f.completionStatus) return false
    }

    if (f.acceptanceStatus) {
      const a =
        normExact(pickField(row, 'acceptenceStatus', 'acceptence_status')) ||
        normExact(pickField(row, 'acceptence_status', 'acceptence_status'))
      if (a !== f.acceptanceStatus) return false
    }

    if (fromDay != null || toDay != null) {
      const day = rowSubmissionDay(row)
      if (day == null) return false
      if (fromDay != null && day < fromDay) return false
      if (toDay != null && day > toDay) return false
    }

    return true
  })
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-xs font-medium text-gray-600'

// Renders the admin applications table with filters and row-level action controls.
export function AdminApplicationsTable({ applications }: Props) {
  const router = useRouter()
  const [isStatusPending, startStatusTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [statusUpdatingKey, setStatusUpdatingKey] = useState<string | null>(null)
  const [deleteRowKey, setDeleteRowKey] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const completionOptions = useMemo(
    () => uniqueSortedStrings(applications, 'completionStatus', 'completion_status'),
    [applications]
  )
  const filteredApplications = useMemo(
    () => filterRows(applications, filters),
    [applications, filters]
  )

  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        No applications found.
      </div>
    )
  }

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="filter-name">
              Name
            </label>
            <input
              id="filter-name"
              type="text"
              value={filters.name}
              onChange={(e) => setFilter('name', e.target.value)}
              placeholder="First or last name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-school">
              School
            </label>
            <input
              id="filter-school"
              type="text"
              value={filters.school}
              onChange={(e) => setFilter('school', e.target.value)}
              placeholder="Contains…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-major">
              Major
            </label>
            <input
              id="filter-major"
              type="text"
              value={filters.major}
              onChange={(e) => setFilter('major', e.target.value)}
              placeholder="Contains…"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-grade">
              Grade
            </label>
            <select
              id="filter-grade"
              value={filters.grade}
              onChange={(e) => setFilter('grade', e.target.value)}
              className={inputClass}
            >
              {GRADE_FILTER_OPTIONS.map((o) => (
                <option key={o.value || 'all'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-completion">
              Completion status
            </label>
            <select
              id="filter-completion"
              value={filters.completionStatus}
              onChange={(e) => setFilter('completionStatus', e.target.value)}
              className={inputClass}
            >
              <option value="">All</option>
              {completionOptions.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="filter-acceptance">
              Acceptance status
            </label>
            <select
              id="filter-acceptance"
              value={filters.acceptanceStatus}
              onChange={(e) => setFilter('acceptanceStatus', e.target.value)}
              className={inputClass}
            >
              <option value="">All</option>
              {ACCEPTANCE_ROW_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <span className={labelClass}>Submission date</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                aria-label="Submission from"
                value={filters.submissionDateFrom}
                onChange={(e) => setFilter('submissionDateFrom', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="date"
                aria-label="Submission to"
                value={filters.submissionDateTo}
                onChange={(e) => setFilter('submissionDateTo', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredApplications.length} of {applications.length} application
          {applications.length === 1 ? '' : 's'}.
        </p>
        {statusMessage ? (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {statusMessage}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredApplications.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No applications match the current filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_TEXT_FIELDS.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {col.label}
                  </th>
                ))}
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Acceptance status
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-right font-semibold text-gray-700">
                  Application
                </th>
                <th scope="col" className="w-12 px-2 py-3 text-right font-semibold text-gray-700">
                  <span className="sr-only">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplications.map((row, index) => {
                const rowKey = stableRowKey(row, index)
                const userId = readOptionalStringField(row, 'user_id')
                const rowPk = readOptionalStringField(row, 'id')
                const canEditAcceptence = Boolean(userId || rowPk)
                const detailHref = detailHrefForRow(row)
                const rawStatus = currentAcceptenceValue(row)
                const current = rawStatus || DEFAULT_ACCEPTENCE_STATUS
                const busy = isStatusPending && statusUpdatingKey === rowKey
                const deleteBusy = isDeletePending && deleteRowKey === rowKey
                const rowOptions = [...ACCEPTANCE_ROW_OPTIONS] as string[]
                const optionList: string[] = rowOptions.includes(current)
                  ? rowOptions
                  : [current, ...rowOptions]

                return (
                  <tr key={rowKey} className="align-top">
                    {TABLE_TEXT_FIELDS.map((col) => (
                      <td key={col.key} className="max-w-xs px-4 py-3 text-gray-700">
                        <div className="break-words">
                          {toDisplayValue(pickField(row, col.camel, col.snake))}
                        </div>
                      </td>
                    ))}
                    <td className="max-w-xs px-4 py-3 text-gray-700">
                      <select
                        className="max-w-[12rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                        value={current}
                        onChange={(e) => {
                          const next = e.target.value
                          if (!canEditAcceptence) {
                            setStatusMessage('Cannot update — missing row reference.')
                            return
                          }
                          setStatusMessage(null)
                          setStatusUpdatingKey(rowKey)
                          startStatusTransition(async () => {
                            const result = await updateApplicationAcceptanceStatus({
                              applicationId: userId ? null : rowPk,
                              applicationUserId: userId ?? null,
                              acceptenceStatus: next,
                            })
                            setStatusUpdatingKey(null)
                            if ('error' in result && result.error) {
                              setStatusMessage(result.error)
                              return
                            }
                            router.refresh()
                          })
                        }}
                        disabled={!canEditAcceptence || busy || deleteBusy}
                        aria-label="Acceptance status"
                      >
                        {optionList.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {detailHref ? (
                        <Link
                          href={detailHref}
                          className="font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          View details
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="relative px-2 py-3 text-right align-top">
                      {userId ? (
                        <details className="inline-block text-left">
                          <summary
                            className="cursor-pointer list-none rounded-md px-2 py-1 text-xl leading-none text-gray-600 hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
                            aria-label="Row actions"
                          >
                            &#8942;
                          </summary>
                          <div className="absolute right-2 z-20 mt-1 min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                            <button
                              type="button"
                              disabled={deleteBusy}
                              className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                              onClick={() => {
                                if (
                                  !window.confirm(
                                    'Permanently delete this applicant’s Auth account, user role, and application row? This cannot be undone.'
                                  )
                                ) {
                                  return
                                }
                                setStatusMessage(null)
                                setDeleteRowKey(rowKey)
                                startDeleteTransition(async () => {
                                  try {
                                    const result = await deleteApplicantAccountAndApplication({
                                      targetUserId: userId,
                                    })
                                    if ('error' in result && result.error) {
                                      setStatusMessage(result.error)
                                      return
                                    }
                                    router.refresh()
                                  } finally {
                                    setDeleteRowKey(null)
                                  }
                                })
                              }}
                            >
                              {deleteBusy ? 'Deleting…' : 'Delete account & application'}
                            </button>
                          </div>
                        </details>
                      ) : (
                        <span className="text-gray-400" title="Applicant user id missing">
                          —
                        </span>
                      )}
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
