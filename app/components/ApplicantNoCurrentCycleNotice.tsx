import Link from 'next/link'

/** Set `NEXT_PUBLIC_SUPPORT_EMAIL` in `.env.local`, or replace the fallback below. */
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@example.com'

type Props = {
  /** When true, render only the inner card (for use inside the application portal directory page). */
  embedded?: boolean
  /** When false, omit the “back to applicant login” line (e.g. user is already signed in on archive). */
  showApplicantLoginLink?: boolean
}

export function ApplicantNoCurrentCycleNotice({
  embedded = false,
  showApplicantLoginLink = true,
}: Props) {
  const titleClass = 'text-2xl font-bold text-[var(--color-green)] md:text-3xl'

  const card = (
    <div className="rounded-lg border border-green-100 bg-white p-8 shadow-lg md:p-10">
      {embedded ? (
        <h2 className={titleClass}>No current application cycle</h2>
      ) : (
        <h1 className={titleClass}>No current application cycle</h1>
      )}
      <p className="mt-4 text-lg leading-relaxed text-gray-700">
        There is no application cycle in progress right now, so the applicant portal has nothing to show
        for a live application. Please check back when a new cycle opens.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        If you have questions about when applications will open or about SSFA in general, you can reach us
        using the options below.
      </p>

      <div className="mt-8 border-t border-green-100 pt-8">
        {showApplicantLoginLink ? (
          <p className="mb-4 text-sm text-gray-600">
            <a
              href="/applicant-login"
              className="font-medium text-[var(--color-blue)] underline underline-offset-2 hover:opacity-90"
            >
              Back to applicant login
            </a>
          </p>
        ) : null}
        {embedded ? (
          <h3 className="text-lg font-semibold text-[var(--color-green)]">Contact us</h3>
        ) : (
          <h2 className="text-lg font-semibold text-[var(--color-green)]">Contact us</h2>
        )}
        <ul className="mt-4 space-y-4 text-gray-700">
          <li>
            <span className="block text-sm font-medium text-gray-500">Email</span>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=SSFA%20—%20Application%20question`}
              className="text-[var(--color-blue)] underline underline-offset-2 hover:opacity-90"
            >
              {SUPPORT_EMAIL}
            </a>
          </li>
          <li>
            <span className="block text-sm font-medium text-gray-500">Phone</span>
            <a href="tel:+15551234567" className="text-gray-800 hover:underline">
              (555) 123-4567
            </a>
          </li>
          <li>
            <span className="block text-sm font-medium text-gray-500">More ways to reach us</span>
            <Link
              href="/contact"
              className="inline-flex text-[var(--color-blue)] underline underline-offset-2 hover:opacity-90"
            >
              Visit the full contact page
            </Link>
            <span className="text-gray-600"> — office address, hours, and a message form.</span>
          </li>
        </ul>
      </div>
    </div>
  )

  if (embedded) {
    return (
      <section className="rounded-lg border border-green-200/80 bg-gradient-to-b from-green-50/90 to-white p-1 shadow-sm">
        {card}
      </section>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="container mx-auto max-w-2xl px-4">{card}</div>
    </main>
  )
}
