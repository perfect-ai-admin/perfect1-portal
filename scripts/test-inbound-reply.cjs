/**
 * test-inbound-reply.cjs
 *
 * מדמה תגובה נכנסת ל-outreachInboundReply.
 * מצריך שיהיה outreach_message קיים ב-DB עם ה-ID שמעבירים.
 *
 * שימוש:
 *   node scripts/test-inbound-reply.cjs <message_uuid>
 *
 * אם לא מעבירים UUID, שולח עם UUID דמה (יחזיר skipped).
 */

const SUPABASE_URL = 'https://rtlpqjqdmomyptcdkmrq.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0bHBxanFkbW9teXB0Y2RrbXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4Njc0NjMsImV4cCI6MjA5MDQ0MzQ2M30.NceenXJ43_B3NN9MVz4b5wR4t1Si0hRfYedfmtoujXQ';

const messageId = process.argv[2] || '00000000-0000-0000-0000-000000000000';

const payload = {
  to: [`reply+${messageId}@perfect1.co.il`],
  from: 'test-contact@example-site.co.il',
  subject: 'Re: שיתוף פעולה בין האתרים שלנו',
  text: `שלום יוסי,

תודה על הפנייה. קראתי את ההצעה שלך ואני מעוניין לשמוע עוד פרטים.
יש לנו אתר עם 50K ביקורים חודשיים בנישת פיננסים.

נשמח לדבר.

בברכה,
דני`,
};

async function test() {
  console.log(`Sending test payload to outreachInboundReply...`);
  console.log(`Message ID: ${messageId}`);
  console.log(`Reply-to address: reply+${messageId}@perfect1.co.il\n`);

  const res = await fetch(`${SUPABASE_URL}/functions/v1/outreachInboundReply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log(`Status: ${res.status}`);
  console.log(`Response:`, JSON.stringify(data, null, 2));

  if (data.ok && !data.skipped) {
    console.log(`\nSUCCESS: Reply processed. Check yosi5919@gmail.com for notification email.`);
    console.log(`Intent: ${data.intent}, Sentiment: ${data.sentiment}`);
  } else if (data.skipped === 'original message not found') {
    console.log(`\nNOTE: Message ID not in DB — this is expected for a test with a fake UUID.`);
    console.log(`To test end-to-end: pass a real outreach_message UUID from the DB.`);
  } else {
    console.log(`\nResult:`, data);
  }
}

test().catch(console.error);
