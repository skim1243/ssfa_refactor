import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'
import { ApplicantPortalTabs } from '@/app/components/ApplicantPortalTabs'
import { SubmittedStaticForm } from '@/app/components/SubmittedStaticForm'
import { ApplicantPortalMenu } from '@/app/components/ApplicantPortalMenu'

function completionStatusLabel(completionStatus: string | null | undefined): string {
  if (completionStatus === 'Pending') return 'incomplete'
  if (completionStatus == null || completionStatus === '') return 'N/A'
  return completionStatus
}

function formatSubmissionDate(submissionDate: string | null | undefined): string {
  if (submissionDate == null || submissionDate === '') return 'N/A'
  const d = new Date(submissionDate)
  if (Number.isNaN(d.getTime())) return String(submissionDate)
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

/** Set `NEXT_PUBLIC_SUPPORT_EMAIL` in `.env.local`, or replace the fallback below. */
const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@example.com'

export default async function ApplicantPortal() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/applicant-login')

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('"user"', user.id)
    .maybeSingle()

  if (!roleRow?.role || roleRow.role !== 'applicant') {
    redirect('/auth-error')
  }

  const { data: application } = await supabase
    .from('Applications')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const row = application as Record<string, unknown> | null
  const applicationCycle =
    (row?.applicationCycle as string | undefined) ??
    (row?.application_cycle as string | undefined) ??
    'N/A'
  const applicantEmail =
    (row?.email as string | undefined) ?? user.email ?? 'N/A'
  const completionStatus =
    (row?.completionStatus as string | undefined) ??
    (row?.completion_status as string | undefined) ??
    null
  const acceptanceStatus =
    (row?.acceptanceStatus as string | undefined) ??
    (row?.acceptenceStatus as string | undefined) ??
    (row?.acceptance_status as string | undefined) ??
    'N/A'
  const submissionDate =
    (row?.submissionDate as string | undefined) ??
    (row?.submission_date as string | undefined) ??
    null

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section
          className="relative min-h-[260px] p-10 text-white shadow-md md:min-h-[320px] md:p-14"
          style={{ backgroundColor: 'var(--color-blue)' }}
        >
          <div className="absolute right-4 top-4">
            <ApplicantPortalMenu />
          </div>
          <h1 className="text-5xl font-bold md:text-6xl">
            Welcome{user.email ? `, ${user.email}` : ''}!
          </h1>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div
            className="min-h-[220px] border-4 border-solid bg-white p-4 shadow-sm"
            style={{ borderColor: 'var(--color-yellow)' }}
          >
            <div className="text-sm leading-relaxed text-black">
              <p className="mb-4 font-semibold text-black">
                {applicationCycle} SSFA Application Status
              </p>
              <div className="space-y-2 text-sm text-black">
                <p>
                  <span className="inline-block min-w-[14rem] text-black">
                    Applicant Email:
                  </span>
                  <span>{applicantEmail}</span>
                </p>
                <p>
                  <span className="inline-block min-w-[14rem] text-black">
                    Application Completion Status:
                  </span>
                  <span>{completionStatusLabel(completionStatus)}</span>
                </p>
                <p>
                  <span className="inline-block min-w-[14rem] text-black">
                    Application Status:
                  </span>
                  <span>{acceptanceStatus}</span>
                </p>
                <p>
                  <span className="inline-block min-w-[14rem] text-black">
                    Application Completion Date:
                  </span>
                  <span>{formatSubmissionDate(submissionDate)}</span>
                </p>
                <p>
                  <span className="inline-block min-w-[14rem] text-black">
                    Application Type:
                  </span>
                  <span>Graduate</span>
                </p>
              </div>
            </div>
          </div>

          <div
            className="flex min-h-[220px] flex-col justify-center border-4 border-solid bg-white p-6 shadow-sm"
            style={{ borderColor: 'var(--color-yellow)' }}
          >
            <div className="flex w-full flex-col items-start text-left">
              <h2 className="mb-2 text-lg font-semibold text-black">
                Questions or concerns?
              </h2>
              <p className="mb-4 max-w-md text-sm leading-relaxed text-black">
                If you have any questions, concerns, or issues with your application or this
                portal, we’re happy to help. Reach out anytime and our team will get back to you
                as soon as we can.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=SSFA%20Applicant%20Portal%20—%20Question`}
                className="inline-flex items-center justify-center rounded-md border border-amber-700/30 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:brightness-[0.97]"
                style={{ backgroundColor: 'var(--color-yellow)' }}
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </section>

        <section>
          {completionStatus === 'Submitted' ? (
            <div
              className="flex min-h-[320px] flex-col border-4 border-solid bg-white p-6 shadow-sm md:p-8"
              style={{ borderColor: 'var(--color-green)' }}
            >
              <SubmittedStaticForm application={row} />
            </div>
          ) : (
            <ApplicantPortalTabs application={row} />
          )}
        </section>
      </div>
    </main>
  )
}
