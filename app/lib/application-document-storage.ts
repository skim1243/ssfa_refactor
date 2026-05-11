import type { SupabaseClient } from '@supabase/supabase-js'
import { APPLICANT_DOCUMENT_BUCKETS } from '@/app/constants/applicant-document-buckets'
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

export function readApplicationDocUrl(
  row: Record<string, unknown>,
  col: ApplicationDocumentColumn,
): string | null {
  const v = row[col] ?? row[SNAKE_MAP[col]]
  if (v == null || v === '') return null
  const s = String(v).trim()
  return s.length > 0 ? s : null
}

/** Parses a Supabase public object URL into bucket + storage path. */
export function parseSupabasePublicStorageUrl(url: string): { bucket: string; path: string } | null {
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

/** Removes known applicant document objects from storage for one application row. */
export async function removeApplicationDocumentsFromStorage<T extends SupabaseClient>(
  supabase: T,
  userId: string,
  row: Record<string, unknown>,
): Promise<void> {
  const userPrefix = `users/${userId}/`

  for (const col of DOCUMENT_COLUMNS) {
    const url = readApplicationDocUrl(row, col)
    if (!url) continue

    const parsed = parseSupabasePublicStorageUrl(url)
    if (!parsed) {
      console.warn('APPLICATION STORAGE: could not parse URL', col, url)
      continue
    }
    if (!ALLOWED_BUCKETS.has(parsed.bucket)) {
      console.warn('APPLICATION STORAGE: unexpected bucket', parsed.bucket)
      continue
    }
    if (!parsed.path.startsWith(userPrefix)) {
      console.warn('APPLICATION STORAGE: path not in user folder', parsed.path)
      continue
    }

    const { error: removeErr } = await supabase.storage.from(parsed.bucket).remove([parsed.path])
    if (removeErr) {
      console.error('APPLICATION STORAGE REMOVE:', col, removeErr)
    }
  }
}
