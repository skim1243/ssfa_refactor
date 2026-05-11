'use server'

import { revalidatePath } from 'next/cache'
import { resolvePortalApplicationRowForApplicant } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

const REQUIRED_FIELDS = [
  { column: 'firstName', label: 'First name' },
  { column: 'lastName', label: 'Last name' },
  { column: 'phoneNumber', label: 'Phone number' },
  { column: 'email', label: 'Email' },
  { column: 'school', label: 'School' },
  { column: 'grade', label: 'Grade' },
  { column: 'major', label: 'Major' },
  { column: 'enrollmentDoc', label: 'Enrollment document' },
  { column: 'officialTranscript', label: 'Official transcript' },
  { column: 'incomeTax', label: 'Income tax' },
  { column: 'introVideo', label: 'Intro video' },
  { column: 'evidenceFile', label: 'Evidence file' },
] as const

function hasValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

export async function submitApplication(applicationId?: string | null) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const explicitId = String(applicationId ?? '').trim() || null

  const portalRow = await resolvePortalApplicationRowForApplicant(
    supabase,
    user.id,
    user.email?.trim() ?? '',
    explicitId,
  )
  const rowId = portalRow?.id
  if (rowId == null || rowId === '') {
    return { error: 'No application found for the current cycle.' }
  }

  const current = portalRow as Record<string, unknown>

  const currentStatus = (current.completionStatus as string | undefined) ?? null

  if (currentStatus === 'Submitted') {
    return { success: true as const, alreadySubmitted: true as const }
  }
  if (currentStatus === 'Overdue') {
    return { error: 'This application is overdue and can no longer be submitted.' }
  }
  if (currentStatus === 'Withdrawn') {
    return { error: 'This application was withdrawn and can no longer be submitted.' }
  }

  const missing = REQUIRED_FIELDS.filter((field) => !hasValue(current[field.column])).map(
    (field) => field.label
  )
  if (missing.length > 0) {
    return {
      error: `Please complete all required fields before submitting. Missing: ${missing.join(', ')}.`,
    }
  }

  const { error } = await supabase
    .from('Applications')
    .update({
      completionStatus: 'Submitted',
      submissionDate: new Date().toISOString(),
    })
    .eq('id', rowId)

  if (error) {
    console.error('SUBMIT APPLICATION UPDATE:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true as const }
}
