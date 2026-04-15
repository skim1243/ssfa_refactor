import { NewsListItem } from '../components/NewsListItem';
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

export default async function Events() {
  const supabase = await createServerClient();
  const { data: recentArticles } = await supabase
    .from('Articles')
    .select('*')
    .eq('status', 'published')
    .not('link', 'is', null)
    .order('datePublished', { ascending: false });
  const articles = recentArticles ?? [];

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Recent Articles & Events</h1>
      <p className="text-gray-600 mb-8 text-center max-w-2xl">
        Stay updated with the latest news, announcements, and events from the Sejong Scholarship Foundation in America.
      </p>

      <div className="grid gap-4 w-full md:w-3/4">
        {articles.length > 0 ? (
          articles.map((article: PublicArticleRow, index: number) => (
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
              image={String(article.titleImage ?? article.title_image ?? "/placeholder-image.svg")}
              backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
            />
          ))
        ) : (
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
