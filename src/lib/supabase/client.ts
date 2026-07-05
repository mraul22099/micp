import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mwpmpzdaqeizfinjtadv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Uhjx_7OcfGmGF1HaJtouPw_8UPRI8zk'
  )
}
