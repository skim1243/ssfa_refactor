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
      <div className="w-full"><Slideshow /></div>
      <div className="h-[700px] w-full flex items-center justify-center bg-gradient-to-b from-white via-blue-50/40 to-white text-black px-6">
        <div className="max-w-3xl text-center rounded-2xl border border-blue-100 bg-white/80 backdrop-blur-sm shadow-sm px-8 py-10">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">
            Who are we
          </h2>
          <div className="w-16 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-blue-400 to-orange-300" />
          <p className="text-lg leading-relaxed text-gray-700">
            The Sejong Scholarship Foundation in America (SSFA) is a 501(c)(3) nonprofit founded in 1997 to support students with strong academic goals who face financial barriers. Built by first-generation Korean American leaders and carried forward by newer generations, we raise funds through community support to help students pursue their education and future with confidence.
          </p>
        </div>
      </div>
      <div className="min-h-[700px] w-full flex items-center justify-center bg-gradient-to-b from-gray-50 via-white to-gray-50 text-black px-6 py-16">
        <section className="w-full max-w-6xl impact-intro">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Impact</h2>
            <div className="w-20 h-1 mx-auto mt-4 mb-5 rounded-full bg-gradient-to-r from-[var(--color-blue)] via-[var(--color-yellow)] to-[var(--color-green)]" />
            <p className="max-w-2xl mx-auto text-gray-700 text-base md:text-lg">
              Since 1997, SSFA has helped students pursue their academic goals with meaningful scholarship support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="impact-card impact-delay-1 rounded-2xl border border-blue-100 bg-gradient-to-b from-white to-[var(--color-blue-light)]/30 p-7 text-center shadow-sm">
              <p className="text-sm uppercase tracking-[0.15em] text-gray-600 mb-3">Years of Service</p>
              <p className="text-4xl font-bold text-[var(--color-blue)] mb-2">25+</p>
              <p className="text-gray-700">Years of supporting students since 1997.</p>
            </article>

            <article className="impact-card impact-delay-2 rounded-2xl border border-yellow-100 bg-gradient-to-b from-white to-[var(--color-yellow-light)]/35 p-7 text-center shadow-sm">
              <p className="text-sm uppercase tracking-[0.15em] text-gray-600 mb-3">Students Supported</p>
              <p className="text-4xl font-bold text-[var(--color-yellow)] mb-2">641</p>
              <p className="text-gray-700">Scholar recipients across our community.</p>
            </article>

            <article className="impact-card impact-delay-3 rounded-2xl border border-green-100 bg-gradient-to-b from-white to-[var(--color-green-light)]/35 p-7 text-center shadow-sm">
              <p className="text-sm uppercase tracking-[0.15em] text-gray-600 mb-3">Scholarship Funding</p>
              <p className="text-4xl font-bold text-[var(--color-green)] mb-2">$618,500+</p>
              <p className="text-gray-700">Awarded to help students pursue their future.</p>
            </article>
          </div>
        </section>
      </div>
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
      <div className="min-h-[700px] w-full flex items-center justify-center bg-gradient-to-b from-gray-100 via-white to-gray-100 text-black px-6 py-16">
        <section className="w-full max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Get Involved</h2>
            <div className="w-20 h-1 mx-auto mt-4 mb-5 rounded-full bg-gradient-to-r from-[var(--color-blue)] via-[var(--color-yellow)] to-[var(--color-green)]" />
            <p className="max-w-2xl mx-auto text-gray-700 text-base md:text-lg">
              There are many ways to support SSFA and help students thrive. Join us in the way that fits you best.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <article className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Contact Us</h3>
              <p className="text-gray-700 mb-5">Reach out with questions, ideas, or partnership opportunities.</p>
              <a href="/contact" className="inline-flex items-center font-semibold text-[var(--color-blue)] hover:underline">
                Start a conversation
              </a>
            </article>

            <article className="rounded-2xl border border-yellow-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Donate</h3>
              <p className="text-gray-700 mb-5">Your contribution directly supports scholarship funding for students.</p>
              <a href="/donate" className="inline-flex items-center font-semibold text-[var(--color-yellow)] hover:underline">
                Make a donation
              </a>
            </article>

            <article className="rounded-2xl border border-green-100 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Apply</h3>
              <p className="text-gray-700 mb-5">Students can apply for scholarship opportunities through our application portal.</p>
              <a href="/apply" className="inline-flex items-center font-semibold text-[var(--color-green)] hover:underline">
                Begin application
              </a>
            </article>

            <article className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Attend Events</h3>
              <p className="text-gray-700 mb-5">Participate in fundraisers and community events to stay connected.</p>
              <a href="/events" className="inline-flex items-center font-semibold text-gray-700 hover:underline">
                Explore events
              </a>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
