'use client'

import { useMemo, useState } from 'react'

type ApplicationCycleRow = Record<string, unknown>

const TABLE_FIELDS = [
  { key: 'name', camel: 'name', snake: 'name', label: 'Name' },
  { key: 'startTime', camel: 'startTime', snake: 'start_time', label: 'Start time' },
  { key: 'endTime', camel: 'endTime', snake: 'end_time', label: 'End time' },
  { key: 'status', camel: 'status', snake: 'status', label: 'Status' },
] as const

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'past', label: 'Past' },
] as const

type FilterState = {
  name: string
  startTimeFrom: string
  startTimeTo: string
  endTimeFrom: string
  endTimeTo: string
  status: string
}

const initialFilters: FilterState = {
  name: '',
  startTimeFrom: '',
  startTimeTo: '',
  endTimeFrom: '',
  endTimeTo: '',
  status: '',
}

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-xs font-medium text-gray-600'

function pickField(row: ApplicationCycleRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

function normText(v: unknown): string {
  if (v == null || v === '') return ''
  return String(v).trim().toLowerCase()
}

function toDisplayValue(value: unknown): string {
  if (value == null) return '-'
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '-'
    const asDate = new Date(trimmed)
    if (!Number.isNaN(asDate.getTime())) {
      return asDate.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    }
    return trimmed
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  const json = JSON.stringify(value)
  return json || '-'
}

function parseDateToMs(v: unknown): number | null {
  if (v == null || v === '') return null
  const d = new Date(String(v))
  if (Number.isNaN(d.getTime())) return null
  return d.getTime()
}

function filterRows(rows: ApplicationCycleRow[], filters: FilterState): ApplicationCycleRow[] {
  const nameQ = filters.name.trim().toLowerCase()
  const statusQ = filters.status.trim().toLowerCase()
  const startFromMs = parseDateToMs(filters.startTimeFrom)
  const startToMs = parseDateToMs(filters.startTimeTo)
  const endFromMs = parseDateToMs(filters.endTimeFrom)
  const endToMs = parseDateToMs(filters.endTimeTo)

  return rows.filter((row) => {
    const name = normText(pickField(row, 'name', 'name'))
    if (nameQ && !name.includes(nameQ)) return false

    const status = normText(pickField(row, 'status', 'status'))
    if (statusQ && status !== statusQ) return false

    if (startFromMs != null || startToMs != null) {
      const rowStart = parseDateToMs(pickField(row, 'startTime', 'start_time'))
      if (rowStart == null) return false
      if (startFromMs != null && rowStart < startFromMs) return false
      if (startToMs != null && rowStart > startToMs) return false
    }

    if (endFromMs != null || endToMs != null) {
      const rowEnd = parseDateToMs(pickField(row, 'endTime', 'end_time'))
      if (rowEnd == null) return false
      if (endFromMs != null && rowEnd < endFromMs) return false
      if (endToMs != null && rowEnd > endToMs) return false
    }

    return true
  })
}

type Props = {
  cycles: ApplicationCycleRow[]
}

export function AdminApplicationCyclesTable({ cycles }: Props) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const filteredCycles = useMemo(() => filterRows(cycles, filters), [cycles, filters])

  function setFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  if (cycles.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        No application cycles found.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold text-gray-900">Search &amp; filters</h2>
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800"
          >
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="filter-cycle-name">
              Name
            </label>
            <input
              id="filter-cycle-name"
              type="search"
              value={filters.name}
              onChange={(e) => setFilter('name', e.target.value)}
              placeholder="Contains…"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="filter-cycle-status">
              Status
            </label>
            <select
              id="filter-cycle-status"
              value={filters.status}
              onChange={(e) => setFilter('status', e.target.value)}
              className={inputClass}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value || 'all'} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <span className={labelClass}>Start time</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="datetime-local"
                aria-label="Start time from"
                value={filters.startTimeFrom}
                onChange={(e) => setFilter('startTimeFrom', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="datetime-local"
                aria-label="Start time to"
                value={filters.startTimeTo}
                onChange={(e) => setFilter('startTimeTo', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <span className={labelClass}>End time</span>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="datetime-local"
                aria-label="End time from"
                value={filters.endTimeFrom}
                onChange={(e) => setFilter('endTimeFrom', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
              <span className="text-xs text-gray-500">to</span>
              <input
                type="datetime-local"
                aria-label="End time to"
                value={filters.endTimeTo}
                onChange={(e) => setFilter('endTimeTo', e.target.value)}
                className={`${inputClass} min-w-[10rem] flex-1`}
              />
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredCycles.length} of {cycles.length} application cycle{cycles.length === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredCycles.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No application cycles match the current filters.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {TABLE_FIELDS.map((field) => (
                  <th
                    key={field.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700"
                  >
                    {field.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCycles.map((row, index) => (
                <tr key={`${String(pickField(row, 'name', 'name') ?? 'row')}-${index}`} className="align-top">
                  {TABLE_FIELDS.map((field) => (
                    <td key={field.key} className="max-w-xs px-4 py-3 text-gray-700">
                      <div className="break-words">
                        {toDisplayValue(pickField(row, field.camel, field.snake))}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
