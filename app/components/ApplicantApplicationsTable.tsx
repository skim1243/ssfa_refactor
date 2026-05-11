import Link from 'next/link'

type ApplicationRow = Record<string, unknown>

const GRADE_LABELS: Record<string, string> = {
  '9th': '9th',
  '10th': '10th',
  '11th': '11th',
  '12th': '12th',
  collegeFreshman: 'College — Freshman',
  collegeSophomore: 'College — Sophomore',
  collegeJunior: 'College — Junior',
  collegeSenior: 'College — Senior',
}

function pickField(row: ApplicationRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

function rowId(row: ApplicationRow): string | null {
  const id = row.id
  if (id == null || id === '') return null
  return String(id)
}

function formatGrade(value: unknown): string {
  if (value == null || value === '') return '—'
  const s = String(value)
  return GRADE_LABELS[s] ?? s
}

function formatApplicationCycle(row: ApplicationRow): string {
  const v = pickField(row, 'applicationCycle', 'application_cycle')
  if (v == null || String(v).trim() === '') return 'N/A'
  return String(v).trim()
}

function formatSubmissionDate(row: ApplicationRow): string {
  const raw = pickField(row, 'submissionDate', 'submission_date')
  if (raw == null || String(raw).trim() === '') return 'N/A'
  const d = new Date(String(raw))
  if (Number.isNaN(d.getTime())) return String(raw)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

type Props = {
  applications: ApplicationRow[]
  selectedApplicationId: string | null
}

export function ApplicantApplicationsTable({ applications, selectedApplicationId }: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        No application records were found for your account.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
              ID
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
              Grade
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
              Portal
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
              Application cycle
            </th>
            <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
              Submission date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {applications.map((row, index) => {
            const id = rowId(row)
            const rowKey = id ?? `row-${index}`
            const href =
              id != null
                ? `/applicant-portal?applicationId=${encodeURIComponent(id)}`
                : '/applicant-portal'
            const selected = selectedApplicationId != null && id === selectedApplicationId

            return (
              <tr key={rowKey} className={selected ? 'bg-green-50/80' : undefined}>
                <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-800">{id ?? '—'}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {formatGrade(pickField(row, 'grade', 'grade'))}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-left">
                  <Link
                    href={href}
                    className="font-semibold text-[var(--color-blue)] underline decoration-2 underline-offset-2 hover:opacity-90"
                  >
                    Open in portal
                  </Link>
                </td>
                <td className="max-w-md break-words px-4 py-3 text-gray-700">{formatApplicationCycle(row)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatSubmissionDate(row)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
