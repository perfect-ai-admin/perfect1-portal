# 🚀 DEPLOYMENT CHECKLIST

## Pre-Deployment

### Code Review
- [ ] All 55 issues addressed in code
- [ ] New entities created (AgentRun, MessageQueue, IdempotencyKey)
- [ ] Schema changes reviewed (CRMLead, UserGoal, ConversationLog, Timeline)
- [ ] All functions updated (greenWebhook, firstGoalFlow, smartMentor, etc.)
- [ ] phoneNormalizer utility integrated everywhere
- [ ] Service role support in all backend functions

### Configuration
- [ ] GREENAPI_INSTANCE_ID set
- [ ] GREENAPI_API_TOKEN set
- [ ] OPENAI_API_KEY set
- [ ] BASE_URL configured

### Testing (Local/Dev)
- [ ] Test 1: Concurrent messages → no collision
- [ ] Test 2: LLM failure → fallback works
- [ ] Test 3: New WhatsApp user → CRMLead created
- [ ] Test 4: FirstGoalFlow → completes and updates memory
- [ ] Test 5: Chat history → caps at 100
- [ ] Test 6: Agent tracking → AgentRun logs appear
- [ ] Test 7: Message queue → retry on failure
- [ ] Test 8: ensureUserLinks → syncs correctly

---

## Deployment Steps

### Step 1: Schema Migration ✅
**Action:** Deploy new entities  
**Risk:** Low (additive)  
**Rollback:** Delete entities if unused

```bash
✅ Deploy: AgentRun.json
✅ Deploy: MessageQueue.json
✅ Deploy: IdempotencyKey.json
✅ Update: CRMLead.json (added fields)
✅ Update: UserGoal.json (added lead_id + flow_data structure)
✅ Update: ConversationLog.json (added lead_id, goal_id, etc.)
✅ Update: Timeline.json (added lead_id)
```

**Validation:**
- [ ] All entities appear in Dashboard → Entities
- [ ] Can create test records manually
- [ ] Old data still loads

---

### Step 2: Deploy Helper Services ✅
**Action:** Deploy utilities (not yet called)  
**Risk:** Very Low

```bash
✅ Deploy: phoneNormalizer.js
✅ Deploy: idempotencyGuard.js
✅ Deploy: acquireLock.js
✅ Deploy: reliableLLM.js
✅ Deploy: messageQueueProcessor.js
✅ Deploy: ensureUserLinks.js
✅ Deploy: syncUserGoalLinks.js (already deployed earlier)
✅ Deploy: agentPerformanceTracker.js (already deployed earlier)
```

**Validation:**
- [ ] Test each function manually via Dashboard
- [ ] phoneNormalizer: input=0502277087 → output=972502277087
- [ ] idempotencyGuard: check/mark_processed flow works
- [ ] acquireLock: acquire→release works
- [ ] reliableLLM: test with simple prompt
- [ ] messageQueueProcessor: enqueue→process works

---

### Step 3: Backfill Existing Data 🔄
**Action:** Update existing records  
**Risk:** Medium (data mutation)  
**Timing:** Low-traffic window (2-4am)

**Run in order:**

1. **Normalize Phones** (5-10 min)
```javascript
// Via syncUserGoalLinks
{
  "auto_fix": true
}
```
Expected: ~500 CRMLead records updated with phone_normalized

2. **Link Users** (5 min)
```javascript
// Via ensureUserLinks (batch)
FOR EACH lead IN CRMLead:
  invoke ensureUserLinks {
    phone_normalized: lead.phone_normalized,
    email: lead.email,
    create_if_missing: false
  }
```
Expected: user_id populated for matched leads

3. **Sync Goals** (2 min)
```javascript
// Via syncUserGoalLinks again
{
  "auto_fix": true
}
```
Expected: UserGoal.lead_id populated

**Validation After Backfill:**
- [ ] >90% of CRMLead have phone_normalized
- [ ] >80% of CRMLead have user_id (if registered)
- [ ] 100% of UserGoal have user_id
- [ ] >50% of UserGoal have lead_id

---

### Step 4: Deploy Updated Flows (Canary 5%) ⚠️
**Action:** Update core webhook handlers  
**Risk:** HIGH (affects live traffic)  
**Strategy:** Feature flag or gradual rollout

**Files to Deploy:**
```bash
⚠️ greenApiWebhook.js (CRITICAL - handles all incoming)
⚠️ firstGoalMentorFlow.js
⚠️ smartMentorEngine.js
⚠️ updateUserMemory.js
⚠️ mentorChat.js
```

**Canary Config (if supported):**
- 5% traffic to new version
- Monitor for 1 hour:
  - Error rate < 2%
  - Response time < 5s p95
  - No lock timeouts
  - No idempotency collisions

**Monitoring Queries:**
```javascript
// Check for errors
AgentRun.filter({ status: 'failed', created_date: { $gte: last_hour }})

// Check lock issues
CRMLead.filter({ processing_lock: true, lock_expires_at: { $lt: now }})

// Check message queue backlog
MessageQueue.filter({ status: 'queued' }).length > 50 ? ALERT : OK
```

**Rollback Trigger:**
- Error rate >5%
- Lock timeout >10 cases
- User complaints >2
- Message delivery <95%

**Rollback Action:**
- Revert all 5 functions to previous version
- Clear stuck locks: `CRMLead.update({ processing_lock: false })`
- Process queued messages manually

---

### Step 5: Enable 100% Traffic ✅
**Timing:** After 1h successful canary  
**Action:** Remove feature flag / deploy to all instances

**Post-Deployment Checks (First 2 Hours):**
- [ ] AgentRun creation rate normal
- [ ] MessageQueue processing smoothly
- [ ] No lock contention
- [ ] UserMemory updates working
- [ ] ConversationLog has lead_id + goal_id
- [ ] chat_history stays ≤100

---

### Step 6: Create Automations 🤖

**Automation 1: Message Queue Processor**
```
Name: Process WhatsApp Message Queue
Type: Scheduled - Simple
Interval: 1 minute
Function: messageQueueProcessor
Payload: { "action": "process_next" }
```

**Automation 2: Idempotency Cleanup**
```
Name: Cleanup Expired Idempotency Keys
Type: Scheduled - Cron
Cron: 0 3 * * * (daily 3am)
Function: idempotencyGuard
Payload: { "action": "cleanup_expired" }
```

**Automation 3: Lock Expiry Cleanup**
```
Name: Release Stale Locks
Type: Scheduled - Simple
Interval: 5 minutes
Function: releaseStaleLocks (CREATE THIS)
```

**Automation 4: Chat History Trim** (Optional)
```
Name: Trim Long Chat Histories
Type: Scheduled - Cron
Cron: 0 2 * * 0 (Sunday 2am weekly)
Function: trimChatHistories (CREATE THIS)
```

---

## 📊 Post-Deployment Monitoring (Week 1)

### Metrics to Track

**System Health:**
- [ ] Message delivery rate >98%
- [ ] Average response time <3s
- [ ] LLM success rate >95%
- [ ] Lock acquisition time <200ms
- [ ] Queue backlog <10 messages

**Data Quality:**
- [ ] phone_normalized coverage 100%
- [ ] user_id link coverage >85%
- [ ] ConversationLog.goal_id coverage >80%
- [ ] AgentRun creation per interaction

**Business Metrics:**
- [ ] User engagement (messages per day)
- [ ] FirstGoalFlow completion rate
- [ ] Memory quality (insights extracted)
- [ ] Agent handoff success rate

### Dashboard Queries

**Daily Summary:**
```javascript
// Messages processed today
AgentRun.filter({ 
  created_date: { $gte: today },
  status: 'completed' 
}).length

// Failed runs
AgentRun.filter({ 
  created_date: { $gte: today },
  status: 'failed' 
})

// Queue backlog
MessageQueue.filter({ status: 'queued' }).length

// Active conversations
CRMLead.filter({ 
  conversation_state: 'bot_waiting_response' 
}).length
```

---

## 🔧 REMAINING TASKS (Post-Launch)

### High Priority
- [ ] Create `releaseStaleLocks` function
- [ ] Create `trimChatHistories` function
- [ ] Add DB indexes (coordinate with Base44 team)
- [ ] Monitor circuit breaker - tune thresholds

### Medium Priority
- [ ] Admin dashboard for AgentRun monitoring
- [ ] Real-time queue status widget
- [ ] Conversation analytics report
- [ ] A/B test framework for message templates

### Low Priority
- [ ] Encryption at rest for chat_history
- [ ] Webhook signature validation
- [ ] Rate limiting (API Gateway level)
- [ ] Dead letter queue UI

---

## 🎓 KNOWLEDGE TRANSFER

### For Developers
- **Phone Handling:** ALWAYS use phoneNormalizer, never raw phone
- **Service Role:** Check isServiceRole, pass user_id explicitly
- **LLM Calls:** Use reliableLLM wrapper, provide fallback_response
- **Concurrency:** Use acquireLock before updating CRMLead
- **Message Sending:** Use messageQueueProcessor, not direct API

### For Operators
- **Monitor:** AgentRun for failures
- **Check:** MessageQueue for backlog >20
- **Alert:** Lock stuck >5min → manual release
- **Weekly:** Review agent performance stats

---

## ✅ SIGN-OFF

- [ ] All tests passed
- [ ] Backfill completed
- [ ] Automations running
- [ ] Monitoring configured
- [ ] Team trained
- [ ] Documentation updated

**Deployment Leader:** _______________  
**Date:** _______________  
**Production Release:** ✅ / ❌