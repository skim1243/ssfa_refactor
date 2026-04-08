import { deleteApplication } from '@/app/actions/delete-application'

type ApplicationRow = Record<string, unknown>

const COLUMN_ORDER = [
  'id',
  'user_id',
  'firstName',
  'lastName',
  'phoneNumber',
  'email',
  'parentsEmail',
  'school',
  'grade',
  'major',
  'enrollmentDoc',
  'officialTranscript',
  'incomeTax',
  'introVideo',
  'evidenceFile',
  'completionStatus',
  'acceptenceStatus',
  'submissionDate',
  'applicationCycle',
  'created_at',
  'updated_at',
] as const

// Converts unknown DB cell values into user-friendly table text.
function toDisplayValue(value: unknown): string {
  if (value == null) return '-'
  if (typeof value === 'string') return value.trim() || '-'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value)
}

// Converts raw DB keys into readable table header labels.
function toHeaderLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
}

type Props = {
  applications: ApplicationRow[]
}

// Renders the admin applications table with row-level action controls.
export function AdminApplicationsTable({ applications }: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        No applications found.
      </div>
    )
  }

  const availableColumns = Array.from(
    new Set(
      applications.flatMap((row) => Object.keys(row))
    )
  )

  const orderedColumns = [
    ...COLUMN_ORDER.filter((col) => availableColumns.includes(col)),
    ...availableColumns.filter((col) => !COLUMN_ORDER.includes(col as (typeof COLUMN_ORDER)[number])),
  ]

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {orderedColumns.map((column) => (
              <th
                key={column}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700"
              >
                {toHeaderLabel(column)}
              </th>
            ))}
            <th scope="col" className="w-16 px-4 py-3 text-right font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((row, index) => {
            const rowId = toDisplayValue(row.id ?? row.user_id ?? index)
            const applicationId = toDisplayValue(row.id)
            const applicationUserId = toDisplayValue(row.user_id)

            return (
              <tr key={rowId} className="align-top">
                {orderedColumns.map((column) => {
                  const rawValue = row[column]
                  const value = toDisplayValue(rawValue)
                  const isUrl = typeof rawValue === 'string' && /^https?:\/\//i.test(rawValue)

                  return (
                    <td key={column} className="max-w-xs px-4 py-3 text-gray-700">
                      <div className="break-words">
                        {isUrl ? (
                          <a
                            href={rawValue}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            Open link
                          </a>
                        ) : (
                          value
                        )}
                      </div>
                    </td>
                  )
                })}
                <td className="px-4 py-3 text-right">
                  <details className="relative inline-block">
                    <summary className="cursor-pointer list-none rounded-md px-2 py-1 text-xl leading-none text-gray-600 hover:bg-gray-100">
                      &#8942;
                    </summary>
                    <div className="absolute right-0 z-10 mt-1 min-w-28 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                      <form action={deleteApplication}>
                        {applicationId !== '-' && (
                          <input type="hidden" name="applicationId" value={applicationId} />
                        )}
                        {applicationUserId !== '-' && (
                          <input type="hidden" name="applicationUserId" value={applicationUserId} />
                        )}
                        <button
                          type="submit"
                          className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </details>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
