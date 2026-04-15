import { NewsListItem } from '../../components/NewsListItem';
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

export default async function EventsArchive() {
  const supabase = await createServerClient();
  const { data: archivedArticles } = await supabase
    .from('Articles')
    .select('id, title, shortDescription, short_description, datePublished, date_published, link, titleImage, title_image')
    .eq('status', 'archive')
    .not('link', 'is', null)
    .order('datePublished', { ascending: false });
  const articles = archivedArticles ?? [];

  return (
    <div className="container mx-auto p-4 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Events Archive</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse archived articles and events from the Sejong Scholarship Foundation in America.
        </p>
      </div>

      <div className="grid gap-4 w-full md:w-3/4">
        {articles.length > 0 ? (
          articles.map((article: PublicArticleRow, index: number) => (
            <NewsListItem
              key={String(article.id)}
              title={String(article.title ?? 'Untitled article')}
              description={String(article.shortDescription ?? article.short_description ?? 'Read the full article...')}
              date={new Date(
                String(article.datePublished ?? article.date_published ?? new Date().toISOString()),
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              link={`/articles/${encodeURIComponent(String(article.link ?? ''))}`}
              image={String(article.titleImage ?? article.title_image ?? '/placeholder-image.svg')}
              backgroundColor={index % 2 === 0 ? 'bg-white' : 'bg-gray-100'}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No archived articles yet.</p>
            <p className="text-gray-400 mt-2">Archived content will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
