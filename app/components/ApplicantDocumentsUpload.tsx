'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'
import {
  saveApplicationDocumentUrl,
  type ApplicationDocumentColumn,
} from '@/app/actions/save-application-document-url'
import { clearApplicationDocumentUrl } from '@/app/actions/clear-application-document-url'

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

// Normalizes user file names into a safe storage-friendly format.
function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, '_').replace(/\s+/g, '_')
}

// Extracts a sanitized file extension to preserve original type on upload.
function extensionFromName(name: string): string {
  const safe = sanitizeFileName(name)
  const dotIndex = safe.lastIndexOf('.')
  if (dotIndex <= 0 || dotIndex === safe.length - 1) return ''
  return safe.slice(dotIndex)
}

// Reads a document URL from either camelCase or snake_case application keys.
function pickDocUrl(
  row: Record<string, unknown> | null,
  camel: ApplicationDocumentColumn
): string | null {
  if (!row) return null
  const snakeMap: Record<ApplicationDocumentColumn, string> = {
    enrollmentDoc: 'enrollmentDoc',
    officialTranscript: 'officialTranscript',
    incomeTax: 'incomeTax',
    introVideo: 'introVideo',
    evidenceFile: 'evidenceFile',
  }
  const v = row[camel] ?? row[snakeMap[camel]]
  if (v == null || v === '') return null
  return String(v)
}

// Defines the per-section config used to map UI sections to DB/storage targets.
type Section = {
  id: string
  column: ApplicationDocumentColumn
  bucket: string
  title: string
  accept?: string
}

// Lists every upload section and where each file should be stored.
const SECTIONS: Section[] = [
  {
    id: 'enrollment',
    column: 'enrollmentDoc',
    bucket: 'enrollment_documents',
    title: 'Official verification of enrollment',
  },
  {
    id: 'transcripts',
    column: 'officialTranscript',
    bucket: 'transcripts',
    title: 'Official transcripts',
  },
  {
    id: 'income_tax',
    column: 'incomeTax',
    bucket: 'income_tax_papers',
    title: '2024 income tax returns',
  },
  {
    id: 'intro_video',
    column: 'introVideo',
    bucket: 'self_introduction_video',
    title: 'Self-introduction video for job search (up to 3 minutes)',
    accept: 'video/*',
  },
  {
    id: 'evidence',
    column: 'evidenceFile',
    bucket: 'miscellaneous_evidence_file',
    title:
      'Verification/evidence of service, leadership, employment, licenses, or certificates',
  },
]

type Props = {
  application: Record<string, unknown> | null
}

type SubmittedDocumentLinkProps = {
  application: Record<string, unknown> | null
  column: ApplicationDocumentColumn
  latestUrl?: string | null
  onRemove?: () => void
  removing?: boolean
}

// Renders the submitted document link for a specific application document field.
function SubmittedDocumentLink({
  application,
  column,
  latestUrl,
  onRemove,
  removing,
}: SubmittedDocumentLinkProps) {
  const currentUrl = latestUrl ?? pickDocUrl(application, column)
  if (!currentUrl) {
    return <p className="mt-2 text-sm text-gray-600">No submitted file yet.</p>
  }

  return (
    <div className="mt-2 flex items-center gap-2 break-all text-sm">
      <span className="font-medium">Submitted file: </span>
      <a
        href={currentUrl}
        download
        className="text-[var(--color-blue)] underline"
      >
        Download submitted file
      </a>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="rounded border border-red-300 px-2 py-0.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
          aria-label="Remove submitted file"
          title="Remove submitted file"
        >
          {removing ? '...' : 'X'}
        </button>
      )}
    </div>
  )
}

// Renders upload zones and handles document upload flow for each required section.
export function ApplicantDocumentsUpload({ application }: Props) {
  const router = useRouter()
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [latestBucketUrls, setLatestBucketUrls] = useState<
    Partial<Record<ApplicationDocumentColumn, string>>
  >({})
  const [latestBucketPaths, setLatestBucketPaths] = useState<
    Partial<Record<ApplicationDocumentColumn, string>>
  >({})
  const [removingColumn, setRemovingColumn] = useState<ApplicationDocumentColumn | null>(null)
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // Loads latest document URLs directly from storage buckets when page/component loads.
  const loadLatestBucketUrls = useCallback(async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const folderPath = `users/${user.id}`
    const nextUrls: Partial<Record<ApplicationDocumentColumn, string>> = {}
    const nextPaths: Partial<Record<ApplicationDocumentColumn, string>> = {}

    await Promise.all(
      SECTIONS.map(async (section) => {
        const { data: files, error: listErr } = await supabase.storage
          .from(section.bucket)
          .list(folderPath, { limit: 100, offset: 0 })
        if (listErr || !files?.length) return

        const candidates = files.filter((f) => f.name.startsWith(section.id))
        if (candidates.length === 0) return

        const newest = [...candidates].sort((a, b) => {
          const aTime = Date.parse(String(a.updated_at ?? a.created_at ?? ''))
          const bTime = Date.parse(String(b.updated_at ?? b.created_at ?? ''))
          if (Number.isNaN(aTime) && Number.isNaN(bTime)) return b.name.localeCompare(a.name)
          if (Number.isNaN(aTime)) return 1
          if (Number.isNaN(bTime)) return -1
          return bTime - aTime
        })[0]

        const path = `${folderPath}/${newest.name}`
        const { data: pub } = supabase.storage.from(section.bucket).getPublicUrl(path)
        nextUrls[section.column] = pub.publicUrl
        nextPaths[section.column] = path
      })
    )

    setLatestBucketUrls(nextUrls)
    setLatestBucketPaths(nextPaths)
  }, [])

  const removeLatestFile = useCallback(
    async (section: Section) => {
      setError(null)
      setRemovingColumn(section.column)
      try {
        const supabase = createClient()
        const path = latestBucketPaths[section.column]
        if (!path) return

        const { error: removeErr } = await supabase.storage.from(section.bucket).remove([path])
        if (removeErr) {
          console.error(removeErr)
          setError(removeErr.message)
          return
        }

        const clearResult = await clearApplicationDocumentUrl(section.column)
        if ('error' in clearResult && clearResult.error) {
          setError(clearResult.error)
          return
        }

        await loadLatestBucketUrls()
        router.refresh()
      } finally {
        setRemovingColumn(null)
      }
    },
    [latestBucketPaths, loadLatestBucketUrls, router]
  )

  useEffect(() => {
    void loadLatestBucketUrls()
  }, [loadLatestBucketUrls])

  // Uploads the selected file, then saves its public URL on the current application row.
  const uploadFile = useCallback(
    async (section: Section, file: File) => {
      setError(null)
      if (file.size > MAX_BYTES) {
        setError(`File is too large (max 50 MB): ${file.name}`)
        return
      }

      setUploadingId(section.id)
      try {
        // get user id from supabase
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          setError('You must be signed in to upload.')
          return
        }

        // Remove older versions for this section so only the newest submission remains.
        const folderPath = `users/${user.id}`
        const { data: existingFiles, error: listErr } = await supabase.storage
          .from(section.bucket)
          .list(folderPath, {
            limit: 100,
            offset: 0,
          })
        if (listErr) {
          console.error(listErr)
          setError(listErr.message)
          return
        }

        const stalePaths = (existingFiles ?? [])
          .filter((f) => f.name.startsWith(section.id))
          .map((f) => `${folderPath}/${f.name}`)
        if (stalePaths.length > 0) {
          const { error: removeErr } = await supabase.storage.from(section.bucket).remove(stalePaths)
          if (removeErr) {
            console.error(removeErr)
            setError(removeErr.message)
            return
          }
        }

        // Upload under a unique file name to avoid stale browser cache.
        const ext = extensionFromName(file.name)
        const path = `users/${user.id}/${section.id}-${Date.now()}${ext}`

        // error handling for upload
        const { error: upErr } = await supabase.storage
          .from(section.bucket)
          .upload(path, file, { upsert: false, cacheControl: '0' })
        if (upErr) {
          console.error(upErr)
          setError(upErr.message)
          return
        }

        // get public url for file
        const { data: pub } = supabase.storage.from(section.bucket).getPublicUrl(path)
        const publicUrl = pub.publicUrl

        //saves the public url of file to the corresponding column in the applications table
        const res = await saveApplicationDocumentUrl(section.column, publicUrl)
        if ('error' in res && res.error) {
          setError(res.error)
          return
        }

        await loadLatestBucketUrls()
        router.refresh()
      } finally {
        setUploadingId(null)
      }
    },
    [loadLatestBucketUrls, router]
  )

  // Handles standard file input selection and forwards file to shared upload logic.
  const onInputChange = (section: Section, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) void uploadFile(section, file)
  }

  // Handles drag-and-drop file uploads and forwards file to shared upload logic.
  const onDrop = (section: Section, e: React.DragEvent) => {
    e.preventDefault()
    setDragOverId(null)
    const file = e.dataTransfer.files?.[0]
    if (file) void uploadFile(section, file)
  }

  return (
    <div className="flex w-full flex-col gap-10 text-left text-black">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
          {error}
        </p>
      )}

      {SECTIONS.map((section) => {
        const isDragging = dragOverId === section.id
        const isBusy = uploadingId === section.id

        return (
          <section key={section.id} className="border-b border-green-100 pb-10 last:border-0 last:pb-0">
            <h3 className="mb-3 text-lg font-semibold text-black">{section.title}</h3>

            <div className="mb-4 space-y-2 text-sm leading-relaxed text-black">
              {section.id === 'enrollment' && (
                <>
                  <p>You must submit an OFFICIAL document, or you will not be eligible.</p>
                  <p>
                    The document must be issued by your current institution in the Fall 2025
                    semester.
                  </p>
                  <p>The document must show that you are a full-time student.</p>
                </>
              )}
              {section.id === 'transcripts' && (
                <>
                  <p>You must submit an OFFICIAL document, or you will not be eligible.</p>
                  <p>
                    The document must show your academic achievement for at least one full year
                    prior to the scholarship application.
                  </p>
                  <p>
                    Example: If you are a freshman or transfer beginning in Fall 2025 and your
                    current transcript has no records yet, submit the official transcript from your
                    previous institution.
                  </p>
                </>
              )}
              {section.id === 'income_tax' && (
                <>
                  <p>The address printed in the tax filing document must be in the DMV area.</p>
                  <p>
                    If filed as a dependent: Submit your parents&apos; income tax return that lists
                    you as a dependent.
                  </p>
                  <p>
                    If filed as independent: Submit (a) your income tax return, and (b) a brief
                    statement justifying your financial independence.
                  </p>
                </>
              )}
              {section.id === 'intro_video' && (
                <>
                  <p>
                    Create a concise presentation video as if applying for an internship or job
                    you&apos;re passionate about. Use O*NET to research the role and compare its
                    requirements with your own profile.
                  </p>
                  <p>
                    Visit onetonline.org, search your target job, open the matching result, click
                    the Details tab, and identify the most significant Knowledge, Skills, and
                    Abilities.
                  </p>
                  <p>
                    In your video, present your strengths and how you&apos;ll address weaknesses to
                    maximize success in the role.
                  </p>
                  <p>
                    Evaluation criteria: (a) Content quality (alignment &amp; depth of
                    self-assessment); (b) Presentation effectiveness (persuasiveness &amp;
                    professionalism); (c) Action plan (strategy for growth &amp; overcoming
                    weaknesses).
                  </p>
                </>
              )}
              {section.id === 'evidence' && (
                <>
                  <p>Combine items into one single file and upload it.</p>
                  <p>You must provide verification/evidence—claims alone do not receive credit.</p>
                  <p>Examples include (but are not limited to):</p>
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      Language certifications: TOPIK, JLPT, ASL
                    </li>
                    <li>
                      Practical skills certifications: Lifeguarding, Food Service, First Aid/CPR,
                      Skilled trades
                    </li>
                    <li>Employment: Full-time/part-time work; paid or unpaid internships</li>
                    <li>
                      Community service: Volunteering for non-profits, religious orgs, schools
                    </li>
                    <li>Leadership: Roles in sports teams, work groups, or student organizations</li>
                  </ul>
                </>
              )}
            </div>

            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  inputRefs.current[section.id]?.click()
                }
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                setDragOverId(section.id)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverId(null)
                }
              }}
              onDragOver={(e) => {
                e.preventDefault()
                e.dataTransfer.dropEffect = 'copy'
              }}
              onDrop={(e) => onDrop(section, e)}
              onClick={() => inputRefs.current[section.id]?.click()}
              className={`cursor-pointer rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors ${
                isDragging
                  ? 'border-[var(--color-green)] bg-[var(--color-green-light)]'
                  : 'border-green-300 bg-white hover:border-[var(--color-green)] hover:bg-green-50/50'
              } ${isBusy ? 'pointer-events-none opacity-70' : ''}`}
            >
              <input
                ref={(el) => {
                  inputRefs.current[section.id] = el
                }}
                type="file"
                className="hidden"
                accept={section.accept ?? '*/*'}
                onChange={(e) => onInputChange(section, e)}
                disabled={isBusy}
              />
              <p className="text-sm font-medium text-black">
                {isBusy ? 'Uploading…' : 'Drag and drop a file here, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-600">Max 50 MB · Any file type</p>
            </div>

            <SubmittedDocumentLink
              application={application}
              column={section.column}
              latestUrl={latestBucketUrls[section.column] ?? null}
              onRemove={
                latestBucketPaths[section.column]
                  ? () => {
                      void removeLatestFile(section)
                    }
                  : undefined
              }
              removing={removingColumn === section.column}
            />
          </section>
        )
      })}
    </div>
  )
}
