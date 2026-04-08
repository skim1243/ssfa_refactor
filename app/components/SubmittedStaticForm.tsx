'use client'

import type { ApplicationDocumentColumn } from '@/app/actions/save-application-document-url'

type Props = {
  application: Record<string, unknown> | null
}

type InfoField = {
  label: string
  camel: string
  snake: string
}

type DocumentField = {
  label: string
  column: ApplicationDocumentColumn
}

const INFO_FIELDS: InfoField[] = [
  { label: 'First name', camel: 'firstName', snake: 'first_name' },
  { label: 'Last name', camel: 'lastName', snake: 'last_name' },
  { label: 'Phone number', camel: 'phoneNumber', snake: 'phone_number' },
  { label: 'Email', camel: 'email', snake: 'email' },
  { label: "Parent's email", camel: 'parentsEmail', snake: 'parents_email' },
  { label: 'School', camel: 'school', snake: 'school' },
  { label: 'Grade', camel: 'grade', snake: 'grade' },
  { label: 'Major', camel: 'major', snake: 'major' },
]

const DOCUMENT_FIELDS: DocumentField[] = [
  { label: 'Official verification of enrollment', column: 'enrollmentDoc' },
  { label: 'Official transcripts', column: 'officialTranscript' },
  { label: '2024 income tax returns', column: 'incomeTax' },
  { label: 'Self-introduction video', column: 'introVideo' },
  {
    label: 'Verification/evidence of service, leadership, employment, licenses, or certificates',
    column: 'evidenceFile',
  },
]

function readString(
  row: Record<string, unknown> | null | undefined,
  camel: string,
  snake: string
): string {
  if (!row) return ''
  const v = row[camel] ?? row[snake]
  if (v == null || v === '') return ''
  return String(v)
}

function readDocUrl(
  row: Record<string, unknown> | null | undefined,
  camel: ApplicationDocumentColumn
): string {
  if (!row) return ''
  const snakeMap: Record<ApplicationDocumentColumn, string> = {
    enrollmentDoc: 'enrollment_doc',
    officialTranscript: 'official_transcript',
    incomeTax: 'income_tax',
    introVideo: 'intro_video',
    evidenceFile: 'evidence_file',
  }
  const v = row[camel] ?? row[snakeMap[camel]]
  if (v == null || v === '') return ''
  return String(v)
}

export function SubmittedStaticForm({ application }: Props) {
  return (
    <div className="flex w-full flex-col gap-8 text-green-950">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-green-900">Applicant information (read only)</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {INFO_FIELDS.map((field) => {
            const value = readString(application, field.camel, field.snake)
            return (
              <div key={field.label} className="rounded-md border border-green-200 bg-green-50/30 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-green-900/80">
                  {field.label}
                </p>
                <p className="mt-1 break-words text-sm text-green-950">{value || 'Not provided'}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-green-900">Submitted documents</h3>
        <div className="space-y-2">
          {DOCUMENT_FIELDS.map((field) => {
            const url = readDocUrl(application, field.column)
            return (
              <div
                key={field.column}
                className="flex flex-col gap-2 rounded-md border border-green-200 bg-white p-3 md:flex-row md:items-center md:justify-between"
              >
                <p className="text-sm text-green-950">{field.label}</p>
                {url ? (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit text-sm font-medium text-[var(--color-blue)] underline"
                  >
                    Open file
                  </a>
                ) : (
                  <span className="text-sm text-green-900/70">No file uploaded</span>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
