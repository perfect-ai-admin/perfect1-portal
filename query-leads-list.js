import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getLeadData() {
  const { data, error } = await supabase
    .from('leads')
    .select('id, name, phone, email, page_intent, flow_type, service_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error:', error);
    process.exit(1);
  }

  console.log('Recent leads:');
  console.log(JSON.stringify(data, null, 2));
}

getLeadData();
