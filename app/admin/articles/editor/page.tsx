import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'
import { type ArticleLoaderJson } from '@/app/components/ArticleLoader'
import { AdminArticleEditor } from '@/app/components/AdminArticleEditor'

type WebsiteImageItem = {
  path: string
  name: string
  publicUrl: string
  updatedAt: string
}

export default async function AdminArticleEditorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/staff-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'admin') {
    redirect('/auth-error')
  }

  let initialTitle = ''
  let initialTitleImage = ''
  let initialShortDescription = ''
  let initialBlocks: ArticleLoaderJson = []
  let imageLibrary: WebsiteImageItem[] = []

  const admin = createServiceRoleSupabaseClient()
  if (admin) {
    const { data: files } = await admin.storage
      .from('website_images')
      .list('', { limit: 200, sortBy: { column: 'updated_at', order: 'desc' } })
    imageLibrary = (files ?? [])
      .filter((f) => !!f.name && !f.name.endsWith('/'))
      .map((f) => {
        const path = f.name
        const { data } = admin.storage.from('website_images').getPublicUrl(path)
        return {
          path,
          name: f.name,
          publicUrl: data.publicUrl,
          updatedAt: f.updated_at ?? '',
        }
      })
  }

  return (
    <AdminArticleEditor
      articleId={null}
      initialTitle={initialTitle}
      initialTitleImage={initialTitleImage}
      initialShortDescription={initialShortDescription}
      initialBlocks={initialBlocks}
      initialImageLibrary={imageLibrary}
    />
  )
}
