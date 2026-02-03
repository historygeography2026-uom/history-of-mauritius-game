const { createClient } = require('@supabase/supabase-js');

// Hardcoded for this script only (same as .env.local values)
const SUPABASE_URL = 'https://zjziegyiscwdpnimjtgm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqemllZ3lpc2N3ZHBuaW1qdGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYxMjczMCwiZXhwIjoyMDc5MTg4NzMwfQ.ceVs0Ee_JuIvFghLUDSinPPquWSdAwrzZJN6II_9KbY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Creating demo user...');
  
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'demo@mauritius-game.com',
    password: 'demo123456',
    email_confirm: true,
    user_metadata: { full_name: 'Demo Student' }
  });

  if (error) {
    console.log('Result:', error.message);
  } else {
    console.log('Demo user created successfully!');
    console.log('Email: demo@mauritius-game.com');
    console.log('Password: demo123456');
  }
}

main();
