import { Slideshow } from './components/Slideshow';
import { NewsListItem } from '../app/components/NewsListItem';

const PLACEHOLDER_ARTICLES = [
  {
    id: '1',
    title: 'Welcome to SSFA News',
    excerpt: 'Stay updated with the latest news and announcements from the Sejong Scholarship Foundation in America.',
    published_at: new Date().toISOString(),
    slug: 'welcome-to-ssfa-news',
    featured_image: '/placeholder-image.svg',
  },
];

export default async function Home() {
  const recentArticles = PLACEHOLDER_ARTICLES;

  return (
      <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="h-[700px] w-full flex items-center justify-center bg-blue-200"><Slideshow /></div>
      <div className="h-[700px] w-full flex items-center justify-center bg-white text-black">Who are we</div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Our Impact</div>
      <div className="min-h-[700px] w-full flex flex-col items-center justify-center bg-white py-10">
        <h2 className="text-3xl font-bold mb-6 text-black">Recent News</h2>
        <div className="grid gap-4 w-full md:w-3/4">
          {recentArticles.map((article: { id: string; title: string; excerpt: string; published_at: string; slug: string; featured_image: string }, index: number) => (
            <NewsListItem
              key={article.id}
              title={article.title}
              description={article.excerpt || 'Read the full article...'}
              date={new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              link={`/events`}
              image={article.featured_image}
              backgroundColor={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            />
          ))}
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
