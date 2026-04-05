const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFlow() {
  try {
    console.log('=== בדיקת טבלת LEADS ===');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, phone, page_intent, flow_type, bot_current_step, created_at')
      .eq('id', '18779a70-e155-484e-bbc2-5a90d856015a');
    
    if (leadsError) {
      console.error('שגיאה בקריאת leads:', leadsError);
    } else {
      console.log('תוצאה:', JSON.stringify(leads, null, 2));
    }

    console.log('\n=== בדיקת טבלת BOT_SESSIONS ===');
    const { data: sessions, error: sessionsError } = await supabase
      .from('bot_sessions')
      .select('id, phone, current_step, created_at')
      .or('phone.eq.972506666777,phone.eq.0506666777');
    
    if (sessionsError) {
      console.error('שגיאה בקריאת bot_sessions:', sessionsError);
    } else {
      console.log(`מצאתי ${sessions?.length || 0} sessions`);
      if (sessions && sessions.length > 0) {
        console.log('תוצאה:', JSON.stringify(sessions, null, 2));
      }
    }

    console.log('\n=== בדיקת טבלת BOT_EVENTS ===');
    const sessionIds = sessions?.map(s => s.id) || [];
    if (sessionIds.length > 0) {
      const { data: events, error: eventsError } = await supabase
        .from('bot_events')
        .select('id, event_type, created_at')
        .in('session_id', sessionIds);
      
      if (eventsError) {
        console.error('שגיאה בקריאת bot_events:', eventsError);
      } else {
        console.log(`מצאתי ${events?.length || 0} events`);
        if (events && events.length > 0) {
          console.log('תוצאה:', JSON.stringify(events, null, 2));
        }
      }
    }

  } catch (err) {
    console.error('שגיאה:', err.message);
  }
}

checkFlow();
