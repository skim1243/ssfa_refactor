'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'

/** Only non-empty trimmed fields are sent — empty inputs do not overwrite existing DB values. */
export async function saveApplicantInfo(formData: FormData) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'You must be signed in.' }

  const patch: Record<string, string> = {}
  // Adds a field to the DB patch only when the submitted value is non-empty.
  const add = (column: string, formKey: string) => {
    const v = (formData.get(formKey) as string | null)?.trim()
    if (v) patch[column] = v
  }

  add('firstName', 'firstName')
  add('lastName', 'lastName')
  add('phoneNumber', 'phoneNumber')
  add('email', 'email')
  add('parentsEmail', 'parentsEmail')
  add('school', 'school')
  add('major', 'major')

  const grade = (formData.get('grade') as string | null)?.trim()
  if (grade) patch.grade = grade

  if (Object.keys(patch).length === 0) {
    return { success: true as const, skipped: true as const }
  }

  const { error } = await supabase
    .from('Applications')
    .update(patch)
    .eq('user_id', user.id)

  if (error) {
    console.error('SAVE APPLICANT INFO:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  return { success: true as const }
}
