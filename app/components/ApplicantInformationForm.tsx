'use client'

import { useEffect, useState, useTransition, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { saveApplicantInfo } from '@/app/actions/save-applicant-info'

/** Matches `grade` enum on Applications (adjust labels if your DB uses different labels). */
const GRADE_OPTIONS = [
  { value: '', label: 'Select grade' },
  { value: '9th', label: '9th' },
  { value: '10th', label: '10th' },
  { value: '11th', label: '11th' },
  { value: '12th', label: '12th' },
  { value: 'collegeFreshman', label: 'College — Freshman' },
  { value: 'collegeSophomore', label: 'College — Sophomore' },
  { value: 'collegeJunior', label: 'College — Junior' },
  { value: 'collegeSenior', label: 'College — Senior' },
] as const

// Safely reads text values from either camelCase or snake_case keys.
function pickString(
  row: Record<string, unknown> | null | undefined,
  camel: string,
  snake: string
): string {
  if (!row) return ''
  const v = row[camel] ?? row[snake]
  if (v == null || v === '') return ''
  return String(v)
}

type Props = {
  /** Row from `Applications` for this user, or null if missing */
  initialApplication: Record<string, unknown> | null
}

export function ApplicantInformationForm({ initialApplication }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  // Keep each input controlled so edits are always reflected in React state.
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [parentsEmail, setParentsEmail] = useState('')
  const [school, setSchool] = useState('')
  const [grade, setGrade] = useState('')
  const [major, setMajor] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    // Hydrate form state from existing application data.
    // `pickString` supports both camelCase and snake_case keys.
    setFirstName(pickString(initialApplication, 'firstName', 'first_name'))
    setLastName(pickString(initialApplication, 'lastName', 'last_name'))
    setPhoneNumber(pickString(initialApplication, 'phoneNumber', 'phone_number'))
    setEmail(pickString(initialApplication, 'email', 'email'))
    setParentsEmail(pickString(initialApplication, 'parentsEmail', 'parents_email'))
    setSchool(pickString(initialApplication, 'school', 'school'))
    setGrade(pickString(initialApplication, 'grade', 'grade'))
    setMajor(pickString(initialApplication, 'major', 'major'))
  }, [initialApplication])

  // Submits current form values to the server action and reports status.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage(null)
    const form = e.currentTarget
    const fd = new FormData(form)

    startTransition(async () => {
      // Server action performs sanitization/validation and returns typed result states.
      const result = await saveApplicantInfo(fd)
      if ('error' in result && result.error) {
        setMessage(result.error)
        return
      }
      if ('skipped' in result && result.skipped) {
        setMessage('Nothing to save — enter at least one field with text.')
        return
      }
      setMessage('Saved.')
      // Refresh server-rendered data so the page reflects persisted values.
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mr-auto flex w-full max-w-xl flex-col gap-4 text-green-950"
    >
      <div className="grid gap-1">
        <label htmlFor="firstName" className="text-sm font-medium text-green-900">
          First name
        </label>
        <input
          id="firstName"
          name="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
          placeholder=""
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="lastName" className="text-sm font-medium text-green-900">
          Last name
        </label>
        <input
          id="lastName"
          name="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="phoneNumber" className="text-sm font-medium text-green-900">
          Phone number
        </label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          autoComplete="tel"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="email" className="text-sm font-medium text-green-900">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="parentsEmail" className="text-sm font-medium text-green-900">
          Parent&apos;s email <span className="font-normal text-green-800/80">(if applicable)</span>
        </label>
        <input
          id="parentsEmail"
          name="parentsEmail"
          type="email"
          value={parentsEmail}
          onChange={(e) => setParentsEmail(e.target.value)}
          autoComplete="off"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="school" className="text-sm font-medium text-green-900">
          School
        </label>
        <input
          id="school"
          name="school"
          value={school}
          onChange={(e) => setSchool(e.target.value)}
          autoComplete="organization"
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="grade" className="text-sm font-medium text-green-900">
          Grade
        </label>
        <select
          id="grade"
          name="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        >
          {GRADE_OPTIONS.map((opt) => (
            <option key={opt.label + opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <label htmlFor="major" className="text-sm font-medium text-green-900">
          Major <span className="font-normal text-green-800/80">(if applicable)</span>
        </label>
        <input
          id="major"
          name="major"
          value={major}
          onChange={(e) => setMajor(e.target.value)}
          className="rounded-md border border-green-200 bg-white px-3 py-2 text-sm outline-none ring-green-500/30 focus:ring-2"
        />
      </div>

      {/* Inline status feedback for save/error states from the last submit. */}
      {message && (
        <p className="text-sm" role="status">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition enabled:hover:opacity-95 disabled:opacity-60"
        style={{ backgroundColor: 'var(--color-green)' }}
      >
        {pending ? 'Saving…' : 'Save'}
      </button>
    </form>
  )
}
