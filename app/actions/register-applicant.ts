'use server'

import { redirect } from 'next/navigation'
import { APPLICANT_DOCUMENT_BUCKETS } from '@/app/constants/applicant-document-buckets'
import {
  emptyApplicationInsertPayload,
  upsertEmptyApplicationForCycle,
} from '@/app/lib/applicant-application-payload'
import {
  applicationCycleKeyFromRow,
  findCurrentRunningCycle,
  type ApplicationCycleRow,
} from '@/app/lib/application-cycle-helpers'
import { runGlobalApplicationCycleSync } from '@/app/lib/applicant-portal-lifecycle'
import { createServerClient } from '@/app/utils/supabase/server'

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

  await runGlobalApplicationCycleSync(supabase)

  const { data: cycles, error: cyclesError } = await supabase.from('applicationCycle').select('*')
  if (cyclesError) {
    console.error('REGISTER APPLICANT (cycles):', cyclesError)
    return { error: cyclesError.message }
  }

  const activeCycle = findCurrentRunningCycle((cycles ?? []) as ApplicationCycleRow[], Date.now())
  const activeCycleKey =
    activeCycle == null ? null : applicationCycleKeyFromRow(activeCycle as ApplicationCycleRow)

  if (activeCycleKey) {
    const { error: applicationError } = await upsertEmptyApplicationForCycle(
      supabase,
      emptyApplicationInsertPayload(user.id, email.trim(), activeCycleKey),
    )

    if (applicationError) {
      console.error('APPLICATION UPSERT ERROR:', applicationError)
      return { error: applicationError.message }
    }
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
