import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verify() {
  console.log('[v0] Checking for Mauritian flag matching question...');

  const { data: question, error: qError } = await supabase
    .from('questions')
    .select('id, question')
    .like('question', '%Match each colour of the Mauritian flag%')
    .single();

  if (qError || !question) {
    console.log('[v0] Question not found:', qError);
    return;
  }

  console.log(`[v0] Found question ID: ${question.id}`);
  console.log(`[v0] Question: ${question.question}`);

  const { data: pairs, error: pError } = await supabase
    .from('matching_pairs')
    .select('*')
    .eq('question_id', question.id);

  if (pError) {
    console.log('[v0] Error fetching pairs:', pError);
    return;
  }

  console.log(`[v0] Found ${pairs.length} matching pairs:`);
  pairs.forEach(p => {
    console.log(`[v0]   - ${p.left_item} → ${p.right_item}`);
  });
}

verify().catch(console.error);
