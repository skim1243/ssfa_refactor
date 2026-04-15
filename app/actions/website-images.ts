'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'

const BUCKET = 'website_images'

async function requireAdmin() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be signed in.' as const, supabase: null }

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (roleRow?.role !== 'admin') return { error: 'Not allowed.' as const, supabase: null }
  return { error: null as string | null, supabase }
}

export async function uploadWebsiteImage(formData: FormData) {
  const gate = await requireAdmin()
  if (gate.error) return { error: gate.error }

  const file = formData.get('file')
  if (!(file instanceof File)) return { error: 'Missing file.' as const }
  if (!file.type.startsWith('image/')) return { error: 'Please upload an image file.' as const }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${Date.now()}-${safeName}`

  const admin = createServiceRoleSupabaseClient()
  if (!admin) return { error: 'Missing SUPABASE_SERVICE_ROLE_KEY on server.' as const }

  const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  })
  if (uploadError) {
    console.error('UPLOAD WEBSITE IMAGE:', uploadError)
    return { error: uploadError.message }
  }

  const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path)
  revalidatePath('/admin/articles/editor')
  return {
    success: true as const,
    path,
    publicUrl: publicData.publicUrl,
  }
}

export async function deleteWebsiteImage(params: { path: string }) {
  const gate = await requireAdmin()
  if (gate.error) return { error: gate.error }

  const path = String(params.path ?? '').trim()
  if (!path) return { error: 'Missing file path.' as const }

  const admin = createServiceRoleSupabaseClient()
  if (!admin) return { error: 'Missing SUPABASE_SERVICE_ROLE_KEY on server.' as const }

  const { error } = await admin.storage.from(BUCKET).remove([path])
  if (error) {
    console.error('DELETE WEBSITE IMAGE:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/articles/editor')
  return { success: true as const }
}
