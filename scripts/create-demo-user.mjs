/**
 * Script to create the demo user account
 * 
 * Run this script with: node scripts/create-demo-user.mjs
 * 
 * Make sure you have SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set in your .env file
 * The service role key can be found in Supabase Dashboard > Settings > API > service_role key
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing environment variables!')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  console.error('')
  console.error('You can find your service_role key in:')
  console.error('Supabase Dashboard > Settings > API > service_role (secret)')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const DEMO_EMAIL = 'demo@mauritius-game.com'
const DEMO_PASSWORD = 'demo123456'

async function createDemoUser() {
  console.log('Creating demo user...')
  
  // First check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === DEMO_EMAIL)
  
  if (existingUser) {
    console.log('Demo user already exists!')
    console.log('Email:', DEMO_EMAIL)
    return
  }

  // Create the demo user
  const { data, error } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true, // Auto-confirm the email
    user_metadata: {
      full_name: 'Demo Student',
    }
  })

  if (error) {
    console.error('Error creating demo user:', error.message)
    process.exit(1)
  }

  console.log('✅ Demo user created successfully!')
  console.log('Email:', DEMO_EMAIL)
  console.log('Password:', DEMO_PASSWORD)
  
  // Also create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      full_name: 'Demo Student',
      email: DEMO_EMAIL,
    })
  
  if (profileError) {
    console.warn('Note: Could not create profile:', profileError.message)
  } else {
    console.log('✅ Profile created!')
  }
}

createDemoUser()
