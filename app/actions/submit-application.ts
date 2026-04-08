'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

export async function submitApplication() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' }

  const { data: current, error: readError } = await supabase
    .from('Applications')
    .select('completionStatus, completion_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (readError) {
    console.error('SUBMIT APPLICATION READ:', readError)
    return { error: readError.message }
  }

  const currentStatus =
    (current?.completionStatus as string | undefined) ??
    (current?.completion_status as string | undefined) ??
    null

  if (currentStatus === 'Submitted') {
    return { success: true as const, alreadySubmitted: true as const }
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
