import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://mwpmpzdaqeizfinjtadv.supabase.co',
    'sb_publishable_Uhjx_7OcfGmGF1HaJtouPw_8UPRI8zk'
  )
}
