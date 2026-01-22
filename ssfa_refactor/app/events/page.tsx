import { createServerClient } from '../utils/supabase/server'
import { NewsListItem } from '../components/NewsListItem';

export default async function Events() {
  // Fetch the 10 most recent published articles
  const supabase = createServerClient()
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Recent Articles & Events</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl">
        Stay updated with the latest news, announcements, and events from the Sejong Scholarship Foundation in America.
      </p>

      <div className="grid gap-4 w-full md:w-3/4">
        {recentArticles && recentArticles.length > 0 ? (
          recentArticles.map((article: any, index: number) => (
            <NewsListItem
              key={article.id}
              title={article.title}
              description={article.excerpt || article.content?.find((el: any) => el.type === 'text')?.content?.substring(0, 150) + '...' || 'Read the full article...'}
              date={new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              link={`/articles/${article.slug}`}
              image={article.featured_image || "/placeholder-image.svg"}
              backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
            />
          ))
        ) : (
          // Fallback content when no articles exist
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles published yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for updates!</p>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/events/archive" className="text-blue-600 hover:underline text-lg font-semibold">
            View Events Archive
          </a>
        </div>
      </div>
    </div>
  );
}
