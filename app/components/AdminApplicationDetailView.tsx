import Link from 'next/link'

type ApplicationRow = Record<string, unknown>

function pickField(row: ApplicationRow, camel: string, snake: string): unknown {
  return row[camel] ?? row[snake]
}

function toDisplayValue(value: unknown): string {
  if (value == null) return '—'
  if (typeof value === 'string') return value.trim() || '—'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (value instanceof Date) return value.toISOString()
  return String(value)
}

function isHttpUrlString(value: unknown): value is string {
  return typeof value === 'string' && /^https?:\/\//i.test(value.trim())
}

function downloadFilenameForColumn(column: string, url: string): string {
  try {
    const u = new URL(url.trim())
    const seg = u.pathname.split('/').filter(Boolean).pop()
    if (seg && seg.includes('.')) return decodeURIComponent(seg)
  } catch {
    /* ignore */
  }
  const safe = column.replace(/[^a-z0-9_-]/gi, '_')
  return `${safe || 'file'}`
}

const DOCUMENTS: { camel: string; snake: string; label: string }[] = [
  { camel: 'enrollmentDoc', snake: 'enrollment_doc', label: 'Enrollment document' },
  { camel: 'officialTranscript', snake: 'official_transcript', label: 'Official transcript' },
  { camel: 'incomeTax', snake: 'income_tax', label: 'Income tax' },
  { camel: 'introVideo', snake: 'intro_video', label: 'Intro video' },
  { camel: 'evidenceFile', snake: 'evidence_file', label: 'Evidence file' },
]

const INFO_ROWS: { camel: string; snake: string; label: string }[] = [
  { camel: 'firstName', snake: 'first_name', label: 'First name' },
  { camel: 'lastName', snake: 'last_name', label: 'Last name' },
  { camel: 'email', snake: 'email', label: 'Email' },
  { camel: 'parentsEmail', snake: 'parents_email', label: "Parents' email" },
  { camel: 'phoneNumber', snake: 'phone_number', label: 'Phone' },
  { camel: 'school', snake: 'school', label: 'School' },
  { camel: 'grade', snake: 'grade', label: 'Grade' },
  { camel: 'major', snake: 'major', label: 'Major' },
  { camel: 'completionStatus', snake: 'completion_status', label: 'Completion status' },
  { camel: 'acceptenceStatus', snake: 'acceptence_status', label: 'Acceptance status' },
  { camel: 'submissionDate', snake: 'submission_date', label: 'Submission date' },
  { camel: 'applicationCycle', snake: 'application_cycle', label: 'Application cycle' },
]

type Props = {
  application: ApplicationRow
}

export function AdminApplicationDetailView({ application }: Props) {
  const titleName = [
    toDisplayValue(pickField(application, 'firstName', 'first_name')),
    toDisplayValue(pickField(application, 'lastName', 'last_name')),
  ]
    .filter((s) => s !== '—')
    .join(' ')

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/applications"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Back to applications
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {titleName.trim() || 'Application'}
        </h1>
        <p className="text-sm text-gray-600">Applicant information and uploaded documents.</p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Applicant information</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INFO_ROWS.map(({ camel, snake, label }) => {
            const raw = pickField(application, camel, snake)
            return (
              <div key={camel}>
                <dt className="text-xs font-medium text-gray-500">{label}</dt>
                <dd className="text-sm text-gray-900">{toDisplayValue(raw)}</dd>
              </div>
            )
          })}
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Uploaded files</h2>
        <ul className="divide-y divide-gray-100">
          {DOCUMENTS.map(({ camel, snake, label }) => {
            const raw = pickField(application, camel, snake)
            return (
              <li key={camel} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="text-sm font-medium text-gray-800">{label}</span>
                {isHttpUrlString(raw) ? (
                  <a
                    href={raw.trim()}
                    download={downloadFilenameForColumn(camel, raw.trim())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 underline hover:text-blue-800"
                  >
                    Download
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">No file</span>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
