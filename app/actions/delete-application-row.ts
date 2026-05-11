'use server'

import { revalidatePath } from 'next/cache'
import { removeApplicationDocumentsFromStorage } from '@/app/lib/application-document-storage'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

/** Deletes one `Applications` row by primary key and removes its linked storage objects. Does not delete Auth or roles. */
export async function deleteApplicationRow(params: { applicationId: string }) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' as const }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') return { error: 'Not allowed.' as const }

  const applicationId = String(params.applicationId ?? '').trim()
  if (!applicationId) return { error: 'Missing application id.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return {
      error:
        'Deleting applications requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it to your environment and restart.',
    } as const
  }

  const { data: row, error: readErr } = await admin.from('Applications').select('*').eq('id', applicationId).maybeSingle()

  if (readErr) {
    console.error('DELETE APPLICATION ROW (read):', readErr)
    return { error: readErr.message }
  }
  if (!row) return { error: 'Application not found.' as const }

  const record = row as Record<string, unknown>
  const ownerId = (record.user_id as string | undefined) ?? (record.userId as string | undefined)
  if (!ownerId) {
    return { error: 'Application row is missing user_id.' as const }
  }

  await removeApplicationDocumentsFromStorage(admin, ownerId, record)

  const { error: delErr } = await admin.from('Applications').delete().eq('id', applicationId)
  if (delErr) {
    console.error('DELETE APPLICATION ROW:', delErr)
    return { error: delErr.message }
  }

  revalidatePath('/admin/applications')
  return { success: true as const }
}
