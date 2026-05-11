'use server'

import { revalidatePath } from 'next/cache'
import { resolvePortalApplicationRowForApplicant } from '@/app/lib/applicant-portal-lifecycle'
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

  const explicitId = String(formData.get('applicationId') ?? '').trim() || null

  const portalRow = await resolvePortalApplicationRowForApplicant(
    supabase,
    user.id,
    user.email?.trim() ?? '',
    explicitId,
  )
  const applicationId = portalRow?.id
  if (portalRow == null || applicationId == null || applicationId === '') {
    return { error: 'No application found for the current cycle.' }
  }

  const st =
    (portalRow.completionStatus as string | undefined) ??
    (portalRow.completion_status as string | undefined) ??
    null
  if (st === 'Withdrawn') {
    return { error: 'This application was withdrawn and can no longer be edited.' }
  }
  if (st === 'Overdue') {
    return { error: 'This application is overdue and can no longer be edited.' }
  }

  const { error } = await supabase.from('Applications').update(patch).eq('id', applicationId)

  if (error) {
    console.error('SAVE APPLICANT INFO:', error)
    return { error: error.message }
  }

  revalidatePath('/applicant-portal')
  revalidatePath('/applicant-archive')
  return { success: true as const }
}
