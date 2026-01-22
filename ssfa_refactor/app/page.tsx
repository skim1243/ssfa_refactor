import { createServerClient } from './utils/supabase/server'
import { Slideshow } from '../components/Slideshow';
import { NewsListItem } from '../app/components/NewsListItem';

export default async function Home() {
  // Fetch the 3 most recent published articles
  const supabase = createServerClient()
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(3)

  return (
      <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="h-[700px] w-full flex items-center justify-center bg-blue-200"><Slideshow /></div>
      <div className="h-[700px] w-full flex items-center justify-center bg-white text-black">Who are we</div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Our Impact</div>
      <div className="min-h-[700px] w-full flex flex-col items-center justify-center bg-white py-10">
        <h2 className="text-3xl font-bold mb-6 text-black">Recent News</h2>
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
                backgroundColor={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
              />
            ))
          ) : (
            // Fallback content when no articles exist
            <>
              <NewsListItem
                title="Welcome to SSFA News"
                description="Stay updated with the latest news and announcements from the Sejong Scholarship Foundation in America."
                date="January 2025"
                link="/articles/welcome-to-ssfa-news"
                image="/placeholder-image.svg"
                backgroundColor="bg-white"
              />
            </>
          )}
        </div>

        {/* Link to Events page */}
        <div className="text-center mt-8">
          <a
            href="/events"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Articles & Events
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Get Involved</div>
    </main>
  );
}
