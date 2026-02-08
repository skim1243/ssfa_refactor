'use server'

import { redirect } from 'next/navigation'
import { createServerClient } from '@/app/utils/supabase/server'

export async function registerApplicant(
  _prev: unknown,
  formData: FormData
) {
  const email = formData.get('email') as string | null
  const password = formData.get('password') as string | null

  if (!email?.trim() || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createServerClient()

  const { data: { user }, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  })

  if (error) throw error
  if (!user) {
    return { error: 'Account could not be created.' }
  }

  const { error: roleError } = await supabase
    .from('user_roles')
    .insert({
      user: user.id,
      role: 'applicant',
    })

    if (roleError) {
      console.error('ROLE INSERT ERROR:', roleError)
      return { error: roleError.message }
    }
  
  redirect('/applicant-login')
}
