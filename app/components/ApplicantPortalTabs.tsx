'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ApplicantInformationForm } from '@/app/components/ApplicantInformationForm'
import { ApplicantDocumentsUpload } from '@/app/components/ApplicantDocumentsUpload'
import { submitApplication } from '@/app/actions/submit-application'

type TabId = 'info' | 'documents'

type Props = {
  application: Record<string, unknown> | null
}

export function ApplicantPortalTabs({ application }: Props) {
  const router = useRouter()
  const [submitting, startTransition] = useTransition()
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [active, setActive] = useState<TabId>('info')
  const completionStatus =
    (application?.completionStatus as string | undefined) ??
    (application?.completion_status as string | undefined) ??
    null
  const isSubmitted = completionStatus === 'Submitted'

  function handleSubmitApplication() {
    if (isSubmitted || submitting) return

    const confirmed = window.confirm(
      "Submit application? After submitting, you won't be able to change your application."
    )
    if (!confirmed) return

    setSubmitMessage(null)
    startTransition(async () => {
      const result = await submitApplication()
      if ('error' in result && result.error) {
        setSubmitMessage(result.error)
        return
      }
      setSubmitMessage('Application submitted successfully.')
      router.refresh()
    })
  }

  return (
    <div
      className="flex min-h-[320px] flex-col border-4 border-solid bg-white shadow-sm"
      style={{ borderColor: 'var(--color-green)' }}
    >
      <div
        className="flex border-b-4"
        style={{ borderColor: 'var(--color-green-light)' }}
        role="tablist"
        aria-label="Application sections"
      >
        <button
          type="button"
          role="tab"
          id="tab-applicant-info"
          aria-selected={active === 'info'}
          aria-controls="panel-applicant-info"
          className="min-h-[3rem] flex-1 px-4 py-3 text-sm font-semibold transition-colors sm:text-base"
          style={
            active === 'info'
              ? {
                  backgroundColor: 'var(--color-green)',
                  color: '#fff',
                }
              : {
                  backgroundColor: 'transparent',
                  color: '#14532d',
                  borderBottom: '4px solid transparent',
                }
          }
          onClick={() => setActive('info')}
        >
          Applicant Info
        </button>
        <button
          type="button"
          role="tab"
          id="tab-documents"
          aria-selected={active === 'documents'}
          aria-controls="panel-documents"
          className="min-h-[3rem] flex-1 border-l-4 px-4 py-3 text-sm font-semibold transition-colors sm:text-base"
          style={{
            borderLeftColor: 'var(--color-green-light)',
            ...(active === 'documents'
              ? {
                  backgroundColor: 'var(--color-green)',
                  color: '#fff',
                }
              : {
                  backgroundColor: 'transparent',
                  color: '#14532d',
                }),
          }}
          onClick={() => setActive('documents')}
        >
          Documents
        </button>
      </div>

      <div className="flex flex-1 flex-col bg-white p-6 md:p-8">
        {active === 'info' && (
          <div
            id="panel-applicant-info"
            role="tabpanel"
            aria-labelledby="tab-applicant-info"
            className="flex min-h-[200px] w-full justify-start text-sm text-green-950/80"
          >
            <ApplicantInformationForm initialApplication={application} />
          </div>
        )}
        {active === 'documents' && (
          <div
            id="panel-documents"
            role="tabpanel"
            aria-labelledby="tab-documents"
            className="flex min-h-[200px] w-full flex-col text-sm text-green-950/80"
          >
            <ApplicantDocumentsUpload application={application} />
          </div>
        )}

        {!isSubmitted && (
          <div className="mt-6 flex flex-col items-start gap-3 border-t border-green-100 pt-4">
            <button
              type="button"
              onClick={handleSubmitApplication}
              disabled={submitting}
              className="rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:opacity-95 disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-green)' }}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
            {submitMessage && (
              <p className="text-sm text-green-900" role="status">
                {submitMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
