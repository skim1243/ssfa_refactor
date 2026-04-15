import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { createServiceRoleSupabaseClient } from '@/app/utils/supabase/service-role'
import {
  type ArticleLoaderJson,
  type ArticleContentBlock,
  type ArticleBlockKey,
} from '@/app/components/ArticleLoader'
import { AdminArticleEditor } from '@/app/components/AdminArticleEditor'

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

type WebsiteImageItem = {
  path: string
  name: string
  publicUrl: string
  updatedAt: string
}

function firstParam(v: string | string[] | undefined): string {
  if (v == null) return ''
  return Array.isArray(v) ? (v[0] ?? '') : v
}

const VALID_KEYS: ArticleBlockKey[] = ['title', 'h1', 'h2', 'h3', 'p', 'img', 'vid', 'flicker']

function normalizeBlocks(value: unknown): ArticleLoaderJson {
  let parsed: unknown = value
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown
    } catch {
      return []
    }
  }
  if (!Array.isArray(parsed)) return []

  const out: ArticleLoaderJson = []
  for (const item of parsed) {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) continue
    const keys = Object.keys(item as Record<string, unknown>)
    if (keys.length !== 1) continue
    const key = keys[0] as ArticleBlockKey
    if (!VALID_KEYS.includes(key)) continue
    const raw = (item as Record<string, unknown>)[key]
    out.push({ [key]: String(raw ?? '') } as ArticleContentBlock)
  }
  return out
}

export default async function AdminEditArticlePage({ searchParams }: PageProps) {
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

  const sp = searchParams != null ? await searchParams : {}
  const rowId = firstParam(sp.id).trim()
  if (!rowId) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Missing article id for edit.
      </div>
    )
  }

  let imageLibrary: WebsiteImageItem[] = []
  const { data: row, error } = await supabase.from('Articles').select('*').eq('id', rowId).maybeSingle()
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Failed to load article: {error.message}
      </div>
    )
  }
  if (!row) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
        Article not found.
      </div>
    )
  }

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
      articleId={rowId}
      initialTitle={String(row.title ?? '')}
      initialTitleImage={String(row.titleImage ?? row.title_image ?? '')}
      initialShortDescription={String(row.shortDescription ?? row.short_description ?? '')}
      initialBlocks={normalizeBlocks(row.article)}
      initialImageLibrary={imageLibrary}
    />
  )
}
