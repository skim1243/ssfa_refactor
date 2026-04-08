'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import type { ApplicationDocumentColumn } from '@/app/actions/save-application-document-url'

export async function clearApplicationDocumentUrl(column: ApplicationDocumentColumn) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const { error } = await supabase
    .from('Applications')
    .update({ [column]: null })
    .eq('user_id', user.id)

  if (error) {
    console.error('CLEAR DOCUMENT URL:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  return { success: true as const }
}
