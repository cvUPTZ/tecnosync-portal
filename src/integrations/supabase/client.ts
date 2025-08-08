import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lztxjcfvzovibcsoeakm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6dHhqY2Z2em92aWJjc29lYWttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjk1MTAsImV4cCI6MjA2OTY0NTUxMH0.az32QLm2PR90iMhVb51ffPOIhb9AZdVZkgTuZJPZOHc'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})
