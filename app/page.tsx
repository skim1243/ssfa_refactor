import { Slideshow } from './components/Slideshow';
import { NewsListItem } from '../app/components/NewsListItem';
import { createServerClient } from '@/app/utils/supabase/server';

type PublicArticleRow = {
  id: string | number;
  title?: string | null;
  shortDescription?: string | null;
  short_description?: string | null;
  datePublished?: string | null;
  date_published?: string | null;
  link?: string | null;
  titleImage?: string | null;
  title_image?: string | null;
};

export default async function Home() {
  const supabase = await createServerClient();
  const { data: recentArticles } = await supabase
    .from('Articles')
    .select('*')
    .eq('status', 'published')
    .not('link', 'is', null)
    .order('datePublished', { ascending: false })
    .limit(6);

  return (
      <main className="flex min-h-screen flex-col items-center justify-between">
      <div className="h-[700px] w-full flex items-center justify-center bg-blue-200"><Slideshow /></div>
      <div className="h-[700px] w-full flex items-center justify-center bg-white text-black">Who are we</div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gray-100 text-black">Our Impact</div>
      <div className="min-h-[700px] w-full flex flex-col items-center justify-center bg-white py-10">
        <h2 className="text-3xl font-bold mb-6 text-black">Recent News</h2>
        <div className="grid gap-4 w-full md:w-3/4">
          {(recentArticles ?? []).map((article: PublicArticleRow, index: number) => (
            <NewsListItem
              key={String(article.id)}
              title={String(article.title ?? 'Untitled article')}
              description={String(article.shortDescription ?? article.short_description ?? 'Read the full article...')}
              date={new Date(String(article.datePublished ?? article.date_published ?? new Date().toISOString())).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
              link={`/articles/${encodeURIComponent(String(article.link ?? ''))}`}
              image={String(article.titleImage ?? article.title_image ?? '/placeholder-image.svg')}
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
