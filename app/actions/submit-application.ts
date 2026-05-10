'use server'

import { revalidatePath } from 'next/cache'
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

export async function submitApplication() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const { data: current, error: readError } = await supabase
    .from('Applications')
    .select(
      'completionStatus, firstName, lastName, phoneNumber, email, school, grade, major, enrollmentDoc, officialTranscript, incomeTax, introVideo, evidenceFile'
    )
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    console.error('SUBMIT APPLICATION READ:', readError)
    return { error: readError.message }
  }

  const currentStatus = (current?.completionStatus as string | undefined) ?? null

  if (currentStatus === 'Submitted') {
    return { success: true as const, alreadySubmitted: true as const }
  }

  const missing = REQUIRED_FIELDS.filter((field) => !hasValue(current?.[field.column])).map(
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
    .eq('user_id', user.id)

  if (error) {
    console.error('SUBMIT APPLICATION UPDATE:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  return { success: true as const }
}
