'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteApplicantAccountAndApplication } from '@/app/actions/delete-applicant-account'
import { updateUserRole, type AdminAssignableRole } from '@/app/actions/update-user-role'

export type AdminUserRow = {
  id: string
  email: string
  role: string | null
}

type Props = {
  users: AdminUserRow[]
}

const ROLE_OPTIONS: { value: AdminAssignableRole; label: string }[] = [
  { value: 'admin', label: 'admin' },
  { value: 'applicant', label: 'applicant' },
]

const inputClass =
  'w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
const labelClass = 'mb-1 block text-xs font-medium text-gray-600'

function normText(v: string): string {
  return v.trim().toLowerCase()
}

function isAssignableRole(r: string | null): r is AdminAssignableRole {
  return r === 'admin' || r === 'applicant'
}

export function AdminUsersTable({ users }: Props) {
  const router = useRouter()
  const [isRolePending, startRoleTransition] = useTransition()
  const [isDeletePending, startDeleteTransition] = useTransition()
  const [roleUpdatingId, setRoleUpdatingId] = useState<string | null>(null)
  const [deleteRowId, setDeleteRowId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const [uuidQuery, setUuidQuery] = useState('')
  const [emailQuery, setEmailQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'' | AdminAssignableRole>('')

  const filteredUsers = useMemo(() => {
    const uq = normText(uuidQuery)
    const eq = normText(emailQuery)
    return users.filter((row) => {
      if (uq && !normText(row.id).includes(uq)) return false
      if (eq && !normText(row.email).includes(eq)) return false
      if (roleFilter === 'admin' || roleFilter === 'applicant') {
        if (normText(row.role ?? '') !== roleFilter) return false
      }
      return true
    })
  }, [users, uuidQuery, emailQuery, roleFilter])

  if (users.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600 shadow-sm">
        No users returned. Ensure <code className="rounded bg-gray-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> is set
        so the directory can load from Auth.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Search</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="admin-users-uuid" className={labelClass}>
              UUID
            </label>
            <input
              id="admin-users-uuid"
              type="text"
              value={uuidQuery}
              onChange={(e) => setUuidQuery(e.target.value)}
              placeholder="Contains…"
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="admin-users-email" className={labelClass}>
              Email
            </label>
            <input
              id="admin-users-email"
              type="text"
              value={emailQuery}
              onChange={(e) => setEmailQuery(e.target.value)}
              placeholder="Contains…"
              className={inputClass}
              autoComplete="off"
            />
          </div>
          <div>
            <label htmlFor="admin-users-role-filter" className={labelClass}>
              Role
            </label>
            <select
              id="admin-users-role-filter"
              value={roleFilter}
              onChange={(e) => {
                const v = e.target.value
                setRoleFilter(v === 'admin' || v === 'applicant' ? v : '')
              }}
              className={inputClass}
              aria-label="Filter by role"
            >
              <option value="">All roles</option>
              <option value="admin">admin</option>
              <option value="applicant">applicant</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Showing {filteredUsers.length} of {users.length} user{users.length === 1 ? '' : 's'}.
        </p>
        {actionMessage ? (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {actionMessage}
          </p>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        {filteredUsers.length === 0 ? (
          <div className="p-6 text-sm text-gray-600">No users match the current search.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  UUID
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Email
                </th>
                <th scope="col" className="whitespace-nowrap px-4 py-3 text-left font-semibold text-gray-700">
                  Role
                </th>
                <th scope="col" className="w-12 px-2 py-3 text-right font-semibold text-gray-700">
                  <span className="sr-only">Row actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((row) => {
                const currentRole = row.role ?? ''
                const selectValue = isAssignableRole(row.role) ? row.role : ''
                const roleBusy = isRolePending && roleUpdatingId === row.id
                const deleteBusy = isDeletePending && deleteRowId === row.id

                return (
                  <tr key={row.id} className="align-top">
                    <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-800">{row.id}</td>
                    <td className="max-w-xs break-words px-4 py-3 text-gray-700">{row.email || '—'}</td>
                    <td className="max-w-xs px-4 py-3 text-gray-700">
                      <div className="flex flex-col gap-1">
                        <select
                          className="max-w-[12rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                          value={selectValue}
                          onChange={(e) => {
                            const next = e.target.value as AdminAssignableRole | ''
                            if (next !== 'admin' && next !== 'applicant') return
                            setActionMessage(null)
                            setRoleUpdatingId(row.id)
                            startRoleTransition(async () => {
                              const result = await updateUserRole({ targetUserId: row.id, role: next })
                              setRoleUpdatingId(null)
                              if ('error' in result && result.error) {
                                setActionMessage(result.error)
                                return
                              }
                              router.refresh()
                            })
                          }}
                          disabled={roleBusy || deleteBusy}
                          aria-label="User role"
                        >
                          <option value="" disabled>
                            {row.role ? 'Unknown role — pick new' : 'Choose role'}
                          </option>
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                        {!isAssignableRole(row.role) && currentRole ? (
                          <span className="text-xs text-amber-700" title="Stored role is not in the assignable set">
                            DB: {currentRole}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="relative px-2 py-3 text-right align-top">
                      <details className="inline-block text-left">
                        <summary
                          className="cursor-pointer list-none rounded-md px-2 py-1 text-xl leading-none text-gray-600 hover:bg-gray-100 [&::-webkit-details-marker]:hidden"
                          aria-label="Row actions"
                        >
                          &#8942;
                        </summary>
                        <div className="absolute right-2 z-20 mt-1 min-w-[12rem] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
                          <button
                            type="button"
                            disabled={deleteBusy || roleBusy}
                            className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                            onClick={() => {
                              if (
                                !window.confirm(
                                  'Permanently delete this user? All application rows for this account, applicant uploads, the user role, and the Auth account will be removed. This cannot be undone.',
                                )
                              ) {
                                return
                              }
                              setActionMessage(null)
                              setDeleteRowId(row.id)
                              startDeleteTransition(async () => {
                                try {
                                  const result = await deleteApplicantAccountAndApplication({
                                    targetUserId: row.id,
                                  })
                                  if ('error' in result && result.error) {
                                    setActionMessage(result.error)
                                    return
                                  }
                                  router.refresh()
                                } finally {
                                  setDeleteRowId(null)
                                }
                              })
                            }}
                          >
                            {deleteBusy ? 'Deleting…' : 'Delete user'}
                          </button>
                        </div>
                      </details>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
