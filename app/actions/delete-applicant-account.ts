'use server'

import { revalidatePath } from 'next/cache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { APPLICANT_DOCUMENT_BUCKETS } from '@/app/constants/applicant-document-buckets'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

const STORAGE_REMOVE_CHUNK_SIZE = 100

async function collectAllStorageObjectPaths(
  admin: SupabaseClient,
  bucket: string,
  folderPath: string
) {
  const files: string[] = []
  const queue: string[] = [folderPath]

  while (queue.length > 0) {
    const currentFolder = queue.shift()
    if (!currentFolder) continue

    let offset = 0
    for (;;) {
      const { data: entries, error: listErr } = await admin.storage.from(bucket).list(currentFolder, {
        limit: 1000,
        offset,
      })
      if (listErr) {
        console.error('LIST APPLICANT STORAGE:', bucket, currentFolder, listErr)
        return { error: listErr.message } as const
      }

      const batch = entries ?? []
      for (const entry of batch) {
        if (!entry.name) continue
        const fullPath = `${currentFolder}/${entry.name}`
        // Folder entries have no metadata/id; queue them for recursive traversal.
        if (!entry.metadata && !entry.id) {
          queue.push(fullPath)
          continue
        }
        files.push(fullPath)
      }

      if (batch.length < 1000) break
      offset += 1000
    }
  }

  return { files } as const
}

/** Removes every object under `users/{userId}/` in each applicant document bucket (service role). */
async function purgeApplicantStorageFolders(admin: SupabaseClient, userId: string) {
  const prefix = `users/${userId}`
  for (const bucket of APPLICANT_DOCUMENT_BUCKETS) {
    const discovered = await collectAllStorageObjectPaths(admin, bucket, prefix)
    if ('error' in discovered) return discovered
    if (discovered.files.length === 0) continue

    for (let i = 0; i < discovered.files.length; i += STORAGE_REMOVE_CHUNK_SIZE) {
      const chunk = discovered.files.slice(i, i + STORAGE_REMOVE_CHUNK_SIZE)
      const { error: removeErr } = await admin.storage.from(bucket).remove(chunk)
      if (removeErr) {
        console.error('REMOVE APPLICANT STORAGE:', bucket, removeErr)
        return { error: removeErr.message } as const
      }
    }
  }
  return { success: true as const }
}

/** Deletes applicant storage (when present), application row, `user_roles` row, and Auth user (admin only). */
export async function deleteApplicantAccountAndApplication(params: { targetUserId: string }) {
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

  const targetUserId = String(params.targetUserId ?? '').trim()
  if (!targetUserId) return { error: 'Missing user id.' as const }
  if (targetUserId === user.id) return { error: 'You cannot delete your own account.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) {
    return {
      error:
        'Full account deletion requires SUPABASE_SERVICE_ROLE_KEY on the server. Add it to your environment and restart.',
    } as const
  }

  const [{ data: targetRole }, { data: applicationRow }] = await Promise.all([
    admin.from('user_roles').select('role').eq('user', targetUserId).maybeSingle(),
    admin.from('Applications').select('user_id').eq('user_id', targetUserId).limit(1).maybeSingle(),
  ])

  const shouldPurgeApplicantBuckets =
    targetRole?.role === 'applicant' || Boolean(applicationRow)

  if (shouldPurgeApplicantBuckets) {
    const purge = await purgeApplicantStorageFolders(admin, targetUserId)
    if ('error' in purge) return purge
  }

  // Remove every application row for this account (all cycles / multiple rows per user_id).
  const { error: appErr } = await admin.from('Applications').delete().eq('user_id', targetUserId)
  if (appErr) {
    console.error('DELETE APPLICATIONS:', appErr)
    return { error: appErr.message}
  }

  const { error: roleErr } = await admin.from('user_roles').delete().eq('user', targetUserId)
  if (roleErr) {
    console.error('DELETE USER ROLES:', roleErr)
    return { error: roleErr.message}
  }

  const { error: authErr } = await admin.auth.admin.deleteUser(targetUserId)
  if (authErr) {
    console.error('DELETE AUTH USER:', authErr)
    return { error: authErr.message}
  }

  revalidatePath('/admin/applications')
  revalidatePath('/admin/users')
  return { success: true as const }
}
