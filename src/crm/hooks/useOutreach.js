import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invokeFunction, supabase } from '@/api/supabaseClient';

// ============================================
// Queries — direct DB reads
// ============================================

export function useOutreachWebsites(filters = {}) {
  return useQuery({
    queryKey: ['outreach-websites', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_websites')
        .select('*, outreach_contacts(id, email, is_primary)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.niche) {
        query = query.ilike('niche', `%${filters.niche}%`);
      }
      if (filters.search) {
        query = query.or(`domain.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useOutreachWebsiteDetail(websiteId) {
  return useQuery({
    queryKey: ['outreach-website', websiteId],
    queryFn: async () => {
      const { data: website, error } = await supabase
        .from('outreach_websites')
        .select('*')
        .eq('id', websiteId)
        .single();
      if (error || !website) throw new Error(error?.message || 'Website not found');

      const [contactsRes, messagesRes, repliesRes, tasksRes] = await Promise.all([
        supabase.from('outreach_contacts').select('*').eq('website_id', websiteId).order('is_primary', { ascending: false }),
        supabase.from('outreach_messages').select('*, outreach_campaigns(name)').eq('website_id', websiteId).order('created_at', { ascending: false }),
        supabase.from('outreach_replies').select('*').eq('website_id', websiteId).order('received_at', { ascending: false }),
        supabase.from('outreach_tasks').select('*').eq('website_id', websiteId).order('created_at', { ascending: false }),
      ]);

      return {
        ...website,
        contacts: contactsRes.data || [],
        messages: messagesRes.data || [],
        replies: repliesRes.data || [],
        tasks: tasksRes.data || [],
      };
    },
    enabled: !!websiteId,
    refetchInterval: 30000,
  });
}

export function useOutreachContacts(filters = {}) {
  return useQuery({
    queryKey: ['outreach-contacts', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_contacts')
        .select('*, outreach_websites(id, domain, name)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.website_id) {
        query = query.eq('website_id', filters.website_id);
      }
      if (filters.contact_source && filters.contact_source !== 'all') {
        query = query.eq('contact_source', filters.contact_source);
      }
      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useOutreachCampaigns(filters = {}) {
  return useQuery({
    queryKey: ['outreach-campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.campaign_type && filters.campaign_type !== 'all') {
        query = query.eq('campaign_type', filters.campaign_type);
      }

      const { data: campaigns, error } = await query;
      if (error) throw new Error(error.message);

      // Enrich with message stats per campaign
      const campaignIds = (campaigns || []).map(c => c.id);
      if (campaignIds.length === 0) return [];

      const { data: messages } = await supabase
        .from('outreach_messages')
        .select('campaign_id, status')
        .in('campaign_id', campaignIds);

      const statsMap = {};
      (messages || []).forEach(m => {
        if (!statsMap[m.campaign_id]) statsMap[m.campaign_id] = { total: 0, sent: 0, replied: 0, bounced: 0 };
        statsMap[m.campaign_id].total++;
        if (['sent', 'delivered', 'opened', 'replied'].includes(m.status)) statsMap[m.campaign_id].sent++;
        if (m.status === 'replied') statsMap[m.campaign_id].replied++;
        if (m.status === 'bounced') statsMap[m.campaign_id].bounced++;
      });

      return (campaigns || []).map(c => ({
        ...c,
        stats: statsMap[c.id] || { total: 0, sent: 0, replied: 0, bounced: 0 },
      }));
    },
    refetchInterval: 30000,
  });
}

export function useOutreachCampaignDetail(campaignId) {
  return useQuery({
    queryKey: ['outreach-campaign', campaignId],
    queryFn: async () => {
      const { data: campaign, error } = await supabase
        .from('outreach_campaigns')
        .select('*, outreach_email_templates!outreach_campaigns_initial_template_id_fkey(id, name, subject_template)')
        .eq('id', campaignId)
        .single();
      if (error || !campaign) throw new Error(error?.message || 'Campaign not found');

      const { data: messages } = await supabase
        .from('outreach_messages')
        .select('*, outreach_websites(domain, name), outreach_contacts(full_name, email)')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      return { ...campaign, messages: messages || [] };
    },
    enabled: !!campaignId,
    refetchInterval: 30000,
  });
}

export function useOutreachMessages(filters = {}) {
  return useQuery({
    queryKey: ['outreach-messages', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_messages')
        .select('*, outreach_websites(domain, name), outreach_contacts(full_name, email), outreach_campaigns(name)')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id);
      if (filters.website_id) query = query.eq('website_id', filters.website_id);
      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.sequence_step && filters.sequence_step !== 'all') query = query.eq('sequence_step', filters.sequence_step);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useOutreachReplies(filters = {}) {
  return useQuery({
    queryKey: ['outreach-replies', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_replies')
        .select('*, outreach_websites(domain, name), outreach_contacts(full_name, email), outreach_messages(subject, campaign_id)')
        .order('received_at', { ascending: false })
        .limit(200);

      if (filters.intent && filters.intent !== 'all') query = query.eq('intent', filters.intent);
      if (filters.sentiment && filters.sentiment !== 'all') query = query.eq('sentiment', filters.sentiment);
      if (filters.website_id) query = query.eq('website_id', filters.website_id);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

// Thread: all messages + replies for a given website_id, sorted by time
export function useOutreachThread(websiteId) {
  return useQuery({
    queryKey: ['outreach-thread', websiteId],
    queryFn: async () => {
      if (!websiteId) return [];

      const [messagesRes, repliesRes] = await Promise.all([
        supabase
          .from('outreach_messages')
          .select('id, subject, body_text, status, sent_at, created_at, sequence_step')
          .eq('website_id', websiteId)
          .in('status', ['sent', 'delivered', 'opened', 'replied', 'approved'])
          .order('created_at', { ascending: true }),
        supabase
          .from('outreach_replies')
          .select('id, subject, body, direction, received_at, sentiment, intent')
          .eq('website_id', websiteId)
          .order('received_at', { ascending: true }),
      ]);

      const messages = (messagesRes.data || []).map(m => ({
        id: m.id,
        type: 'outbound',
        subject: m.subject,
        body: m.body_text,
        status: m.status,
        timestamp: m.sent_at || m.created_at,
        step: m.sequence_step,
      }));

      const replies = (repliesRes.data || []).map(r => ({
        id: r.id,
        type: r.direction === 'outbound' ? 'outbound' : 'inbound',
        subject: r.subject,
        body: r.body,
        status: r.sentiment,
        timestamp: r.received_at,
        intent: r.intent,
      }));

      const all = [...messages, ...replies].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );

      return all;
    },
    enabled: !!websiteId,
    refetchInterval: 15000,
  });
}

export function useOutreachTasks(filters = {}) {
  return useQuery({
    queryKey: ['outreach-tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('outreach_tasks')
        .select('*, outreach_websites(domain, name), outreach_contacts(full_name, email)')
        .order('due_date', { ascending: true })
        .limit(200);

      if (filters.status && filters.status !== 'all') query = query.eq('status', filters.status);
      if (filters.type && filters.type !== 'all') query = query.eq('type', filters.type);
      if (filters.website_id) query = query.eq('website_id', filters.website_id);

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 30000,
  });
}

export function useOutreachTemplates() {
  return useQuery({
    queryKey: ['outreach-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_email_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 60000,
  });
}

export function useOutreachDomainHealth() {
  return useQuery({
    queryKey: ['outreach-domain-health'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_domain_health')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    refetchInterval: 60000,
  });
}

export function useOutreachOverview() {
  return useQuery({
    queryKey: ['outreach-overview'],
    queryFn: async () => {
      const [websitesRes, campaignsRes, messagesRes, repliesRes, tasksRes, healthRes] = await Promise.all([
        supabase.from('outreach_websites').select('id, status, relevance_score, created_at'),
        supabase.from('outreach_campaigns').select('id, status, campaign_type'),
        supabase.from('outreach_messages').select('id, status, sent_at, created_at'),
        supabase.from('outreach_replies').select('id, intent, sentiment, received_at'),
        supabase.from('outreach_tasks').select('id, status, type'),
        supabase.from('outreach_domain_health').select('*'),
      ]);

      const websites = websitesRes.data || [];
      const campaigns = campaignsRes.data || [];
      const messages = messagesRes.data || [];
      const replies = repliesRes.data || [];
      const tasks = tasksRes.data || [];
      const health = healthRes.data || [];

      const sentMessages = messages.filter(m => ['sent', 'delivered', 'opened', 'replied'].includes(m.status));
      const bouncedMessages = messages.filter(m => m.status === 'bounced');

      // 30-day trend
      const trend = [];
      const today = new Date();
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().slice(0, 10);
        const daySent = sentMessages.filter(m => m.sent_at && m.sent_at.slice(0, 10) === dayStr).length;
        const dayReplied = replies.filter(r => r.received_at && r.received_at.slice(0, 10) === dayStr).length;
        trend.push({
          date: d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
          sent: daySent,
          replied: dayReplied,
        });
      }

      return {
        totalWebsites: websites.length,
        approvedWebsites: websites.filter(w => !['new', 'reviewed', 'rejected', 'do_not_contact'].includes(w.status)).length,
        activeCampaigns: campaigns.filter(c => c.status === 'active').length,
        totalSent: sentMessages.length,
        totalReplied: replies.length,
        replyRate: sentMessages.length > 0 ? Math.round((replies.length / sentMessages.length) * 100) : 0,
        bounceRate: sentMessages.length > 0 ? Math.round((bouncedMessages.length / (sentMessages.length + bouncedMessages.length)) * 100) : 0,
        openTasks: tasks.filter(t => t.status !== 'done').length,
        wonDeals: websites.filter(w => w.status === 'won').length,
        recentReplies: replies.slice(0, 5),
        trend,
        health: health[0] || null,
        statusBreakdown: websites.reduce((acc, w) => {
          acc[w.status] = (acc[w.status] || 0) + 1;
          return acc;
        }, {}),
      };
    },
    refetchInterval: 30000,
  });
}

export function useOutreachUnreadReplies() {
  return useQuery({
    queryKey: ['outreach-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('outreach_replies')
        .select('id', { count: 'exact', head: true })
        .eq('sentiment', 'needs_review');
      if (error) return 0;
      return count || 0;
    },
    refetchInterval: 30000,
  });
}

// Returns threads grouped by website_id — only websites with at least 1 inbound reply
export function useOutreachThreads() {
  return useQuery({
    queryKey: ['outreach-threads'],
    queryFn: async () => {
      // Step 1: get website_ids that have inbound replies
      const { data: inboundRows, error: inboundErr } = await supabase
        .from('outreach_replies')
        .select('website_id, id, subject, body, direction, received_at, intent, sentiment')
        .eq('direction', 'inbound')
        .not('website_id', 'is', null)
        .order('received_at', { ascending: false })
        .limit(1000);

      if (inboundErr) throw new Error(inboundErr.message);
      if (!inboundRows || inboundRows.length === 0) return [];

      const uniqueWebsiteIds = [...new Set(inboundRows.map(r => r.website_id))];

      // Step 2: fetch outbound replies + messages + websites only for those ids
      const [allRepliesRes, messagesRes, websitesRes] = await Promise.all([
        supabase
          .from('outreach_replies')
          .select('id, website_id, subject, body, direction, received_at, intent, sentiment')
          .in('website_id', uniqueWebsiteIds)
          .order('received_at', { ascending: false })
          .limit(2000),
        supabase
          .from('outreach_messages')
          .select('id, website_id, subject, body_text, sent_at, created_at, status')
          .in('status', ['sent', 'delivered', 'opened', 'replied', 'approved'])
          .in('website_id', uniqueWebsiteIds)
          .order('created_at', { ascending: false })
          .limit(2000),
        supabase
          .from('outreach_websites')
          .select('id, domain, name')
          .in('id', uniqueWebsiteIds),
      ]);

      const messages = messagesRes.data || [];
      const replies = allRepliesRes.data || [];
      const websites = websitesRes.data || [];

      const websiteMap = Object.fromEntries(websites.map(w => [w.id, w]));

      return uniqueWebsiteIds.map(websiteId => {
        const msgs = messages.filter(m => m.website_id === websiteId);
        const reps = replies.filter(r => r.website_id === websiteId);

        const allTimes = [
          ...msgs.map(m => new Date(m.sent_at || m.created_at)),
          ...reps.map(r => new Date(r.received_at)),
        ].filter(Boolean);
        const latestTime = allTimes.length > 0 ? new Date(Math.max(...allTimes)) : new Date(0);

        const inboundReplies = reps.filter(r => r.direction !== 'outbound');
        const lastInbound = inboundReplies.length > 0 ? inboundReplies[0] : null;
        const unreadCount = inboundReplies.filter(r => r.sentiment === 'needs_review').length;

        const lastMsg = msgs.length > 0 ? msgs[0] : null;
        const lastActivity = reps.length > 0 && new Date(reps[0].received_at) > (lastMsg ? new Date(lastMsg.sent_at || lastMsg.created_at) : new Date(0))
          ? reps[0]
          : lastMsg;
        const preview = lastActivity
          ? (lastActivity.body || lastActivity.body_text || '').slice(0, 80)
          : '';

        return {
          website_id: websiteId,
          website: websiteMap[websiteId] || { id: websiteId, domain: websiteId },
          latest_message_at: latestTime.toISOString(),
          last_inbound: lastInbound,
          last_intent: lastInbound?.intent || null,
          last_sentiment: lastInbound?.sentiment || null,
          unread_count: unreadCount,
          preview,
        };
      }).sort((a, b) => new Date(b.latest_message_at) - new Date(a.latest_message_at));
    },
    refetchInterval: 15000,
  });
}

// ============================================
// Mutations
// ============================================

export function useCreateWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('outreach_websites')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-websites'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useUpdateWebsite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('outreach_websites')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['outreach-websites'] });
      qc.invalidateQueries({ queryKey: ['outreach-website', data.id] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useBulkUpdateWebsites() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, updates }) => {
      const { error } = await supabase
        .from('outreach_websites')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .in('id', ids);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-websites'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useImportWebsitesCSV() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows) => {
      // rows is array of { domain, name, niche, country, language, notes }
      const { data, error } = await supabase
        .from('outreach_websites')
        .upsert(rows.map(r => ({ ...r, status: 'new' })), { onConflict: 'domain', ignoreDuplicates: true })
        .select();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-websites'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('outreach_contacts')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['outreach-contacts'] });
      qc.invalidateQueries({ queryKey: ['outreach-website', data.website_id] });
    },
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('outreach_contacts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['outreach-contacts'] });
      qc.invalidateQueries({ queryKey: ['outreach-website', data.website_id] });
    },
  });
}

export function useCreateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useUpdateCampaign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('outreach_campaigns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['outreach-campaigns'] });
      qc.invalidateQueries({ queryKey: ['outreach-campaign', data.id] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useGenerateDrafts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => invokeFunction('outreachMessages', { action: 'generate_drafts', ...payload }),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['outreach-messages'] });
      qc.invalidateQueries({ queryKey: ['outreach-campaign', variables.campaign_id] });
    },
  });
}

export function useApproveMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId }) => {
      const { data, error } = await supabase
        .from('outreach_messages')
        .update({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-messages'] });
      qc.invalidateQueries({ queryKey: ['outreach-campaign'] });
    },
  });
}

export function useBulkApproveMessages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageIds }) => {
      const { error } = await supabase
        .from('outreach_messages')
        .update({ status: 'approved', approved_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .in('id', messageIds);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-messages'] });
      qc.invalidateQueries({ queryKey: ['outreach-campaign'] });
    },
  });
}

export function useUpdateReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('outreach_replies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-replies'] });
      qc.invalidateQueries({ queryKey: ['outreach-unread-count'] });
      qc.invalidateQueries({ queryKey: ['outreach-threads'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useMarkThreadRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (websiteId) => {
      const { error } = await supabase
        .from('outreach_replies')
        .update({ sentiment: 'neutral' })
        .eq('website_id', websiteId)
        .eq('sentiment', 'needs_review');
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-threads'] });
      qc.invalidateQueries({ queryKey: ['outreach-unread-count'] });
    },
  });
}

export function useCreateOutreachTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('outreach_tasks')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-tasks'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useCompleteOutreachTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ taskId }) => {
      const { error } = await supabase
        .from('outreach_tasks')
        .update({ status: 'done', updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-tasks'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data, error } = await supabase
        .from('outreach_email_templates')
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-templates'] }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data, error } = await supabase
        .from('outreach_email_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-templates'] }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await supabase
        .from('outreach_email_templates')
        .delete()
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-templates'] }),
  });
}

// AI mutations — route through Edge Function
export function useClassifyReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => invokeFunction('outreachAI', { action: 'classify_reply', ...payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outreach-replies'] });
      qc.invalidateQueries({ queryKey: ['outreach-unread-count'] });
    },
  });
}

export function useSuggestReply() {
  return useMutation({
    mutationFn: async (payload) => invokeFunction('outreachAI', { action: 'suggest_reply', ...payload }),
  });
}

export function useSendReply() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => invokeFunction('outreachReplyToLead', payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['outreach-replies'] });
      qc.invalidateQueries({ queryKey: ['outreach-threads'] });
      qc.invalidateQueries({ queryKey: ['outreach-thread'] });
      qc.invalidateQueries({ queryKey: ['outreach-overview'] });
    },
  });
}

export function useSuggestSubject() {
  return useMutation({
    mutationFn: async (payload) => invokeFunction('outreachAI', { action: 'suggest_subject', ...payload }),
  });
}
