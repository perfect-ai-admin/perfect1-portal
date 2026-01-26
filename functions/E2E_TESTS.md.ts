# 🧪 E2E TESTS - DLQ & AgentRun System

## Test Suite Overview

**Total Tests:** 10  
**Critical Path Tests:** 6  
**Failure Scenario Tests:** 4

---

## 🎯 CRITICAL PATH TESTS

### Test 1: Happy Path - New WhatsApp User
**Scenario:** משתמש חדש שולח הודעה ראשונה בווטסאפ

**Steps:**
1. Send WhatsApp message from unknown number: `972501234567`
   - Message: "היי, אני רוצה לפתוח עוסק פטור"
2. Verify webhook received in greenApiWebhook
3. Check CRMLead created with:
   - phone_normalized = "972501234567"
   - status = "new"
   - active_handler = "mentor"
   - waiting_for_response = true
4. Check AgentRun created:
   - agent_name = "LeadRouter" or "SmartMentor"
   - status = "started" → "completed"
   - duration_ms > 0
5. Check OutboundMessage created:
   - status = "sent"
   - provider_message_id exists
6. Check AgentEvents logged (minimum 3):
   - message_in
   - llm_call
   - message_out

**Expected Result:**
- ✅ CRMLead created
- ✅ Welcome message sent
- ✅ AgentRun logged with full timeline
- ✅ No DLQEvent created (success path)

---

### Test 2: FirstGoalFlow Complete Journey
**Scenario:** משתמש עובר דרך כל שלבי FirstGoalFlow

**Steps:**
1. Create UserGoal with is_first_goal=true
2. Trigger automation → FirstGoalMentorFlow starts
3. User responds to intro → agreement stage
4. User agrees → boundaries + diagnosis
5. User answers diagnosis → post_diagnosis
6. User completes task → flow completed

**Expected Result:**
- ✅ AgentRun for each stage
- ✅ flow_data.mentor_stage transitions: intro → agreement → boundaries → diagnosis → post_diagnosis → completed
- ✅ flow_data.diagnosis_answer saved
- ✅ flow_data.post_diagnosis_response saved
- ✅ UserMemory updated
- ✅ is_first_goal = false
- ✅ status = "active"
- ✅ All WhatsApp messages sent via OutboundMessage

---

### Test 3: Concurrent Messages (Race Condition)
**Scenario:** 2 הודעות מאותו משתמש מגיעות תוך 100ms

**Steps:**
1. Send message A from user X at T=0
2. Send message B from user X at T=100ms
3. Both hit greenApiWebhook simultaneously

**Expected Result:**
- ✅ Idempotency check prevents duplicate processing
- ✅ Lock acquired by first request
- ✅ Second request waits or skips
- ✅ Only 1 AgentRun created
- ✅ chat_history has both messages in order
- ✅ No race condition on chat_history update

---

### Test 4: Chat History Window (100 messages cap)
**Scenario:** שיחה ארוכה מגיעה ל-105 הודעות

**Steps:**
1. Create CRMLead with 105 messages in chat_history
2. Send new message (106th)
3. Check greenApiWebhook processing

**Expected Result:**
- ✅ chat_history contains only 100 messages (oldest 6 removed)
- ✅ chat_summary generated (if implemented)
- ✅ No data loss - older messages archived or summarized

---

### Test 5: Agent Performance Tracking
**Scenario:** בדיקת מעקב מלא אחר ביצועי סוכן

**Steps:**
1. Trigger SmartMentorEngine
2. Let it complete successfully
3. Query AgentRun for this run
4. Query AgentEvents for this run

**Expected Result:**
- ✅ AgentRun exists with:
  - agent_name = "SmartMentor"
  - status = "completed"
  - duration_ms calculated
  - input_summary + output_summary populated
- ✅ AgentEvents include:
  - message_in
  - llm_call (at least 1)
  - state_change
  - message_out
- ✅ ConversationLog has agent_name + handler_name

---

### Test 6: Message Queue & Delivery Tracking
**Scenario:** שליחת הודעה דרך מערכת התור

**Steps:**
1. Call messageQueueProcessor with action="enqueue"
   - Payload: phone, message, lead_id
2. Check MessageQueue entity created with status="queued"
3. Call messageQueueProcessor with action="process_next"
4. Check OutboundMessage updated to status="sent"
5. Check MessageQueue updated to status="sent"

**Expected Result:**
- ✅ Message queued
- ✅ Priority ordering works
- ✅ Green API called
- ✅ provider_message_id saved
- ✅ sent_at timestamp recorded

---

## ❌ FAILURE SCENARIO TESTS

### Test 7: LLM Timeout → DLQ
**Scenario:** InvokeLLM fails after 3 retries

**Setup:**
- Simulate LLM timeout (mock or inject delay >15s)

**Steps:**
1. Trigger smartMentorEngine
2. Let LLM wrapper retry 3 times
3. All retries fail

**Expected Result:**
- ✅ Circuit breaker increments failures
- ✅ After threshold: circuit opens
- ✅ DLQEvent created:
  - event_type = "invoke_llm"
  - severity = "high"
  - status = "new"
  - attempt_count = 0
  - next_retry_at = now + 1min
  - payload_json has prompt preview
- ✅ AgentRun status = "failed"
- ✅ Fallback message sent to user
- ✅ User NOT left hanging

**Validation:**
```javascript
// Check DLQ
const dlqEvents = await base44.entities.DLQEvent.filter({
  event_type: 'invoke_llm',
  status: 'new'
});
assert(dlqEvents.length > 0);

// Check fallback sent
const outbound = await base44.entities.OutboundMessage.filter({
  lead_id: testLeadId,
  status: 'sent'
}, '-created_date', 1);
assert(outbound[0].message_text.includes('אחזור אליך'));
```

---

### Test 8: WhatsApp Send Failure → DLQ → Retry Success
**Scenario:** Green API זמנית down, DLQWorker מצליח בניסיון 2

**Setup:**
- Simulate Green API 503 error

**Steps:**
1. Try to send WhatsApp via whatsappWrapper
2. Green API returns 503
3. DLQEvent created
4. Wait 1 minute
5. DLQWorker runs (scheduled or manual)
6. Retry succeeds

**Expected Result:**
- ✅ OutboundMessage status = "failed" initially
- ✅ DLQEvent created:
  - event_type = "outbound_whatsapp"
  - status = "new"
  - last_error_code = "GREEN_API_HTTP_503"
- ✅ DLQWorker processes event:
  - attempt_count increments to 1
  - Retry succeeds
  - DLQEvent.status = "resolved"
- ✅ OutboundMessage.status = "sent"
- ✅ DLQRetryLog created:
  - attempt_no = 1
  - result = "success"

**Validation:**
```javascript
const dlq = await base44.entities.DLQEvent.get(eventId);
assert(dlq.status === 'resolved');

const retryLogs = await base44.entities.DLQRetryLog.filter({
  dlq_event_id: eventId
});
assert(retryLogs.length === 1);
assert(retryLogs[0].result === 'success');
```

---

### Test 9: Permanent Failure After Max Attempts
**Scenario:** אירוע נכשל 5 פעמים, עובר ל-failed_permanent

**Setup:**
- Create DLQEvent manually with attempt_count=4
- Simulate persistent error

**Steps:**
1. DLQWorker attempts retry (5th attempt)
2. Still fails
3. Check DLQEvent updated

**Expected Result:**
- ✅ DLQEvent.status = "failed_permanent"
- ✅ DLQEvent.severity escalated to "critical"
- ✅ DLQEvent.attempt_count = 5
- ✅ No more retry scheduled (next_retry_at unchanged or null)
- ✅ Admin alert triggered (if implemented)

**Validation:**
```javascript
const dlq = await base44.entities.DLQEvent.get(eventId);
assert(dlq.status === 'failed_permanent');
assert(dlq.severity === 'critical');
assert(dlq.attempt_count === 5);
```

---

### Test 10: Double Message Idempotency
**Scenario:** אותה הודעה מגיעה פעמיים (Green API bug)

**Steps:**
1. Send WhatsApp message with Green API message_id = "ABC123"
2. Process normally
3. Send SAME message again with SAME message_id
4. greenApiWebhook receives duplicate

**Expected Result:**
- ✅ Idempotency guard detects duplicate
- ✅ Returns early with "already_processed"
- ✅ No second AgentRun created
- ✅ No second response sent
- ✅ IdempotencyKey exists with processed_at timestamp

**Validation:**
```javascript
const agentRuns = await base44.entities.AgentRun.filter({
  lead_id: testLeadId
}, '-created_date', 10);

const runsInLast30s = agentRuns.filter(r => 
  Date.now() - new Date(r.started_at).getTime() < 30000
);

assert(runsInLast30s.length === 1); // Only 1 run, not 2
```

---

## 🔧 MANUAL TEST PROCEDURES

### Test Admin UI - DLQ Monitor

**Access:** `/AdminDashboard` → Tab "DLQ"

**Actions to Test:**
1. View open DLQ events
2. Filter by severity = "critical"
3. Click "Retry Now" on an event
   - Verify: next_retry_at updated to now
   - Verify: status changes to "retrying"
4. Click "Mark Resolved"
   - Verify: status = "resolved"
5. Click "פרטים" (Details)
   - Verify: payload_json and context_json display
   - Verify: error stack shown

**KPI Validation:**
- Open count matches filter
- Critical count matches severity=critical filter
- Success rate = resolved / total

---

### Test Admin UI - Agent Performance

**Access:** `/AdminDashboard` → Tab "ביצועי סוכנים"

**Actions to Test:**
1. View KPI cards:
   - Runs today
   - Success rate
   - Failures
   - Avg duration
2. View bar chart - runs by agent
3. View timeline chart - response times
4. Click "אירועים" on a run
   - Verify: AgentEvents timeline displays
   - Verify: Can see message_in, llm_call, message_out

---

### Test Admin UI - Waiting Room

**Access:** `/AdminDashboard` → Tab "חדר המתנה"

**Actions to Test:**
1. View waiting users (CRMLead with waiting_for_response=true)
2. Check time since last message
3. Click "שלח תזכורת"
   - Verify: WhatsApp nudge sent
   - Verify: Toast confirmation
4. Click "העבר לאנושי"
   - Verify: CRMLead.status = "human_required"
   - Verify: active_handler = "human_agent"

---

## 📊 BACKFILL TEST

### Test Backfill Script

**Run:**
```javascript
// Dry run first
await base44.functions.invoke('backfillDLQSystem', { 
  action: 'full_backfill', 
  dryRun: true 
});
```

**Verify Results:**
- phones_normalized count
- users_linked count
- goals_linked count
- chat_trimmed count
- errors array (should be empty)

**Then Run Real:**
```javascript
await base44.functions.invoke('backfillDLQSystem', { 
  action: 'full_backfill', 
  dryRun: false 
});
```

**Post-Backfill Validation:**
```javascript
// All CRMLeads should have phone_normalized
const leadsWithoutNormalized = await base44.entities.CRMLead.filter({
  phone: { $ne: null },
  phone_normalized: null
});
assert(leadsWithoutNormalized.length === 0);

// Most CRMLeads with email should have user_id
const leadsWithEmail = await base44.entities.CRMLead.filter({
  email: { $ne: null }
});
const linkedCount = leadsWithEmail.filter(l => l.user_id).length;
const linkRate = (linkedCount / leadsWithEmail.length) * 100;
assert(linkRate > 70); // At least 70% linked
```

---

## 🚨 FAILURE INJECTION TESTS

### Inject LLM Failure
```javascript
// In reliableLLM or llmWrapper, temporarily:
throw new Error('SIMULATED_LLM_FAILURE');
```

**Expected:** DLQEvent created, fallback sent

### Inject Green API Failure
```javascript
// In whatsappWrapper, temporarily:
throw new Error('GREEN_API_HTTP_503');
```

**Expected:** OutboundMessage status=failed, DLQEvent created

### Inject DB Write Failure
```javascript
// Simulate constraint violation or network error
```

**Expected:** DLQEvent type=db_write created

---

## 📈 PERFORMANCE TESTS

### Load Test - 100 Concurrent Messages
**Tool:** Artillery or k6

**Scenario:**
- Send 100 WhatsApp messages within 10 seconds
- From 50 different users (2 messages each)

**Metrics to Track:**
- Idempotency: No duplicate processing
- Lock contention: Max wait time <500ms
- Response time: p95 <5s
- Success rate: >95%
- DLQ rate: <5%

---

## ✅ TEST CHECKLIST

- [ ] Test 1: New WhatsApp user
- [ ] Test 2: FirstGoalFlow journey
- [ ] Test 3: Concurrent messages
- [ ] Test 4: Chat history cap
- [ ] Test 5: Agent tracking
- [ ] Test 6: Message queue
- [ ] Test 7: LLM timeout → DLQ
- [ ] Test 8: WhatsApp fail → DLQ → Retry
- [ ] Test 9: Permanent failure
- [ ] Test 10: Double message idempotency
- [ ] Admin UI: DLQ Monitor
- [ ] Admin UI: Agent Performance
- [ ] Admin UI: Waiting Room
- [ ] Backfill: Dry run
- [ ] Backfill: Real run
- [ ] Load test: 100 messages

---

## 🎓 TEST RESULTS LOG

**Date:** ___________  
**Tester:** ___________

| Test # | Name | Status | Notes |
|--------|------|--------|-------|
| 1 | New WhatsApp User | ⬜ | |
| 2 | FirstGoalFlow | ⬜ | |
| 3 | Concurrent Messages | ⬜ | |
| 4 | Chat History Cap | ⬜ | |
| 5 | Agent Tracking | ⬜ | |
| 6 | Message Queue | ⬜ | |
| 7 | LLM → DLQ | ⬜ | |
| 8 | WhatsApp → DLQ → Retry | ⬜ | |
| 9 | Permanent Failure | ⬜ | |
| 10 | Idempotency | ⬜ | |

**Overall Pass Rate:** ____%  
**Critical Issues Found:** _____  
**Production Ready:** ✅ / ❌