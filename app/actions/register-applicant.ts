'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'

const APPLICANT_DOCUMENT_BUCKETS = [
  'miscellaneous_evidence_file',
  'self_introduction_video',
  'income_tax_papers',
  'transcripts',
  'enrollment_documents',
] as const

export async function registerApplicant(
  _prev: unknown,
  formData: FormData
) {
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null

  if (!email?.trim() || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (error) throw error
  if (!user) {
    return { error: 'Account could not be created.' }
  }

  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user: user.id,
      role: 'applicant',
    })

  if (roleError) {
    console.error('ROLE INSERT ERROR:', roleError)
    return { error: roleError.message }
  }

  // Empty application row: only user_id and status fields set; rest null.
  // Keys must match Supabase column names (adjust if your DB uses snake_case).
  const { error: applicationError } = await supabase.from('Applications').insert({
    user_id: user.id,
    firstName: null,
    lastName: null,
    phoneNumber: null,
    email: email.trim(),
    parentsEmail: null,
    school: null,
    major: null,
    enrollmentDoc: null,
    officialTranscript: null,
    incomeTax: null,
    introVideo: null,
    evidenceFile: null,
    grade: null,
    completionStatus: 'Pending',
    acceptenceStatus: 'Pending',
    submissionDate: null,
  })

  if (applicationError) {
    console.error('APPLICATION INSERT ERROR:', applicationError)
    return { error: applicationError.message }
  }

  // Pre-create users/{uuid}/ in each document bucket so portal uploads
  // can consistently target a stable per-user folder path.
  const folderMarker = new TextEncoder().encode('folder')
  const folderPath = `users/${user.id}/.keep`
  const bucketResults = await Promise.all(
    APPLICANT_DOCUMENT_BUCKETS.map(async (bucket) => {
      const { error: bucketError } = await supabase.storage
        .from(bucket)
        .upload(folderPath, folderMarker, {
          upsert: true,
          contentType: 'text/plain',
          cacheControl: '0',
        })
      return { bucket, bucketError }
    })
  )

  const failedBucket = bucketResults.find((r) => r.bucketError)
  if (failedBucket?.bucketError) {
    console.error('APPLICANT FOLDER SETUP ERROR:', failedBucket.bucket, failedBucket.bucketError)
    return { error: failedBucket.bucketError.message }
  }

  redirect('/applicant-login')
}
