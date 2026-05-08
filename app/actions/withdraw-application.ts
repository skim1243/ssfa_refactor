'use server'

import { revalidatePath } from 'next/cache'
import { APPLICANT_DOCUMENT_BUCKETS } from '@/app/constants/applicant-document-buckets'
import { createServerClient } from '@/app/utils/supabase/server'
import type { ApplicationDocumentColumn } from '@/app/actions/save-application-document-url'

const DOCUMENT_COLUMNS: ApplicationDocumentColumn[] = [
  'enrollmentDoc',
  'officialTranscript',
  'incomeTax',
  'introVideo',
  'evidenceFile',
]

const ALLOWED_BUCKETS = new Set<string>([...APPLICANT_DOCUMENT_BUCKETS])

const SNAKE_MAP: Record<ApplicationDocumentColumn, string> = {
  enrollmentDoc: 'enrollment_doc',
  officialTranscript: 'official_transcript',
  incomeTax: 'income_tax',
  introVideo: 'intro_video',
  evidenceFile: 'evidence_file',
}

function readDocUrl(row: Record<string, unknown>, col: ApplicationDocumentColumn): string | null {
  const v = row[col] ?? row[SNAKE_MAP[col]]
  if (v == null || v === '') return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

/** Parses a Supabase public object URL into bucket + storage path. */
function parseSupabasePublicStorageUrl(url: string): { bucket: string; path: string } | null {
  const trimmed = url.split('?')[0]?.trim() ?? ''
  const marker = '/storage/v1/object/public/'
  const idx = trimmed.indexOf(marker)
  if (idx === -1) return null
  const after = trimmed.slice(idx + marker.length)
  const slash = after.indexOf('/')
  if (slash === -1) return null
  const bucket = after.slice(0, slash)
  const encodedPath = after.slice(slash + 1)
  if (!bucket || !encodedPath) return null
  const path = encodedPath
    .split('/')
    .map((segment) => decodeURIComponent(segment))
    .join('/')
  return { bucket, path }
}

export async function withdrawApplication() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' as const }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('"user"', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'applicant') return { error: 'Not allowed.' as const }

  const { data: app, error: readError } = await supabase
    .from('Applications')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    console.error('WITHDRAW READ:', readError)
    return { error: readError.message }
  }
  if (!app) return { error: 'No application found.' as const }

  const row = app as Record<string, unknown>
  const status =
    (row.completionStatus as string | undefined) ??
    (row.completion_status as string | undefined) ??
    null

  if (status === 'Withdrawn') {
    return { error: 'This application has already been withdrawn.' as const }
  }

  const userPrefix = `users/${user.id}/`

  for (const col of DOCUMENT_COLUMNS) {
    const url = readDocUrl(row, col)
    if (!url) continue

    const parsed = parseSupabasePublicStorageUrl(url)
    if (!parsed) {
      console.warn('WITHDRAW: could not parse storage URL', col, url)
      continue
    }
    if (!ALLOWED_BUCKETS.has(parsed.bucket)) {
      console.warn('WITHDRAW: unexpected bucket', parsed.bucket)
      continue
    }
    if (!parsed.path.startsWith(userPrefix)) {
      console.warn('WITHDRAW: path not in user folder', parsed.path)
      continue
    }

    const { error: removeErr } = await supabase.storage.from(parsed.bucket).remove([parsed.path])
    if (removeErr) {
      console.error('WITHDRAW REMOVE:', col, removeErr)
    }
  }

  const email = user.email?.trim() ?? null

  const { error: updateError } = await supabase
    .from('Applications')
    .update({
      firstName: null,
      lastName: null,
      phoneNumber: null,
      email,
      parentsEmail: null,
      school: null,
      major: null,
      grade: null,
      enrollmentDoc: null,
      officialTranscript: null,
      incomeTax: null,
      introVideo: null,
      evidenceFile: null,
      completionStatus: 'Withdrawn',
      acceptenceStatus: 'Pending',
      submissionDate: null,
    })
    .eq('user_id', user.id)

  if (updateError) {
    console.error('WITHDRAW UPDATE:', updateError)
    return { error: updateError.message }
  }

  revalidatePath('/applicant-portal')
  return { success: true as const }
}
