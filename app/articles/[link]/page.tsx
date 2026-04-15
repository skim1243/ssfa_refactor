import { notFound } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { ArticleLoader } from '@/app/components/ArticleLoader'

interface ArticlePublicPageProps {
  params: Promise<{ link: string }>
}

export default async function ArticlePublicPage({ params }: ArticlePublicPageProps) {
  const { link } = await params
  const normalizedLink = String(link ?? '').trim()
  if (!normalizedLink) notFound()

  const supabase = await createServerClient()
  const { data: row, error } = await supabase
    .from('Articles')
    .select('article')
    .eq('link', normalizedLink)
    .eq('status', 'published')
    .maybeSingle()

  if (error || !row) notFound()

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <ArticleLoader json={row.article} />
    </div>
  )
}
