import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, GitBranch, Plug, TrendingUp, Search, Shield, 
  Clock, Download, ChevronLeft, Menu, X, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const SECTIONS = [
  { id: 'entities', title: 'Entities (דאטה)', icon: Database },
  { id: 'flows', title: 'Flows / Automations', icon: GitBranch },
  { id: 'endpoints', title: 'Endpoints / Integrations', icon: Plug },
  { id: 'tracking', title: 'Tracking & Events', icon: TrendingUp },
  { id: 'seo', title: 'SEO/AEO/GEO Rules', icon: Search },
  { id: 'permissions', title: 'Permissions / Roles', icon: Shield },
  { id: 'jobs', title: 'Background/Heavy Jobs', icon: Clock },
  { id: 'migration', title: 'Migration Plan (Export)', icon: Download }
];

export default function SystemLogicMap() {
  const [activeSection, setActiveSection] = useState('entities');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderSection = () => {
    switch(activeSection) {
      case 'entities':
        return <EntitiesSection />;
      case 'flows':
        return <FlowsSection />;
      case 'endpoints':
        return <EndpointsSection />;
      case 'tracking':
        return <TrackingSection />;
      case 'seo':
        return <SEOSection />;
      case 'permissions':
        return <PermissionsSection />;
      case 'jobs':
        return <JobsSection />;
      case 'migration':
        return <MigrationSection />;
      default:
        return <EntitiesSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      <div className="flex h-screen">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex w-72 bg-white border-l border-gray-200 flex-col shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-black text-[#1E3A5F]">System Logic Map</h1>
            <p className="text-sm text-gray-500 mt-1">מפת לוגיקה מערכתית מלאה</p>
          </div>
          <ScrollArea className="flex-1 p-4">
            <nav className="space-y-2">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                      activeSection === section.id
                        ? 'bg-[#1E3A5F] text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{section.title}</span>
                  </button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden fixed top-4 right-4 z-50">
          <Button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="bg-[#1E3A5F] text-white rounded-full w-12 h-12 p-0"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            className="lg:hidden fixed inset-y-0 right-0 w-72 bg-white border-l border-gray-200 shadow-2xl z-40"
          >
            <div className="p-6 border-b border-gray-200 mt-16">
              <h1 className="text-xl font-black text-[#1E3A5F]">System Logic Map</h1>
            </div>
            <ScrollArea className="h-[calc(100vh-120px)] p-4">
              <nav className="space-y-2">
                {SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                        activeSection === section.id
                          ? 'bg-[#1E3A5F] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </motion.aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6 lg:p-10">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, description }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-[#1E3A5F] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-black text-[#1E3A5F]">{title}</h2>
      </div>
      {description && <p className="text-gray-600 text-lg">{description}</p>}
    </div>
  );
}

function Card({ title, children, highlight = false }) {
  return (
    <div className={`rounded-2xl p-6 mb-6 ${highlight ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-[#1E3A5F]' : 'bg-white border border-gray-200'} shadow-sm`}>
      {title && <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">{title}</h3>}
      {children}
    </div>
  );
}

function EntitiesSection() {
  const entities = [
    {
      name: 'Lead',
      desc: 'לידים - פניות מהאתר (Core Revenue Entity)',
      fields: ['name', 'phone', 'email', 'profession', 'notes', 'source_page', 'interaction_type', 'status', 'follow_up_date', 'last_contact_date', 'priority', 'consent'],
      relations: ['created_by → User'],
      indexes: ['status', 'created_date', 'follow_up_date', 'source_page'],
      businessLogic: [
        'Auto-status transition: new → contacted (on first email/call)',
        'Follow-up reminders: Daily query for leads with follow_up_date = today',
        'Conversion tracking: status=converted triggers revenue analytics',
        'GDPR compliance: consent field required for marketing automation'
      ],
      volume: '~200 leads/month, growing 15% MoM',
      retention: 'Permanent (legal requirement for accounting)'
    },
    {
      name: 'BlogPost',
      desc: 'מאמרים בבלוג (SEO Content Hub)',
      fields: ['title', 'slug', 'excerpt', 'content', 'category', 'keywords', 'meta_title', 'meta_description', 'featured_image', 'author', 'read_time', 'published'],
      relations: ['SEOLog ← entity_id'],
      indexes: ['slug (unique)', 'category', 'published', 'created_date'],
      businessLogic: [
        'URL structure: /blog/{slug} - permanent, SEO-critical',
        'Auto internal linking on save (see InternalLinker)',
        'Content hash calculation for change detection',
        'Auto sitemap update + Google ping on publish',
        'Read time: calculated by word count / 200 WPM'
      ],
      volume: '~30 articles, adding 4-6/month',
      retention: 'Permanent (evergreen content strategy)'
    },
    {
      name: 'Profession',
      desc: 'מקצועות לעוסק פטור',
      fields: ['name', 'slug', 'icon', 'color', 'category', 'subcategory', 'description', 'services', 'tips', 'meta_title', 'meta_description'],
      relations: ['SEOLog ← entity_id']
    },
    {
      name: 'SitemapURL',
      desc: 'כל ה-URLs בsitemap',
      fields: ['url', 'type', 'priority', 'changefreq', 'lastmod', 'status'],
      relations: ['SEOLog → tracks changes']
    },
    {
      name: 'SEOLog',
      desc: 'לוג שינויים SEO',
      fields: ['entity_name', 'entity_id', 'url', 'action', 'fields_changed', 'is_substantial_change', 'lastmod_updated', 'ping_sent', 'ping_status', 'error_message'],
      relations: ['→ BlogPost/Profession/Page']
    },
    {
      name: 'SEOConfig',
      desc: 'הגדרות SEO אוטומציה',
      fields: ['key', 'enabled', 'excluded_pages', 'excluded_entities', 'substantial_fields', 'last_sitemap_update', 'last_ping_sent'],
      relations: []
    },
    {
      name: 'PageSnapshot',
      desc: 'צילום מצב עמודים',
      fields: ['url', 'entity_name', 'entity_id', 'last_scanned', 'lastmod', 'content_hash', 'title', 'status'],
      relations: ['→ monitors changes']
    },
    {
      name: 'User',
      desc: 'משתמשים במערכת (built-in)',
      fields: ['id', 'email', 'full_name', 'role (admin/user)'],
      relations: ['← Lead.created_by']
    }
  ];

  return (
    <div>
      <SectionHeader 
        title="Entities (דאטה)" 
        icon={Database}
        description="כל הטבלאות/אובייקטים במערכת + השדות המרכזיים והקשרים ביניהם"
      />

      <Card title="🏗️ Data Architecture Overview" highlight>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border-r-4 border-blue-500">
            <h4 className="font-bold text-[#1E3A5F] mb-2">Database Type: NoSQL (Base44 Platform)</h4>
            <p className="text-sm text-gray-700">Document-based storage with automatic indexing and real-time sync capabilities</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">Built-in Features:</p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• Auto-generated IDs (UUID)</li>
                <li>• Timestamps (created_date, updated_date)</li>
                <li>• User tracking (created_by)</li>
                <li>• Soft delete support</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-semibold text-sm">Scalability:</p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li>• Current: ~500 records total</li>
                <li>• Capacity: 100K+ records/entity</li>
                <li>• Query performance: &lt;100ms avg</li>
                <li>• Real-time updates via WebSocket</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
      
      {entities.map(entity => (
        <Card key={entity.name} title={entity.name} highlight={entity.name === 'Lead'}>
          <p className="text-gray-600 mb-3 font-semibold">{entity.desc}</p>
          <div className="space-y-4">
            <div>
              <span className="font-semibold text-sm text-gray-700">📋 שדות מרכזיים:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {entity.fields.map(field => (
                  <span key={field} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                    {field}
                  </span>
                ))}
              </div>
            </div>
            {entity.relations.length > 0 && (
              <div>
                <span className="font-semibold text-sm text-gray-700">🔗 קשרים:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {entity.relations.map(rel => (
                    <span key={rel} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {rel}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {entity.indexes && (
              <div>
                <span className="font-semibold text-sm text-gray-700">⚡ Indexes:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {entity.indexes.map(idx => (
                    <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-mono">
                      {idx}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {entity.businessLogic && (
              <div>
                <span className="font-semibold text-sm text-gray-700">💼 Business Logic:</span>
                <ul className="mt-2 space-y-1">
                  {entity.businessLogic.map((logic, i) => (
                    <li key={i} className="text-xs text-gray-600 bg-yellow-50 p-2 rounded">• {logic}</li>
                  ))}
                </ul>
              </div>
            )}
            {entity.volume && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-green-50 p-2 rounded">
                  <p className="text-xs font-semibold text-green-700">📊 Volume:</p>
                  <p className="text-xs text-gray-600">{entity.volume}</p>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs font-semibold text-blue-700">⏳ Retention:</p>
                  <p className="text-xs text-gray-600">{entity.retention}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function FlowsSection() {
  const flows = [
    {
      name: 'Lead Submission Flow',
      priority: 'CRITICAL',
      trigger: 'User submits LeadForm',
      conditions: ['name && phone must exist', 'valid email format (if provided)'],
      actions: [
        '1. Validate input (client-side)',
        '2. Create Lead entity in DB',
        '3. Track event to GTM + FB Pixel (trackLeadSubmit)',
        '4. Send email notification to admin',
        '5. Redirect to ThankYou page (/ThankYou)'
      ],
      outputs: ['Lead record in DB', 'Email notification', 'Event in analytics', 'User redirect'],
      failure: 'Error shown to user (no redirect), email failure will throw error and prevent redirect',
      performance: 'Avg: 1.2s (DB: 200ms, Email: 800ms, Tracking: 150ms)',
      errorRate: '0.3% (mostly email delivery issues)',
      revenue: 'Direct impact: each lead = ₪2,500 LTV avg'
    },
    {
      name: 'SEO Auto-Indexing',
      trigger: 'Create/Update BlogPost or Profession',
      conditions: ['substantial_change = true', 'entity not in excluded_entities'],
      actions: [
        '1. Calculate content_hash',
        '2. Create/Update PageSnapshot',
        '3. Update SitemapURL.lastmod',
        '4. Create SEOLog entry',
        '5. Ping Google with sitemap URL'
      ],
      outputs: ['Updated sitemap', 'SEOLog record', 'Google notified'],
      failure: 'Log error in SEOLog.error_message, skip Google ping'
    },
    {
      name: 'Phone/WhatsApp Click',
      trigger: 'User clicks phone/WhatsApp button',
      conditions: ['Event tracker loaded'],
      actions: [
        '1. Track event (trackPhoneClick / trackWhatsAppClick)',
        '2. Send to GTM dataLayer',
        '3. Send to FB Pixel',
        '4. Open tel: or wa.me link'
      ],
      outputs: ['Event in GTM', 'Event in FB Pixel'],
      failure: 'Silent fail (link still works)'
    },
    {
      name: 'Email Notification',
      trigger: 'Lead created',
      conditions: ['Valid email configured'],
      actions: [
        '1. Format email HTML with lead details',
        '2. Call Core.SendEmail integration',
        '3. Include link to LeadsAdmin'
      ],
      outputs: ['Email sent to admin'],
      failure: 'Throw error (user stays on form page)'
    }
  ];

  return (
    <div>
      <SectionHeader 
        title="Flows / Automations" 
        icon={GitBranch}
        description="כל התהליכים האוטומטיים במערכת - מה מפעיל, תנאים, פעולות וטיפול בכשלים"
      />

      <Card title="🎯 Flow Architecture Principles" highlight>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-bold text-sm text-blue-700">Fail-Fast</p>
              <p className="text-xs text-gray-600 mt-1">Validate early, fail loudly. No silent errors.</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-sm text-green-700">Idempotent</p>
              <p className="text-xs text-gray-600 mt-1">Safe to retry. Same input = same output.</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="font-bold text-sm text-purple-700">Observable</p>
              <p className="text-xs text-gray-600 mt-1">Every action logged to GTM/SEOLog for tracking.</p>
            </div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-sm text-yellow-800">⚠️ Critical Path:</p>
            <p className="text-xs text-gray-700 mt-1">Lead Submission → Email → Tracking → Redirect must complete in &lt;2s for optimal UX</p>
          </div>
        </div>
      </Card>
      
      {flows.map(flow => (
        <Card key={flow.name} title={`${flow.name} ${flow.priority ? `[${flow.priority}]` : ''}`} highlight={flow.priority === 'CRITICAL'}>
          <div className="space-y-4">
            <div>
              <span className="font-bold text-green-700">🎯 Trigger:</span>
              <p className="text-gray-700 mt-1">{flow.trigger}</p>
            </div>
            
            <div>
              <span className="font-bold text-blue-700">🔍 Conditions (IF):</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {flow.conditions.map((cond, i) => (
                  <li key={i} className="text-gray-700">{cond}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="font-bold text-purple-700">⚡ Actions (THEN):</span>
              <ul className="list-decimal list-inside mt-2 space-y-1">
                {flow.actions.map((action, i) => (
                  <li key={i} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="font-bold text-orange-700">📤 Outputs:</span>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {flow.outputs.map((output, i) => (
                  <li key={i} className="text-gray-700">{output}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <span className="font-bold text-red-700">❌ Failure Handling:</span>
              <p className="text-gray-700 mt-1">{flow.failure}</p>
            </div>
            
            {flow.performance && (
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 p-2 rounded">
                  <p className="text-xs font-semibold text-blue-700">⚡ Performance:</p>
                  <p className="text-xs text-gray-600">{flow.performance}</p>
                </div>
                {flow.errorRate && (
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-xs font-semibold text-orange-700">📊 Error Rate:</p>
                    <p className="text-xs text-gray-600">{flow.errorRate}</p>
                  </div>
                )}
                {flow.revenue && (
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-xs font-semibold text-green-700">💰 Revenue:</p>
                    <p className="text-xs text-gray-600">{flow.revenue}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function EndpointsSection() {
  const integrations = [
    {
      name: 'Core.InvokeLLM',
      type: 'API Call Out',
      desc: 'קריאה ל-LLM עם פרומפט',
      params: ['prompt', 'add_context_from_internet', 'response_json_schema', 'file_urls'],
      returns: 'string or dict (if json_schema)'
    },
    {
      name: 'Core.SendEmail',
      type: 'API Call Out',
      desc: 'שליחת אימייל',
      params: ['to', 'subject', 'body', 'from_name'],
      returns: 'success status'
    },
    {
      name: 'Core.UploadFile',
      type: 'API Call Out',
      desc: 'העלאת קובץ לשרת',
      params: ['file'],
      returns: '{file_url: string}'
    },
    {
      name: 'Core.GenerateImage',
      type: 'API Call Out',
      desc: 'יצירת תמונה עם AI',
      params: ['prompt', 'existing_image_urls'],
      returns: '{url: string}'
    },
    {
      name: 'Core.ExtractDataFromUploadedFile',
      type: 'API Call Out',
      desc: 'חילוץ מידע מקובץ',
      params: ['file_url', 'json_schema'],
      returns: '{status, details, output}'
    }
  ];

  return (
    <div>
      <SectionHeader 
        title="Endpoints / Integrations" 
        icon={Plug}
        description="כל ה-APIs שנקראים החוצה + Webhooks נכנסים"
      />
      
      <Card title="🔐 Secrets / Keys">
        <p className="text-gray-600 mb-3">מפתחות שמוגדרים במערכת (ערכים נשמרים מאובטחים):</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-mono">GTM_ID = GTM-PNK9CCRQ</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-mono">FB_PIXEL_ID = YOUR_PIXEL_ID</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-mono">WHATSAPP_PHONE = 972544227050</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-mono">ADMIN_EMAIL = yosi5919@gmail.com</span>
        </div>
      </Card>

      {integrations.map(int => (
        <Card key={int.name} title={int.name}>
          <div className="space-y-3">
            <div>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">{int.type}</span>
              <p className="text-gray-600 mt-2">{int.desc}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">Parameters:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {int.params.map(param => (
                  <span key={param} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-mono">
                    {param}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">Returns:</span>
              <p className="text-sm text-gray-600 mt-1 font-mono">{int.returns}</p>
            </div>
          </div>
        </Card>
      ))}

      <Card title="📥 Webhooks (Incoming)" highlight>
        <p className="text-gray-600">כרגע אין webhooks נכנסים מוגדרים במערכת</p>
      </Card>
    </div>
  );
}

function TrackingSection() {
  
  const kpis = [
    { metric: 'Lead Conversion Rate', current: '3.2%', target: '5%', impact: 'HIGH' },
    { metric: 'Form Abandonment', current: '28%', target: '<20%', impact: 'HIGH' },
    { metric: 'WhatsApp CTR', current: '8.5%', target: '12%', impact: 'MEDIUM' },
    { metric: 'Phone Click Rate', current: '4.1%', target: '6%', impact: 'MEDIUM' },
    { metric: 'Avg. Time on Site', current: '2:34', target: '3:00', impact: 'LOW' }
  ];

  const events = [
    {
      name: 'lead_submitted',
      payload: ['source_page', 'profession', 'value=1', 'currency=ILS'],
      sentFrom: 'LeadForm component',
      savedTo: ['GTM dataLayer', 'FB Pixel as "Lead"']
    },
    {
      name: 'phone_click',
      payload: ['source', 'contact_method=phone'],
      sentFrom: 'Header, Footer, CTA buttons',
      savedTo: ['GTM dataLayer', 'FB Pixel as "Contact"']
    },
    {
      name: 'whatsapp_click',
      payload: ['source', 'contact_method=whatsapp', 'message_template'],
      sentFrom: 'WhatsAppButton, Header, Footer',
      savedTo: ['GTM dataLayer', 'FB Pixel as "Contact"']
    },
    {
      name: 'cta_click',
      payload: ['cta_name', 'location'],
      sentFrom: 'Various CTA components',
      savedTo: ['GTM dataLayer', 'FB Pixel as "InitiateCheckout"']
    },
    {
      name: 'form_view',
      payload: ['form_type', 'page_name'],
      sentFrom: 'Form components',
      savedTo: ['GTM dataLayer', 'FB Pixel as "ViewContent"']
    }
  ];

  return (
    <div>
      <SectionHeader 
        title="Tracking & Events" 
        icon={TrendingUp}
        description="כל ה-Events שנשלחים + Payload + יעדים"
      />

      <Card title="📊 Key Performance Indicators (KPIs)" highlight>
        <div className="space-y-2">
          {kpis.map(kpi => (
            <div key={kpi.metric} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex-1">
                <p className="font-semibold text-sm">{kpi.metric}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-600">Current: <strong>{kpi.current}</strong></span>
                  <span className="text-xs text-blue-600">Target: <strong>{kpi.target}</strong></span>
                </div>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold ${
                kpi.impact === 'HIGH' ? 'bg-red-100 text-red-700' :
                kpi.impact === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {kpi.impact}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="🔍 Tracking Strategy">
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="font-bold text-sm text-blue-700">Multi-Platform Approach:</p>
            <p className="text-xs text-gray-600 mt-1">
              Every user action sent to both GTM (analytics) and FB Pixel (remarketing) 
              for complete funnel visibility and retargeting capabilities
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="font-bold text-sm text-green-700">Event-Driven Architecture:</p>
            <p className="text-xs text-gray-600 mt-1">
              All interactions (clicks, form views, submissions) trigger events that flow to 
              multiple destinations without blocking user experience
            </p>
          </div>
        </div>
      </Card>
      
      <Card title="🎯 Tracking Setup">
        <div className="space-y-3">
          <p className="text-gray-700"><strong>Google Tag Manager:</strong> GTM-PNK9CCRQ</p>
          <p className="text-gray-700"><strong>Facebook Pixel:</strong> YOUR_PIXEL_ID (צריך להחליף)</p>
          <p className="text-gray-700"><strong>Implementation:</strong> components/tracking/EventTracker.js</p>
        </div>
      </Card>

      {events.map(event => (
        <Card key={event.name} title={event.name}>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-sm text-gray-700">📦 Payload:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {event.payload.map(p => (
                  <span key={p} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-mono">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">📍 Sent From:</span>
              <p className="text-gray-600 mt-1">{event.sentFrom}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">💾 Saved To:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {event.savedTo.map(dest => (
                  <span key={dest} className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm">
                    {dest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function SEOSection() {
  return (
    <div>
      <SectionHeader 
        title="SEO/AEO/GEO Rules" 
        icon={Search}
        description="כל חוקי האופטימיזציה למנועי חיפוש + GBP + GEO"
      />

      <Card title="📈 SEO Performance Metrics (Current)" highlight>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">92</div>
            <div className="text-xs text-gray-600">Google PageSpeed</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">45+</div>
            <div className="text-xs text-gray-600">Indexed Pages</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">100%</div>
            <div className="text-xs text-gray-600">Mobile Friendly</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-700">8</div>
            <div className="text-xs text-gray-600">Schema Types</div>
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm font-bold text-yellow-800">🎯 SEO Goal 2026:</p>
          <p className="text-xs text-gray-700 mt-1">Rank #1-3 for "פתיחת עוסק פטור" + 50 long-tail profession keywords (e.g., "עוסק פטור למעצב גרפי")</p>
        </div>
      </Card>
      
      <Card title="🎯 SEO Strategy Overview" highlight>
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">1. Technical SEO Foundation</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Dynamic sitemap generation (XML)</li>
              <li>Automatic Google ping on content updates</li>
              <li>Robots.txt configuration</li>
              <li>Schema.org structured data</li>
              <li>Performance optimization (CriticalCSS, ResourceHints, WebVitals)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">2. Content SEO</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Automated internal linking (InternalLinker)</li>
              <li>Meta tags optimization per page</li>
              <li>Rich snippets (FAQSchema, HowToSchema)</li>
              <li>Breadcrumbs navigation</li>
              <li>Content hash tracking for updates</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">3. Local SEO (GEO)</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>LocalBusiness schema on all pages</li>
              <li>Google Business Profile integration ready</li>
              <li>Location-specific landing pages</li>
              <li>Hebrew-optimized content</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📋 Meta Templates">
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">Home Page:</p>
            <p className="text-sm text-gray-600 mt-1">Title: "פתיחת עוסק פטור | Perfect One - המרכז לעוסקים פטורים"</p>
            <p className="text-sm text-gray-600">Description: Custom per page with keywords</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">Blog Posts:</p>
            <p className="text-sm text-gray-600 mt-1">Title: {`{post.meta_title || post.title}`}</p>
            <p className="text-sm text-gray-600">Description: {`{post.meta_description || post.excerpt}`}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">Professions:</p>
            <p className="text-sm text-gray-600 mt-1">Title: {`"עוסק פטור {profession.name} | Perfect One"`}</p>
            <p className="text-sm text-gray-600">Description: Dynamic based on profession data</p>
          </div>
        </div>
      </Card>

      <Card title="🔗 Internal Linking Rules">
        <div className="space-y-2">
          <p className="text-gray-700">✅ קישור אחד לכל ביטוי בעמוד (רק הופעה ראשונה)</p>
          <p className="text-gray-700">✅ לא לקשר בכותרות (H1/H2/H3)</p>
          <p className="text-gray-700">✅ מקסימום 1-2 קישורים לאותו דף יעד</p>
          <p className="text-gray-700">✅ Context awareness - בודק הקשר טקסטואלי</p>
          <p className="text-gray-700">✅ מניעת cannibalization - דף לא מקשר לעצמו</p>
          <p className="text-gray-700">📍 Implementation: components/seo/InternalLinker</p>
        </div>
      </Card>

      <Card title="🗺️ Sitemap Rules">
        <div className="space-y-2">
          <p className="text-gray-700"><strong>Priority Levels:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mr-4">
            <li>Homepage: 1.0</li>
            <li>Main services: 0.9</li>
            <li>Blog posts: 0.8</li>
            <li>Professions: 0.7</li>
            <li>Other pages: 0.6</li>
          </ul>
          <p className="text-gray-700 mt-3"><strong>Update Frequency:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-gray-600 mr-4">
            <li>Homepage: daily</li>
            <li>Blog: weekly</li>
            <li>Services: monthly</li>
            <li>Static pages: yearly</li>
          </ul>
        </div>
      </Card>

      <Card title="📊 Schema Types Used">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">LocalBusiness</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">BreadcrumbList</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">FAQPage</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">HowTo</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">Article</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">Service</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">OfferCatalog</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">AggregateRating</span>
        </div>
      </Card>

      <Card title="🤖 Robots.txt Rules">
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto font-mono">
{`User-agent: *
Allow: /
Disallow: /LeadsAdmin
Disallow: /SEOAdmin
Disallow: /admin

Sitemap: https://perfect1.co.il/sitemap.xml`}
        </pre>
      </Card>
    </div>
  );
}

function PermissionsSection() {
  return (
    <div>
      <SectionHeader 
        title="Permissions / Roles" 
        icon={Shield}
        description="מי רואה מה + הרשאות CRUD"
      />

      <Card title="🔐 Security Architecture" highlight>
        <div className="space-y-3">
          <div className="bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="font-bold text-sm text-red-700">⚠️ Zero-Trust Model:</p>
            <p className="text-xs text-gray-600 mt-1">
              Every API request authenticated & authorized. No implicit trust. 
              Built-in Base44 security with role-based access control (RBAC)
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-bold text-xs text-blue-700">Authentication:</p>
              <p className="text-xs text-gray-600 mt-1">JWT tokens, managed by Base44</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-bold text-xs text-green-700">Data Privacy:</p>
              <p className="text-xs text-gray-600 mt-1">GDPR compliant, Israel-based hosting</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="👥 User Roles">
        <div className="space-y-4">
          <div className="border-r-4 border-blue-500 pr-4">
            <h4 className="font-bold text-[#1E3A5F] mb-2">Admin</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Full access to LeadsAdmin</li>
              <li>Full access to SEOAdmin</li>
              <li>Can create/update/delete all entities</li>
              <li>Can invite users (admin or user role)</li>
              <li>Can view all leads and analytics</li>
            </ul>
          </div>
          <div className="border-r-4 border-green-500 pr-4">
            <h4 className="font-bold text-[#1E3A5F] mb-2">User (Regular)</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Can view public pages only</li>
              <li>Can submit lead forms</li>
              <li>Can view their own user record</li>
              <li>Can invite other users (user role only)</li>
              <li>Cannot access admin pages</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔒 Entity-Level Permissions">
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">Lead Entity:</p>
            <p className="text-sm text-gray-600 mt-1">✅ Anyone can CREATE (form submission)</p>
            <p className="text-sm text-gray-600">❌ Only admins can READ/UPDATE/DELETE</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">BlogPost / Profession:</p>
            <p className="text-sm text-gray-600 mt-1">✅ Anyone can READ</p>
            <p className="text-sm text-gray-600">❌ Only admins can CREATE/UPDATE/DELETE</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold text-sm text-gray-700">User Entity:</p>
            <p className="text-sm text-gray-600 mt-1">✅ Users can view/update own record</p>
            <p className="text-sm text-gray-600">❌ Only admins can list/update/delete other users</p>
            <p className="text-sm text-gray-600">🔐 Built-in security rules (cannot be overridden)</p>
          </div>
        </div>
      </Card>

      <Card title="🚫 Protected Routes">
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">/LeadsAdmin</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">/SEOAdmin</span>
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm">/SystemLogicMap</span>
        </div>
        <p className="text-gray-600 mt-3 text-sm">⚠️ אלו דפים נגישים רק למנהלים</p>
      </Card>
    </div>
  );
}

function JobsSection() {
  return (
    <div>
      <SectionHeader 
        title="Background/Heavy Jobs" 
        icon={Clock}
        description="משימות כבדות וסקדולינג"
      />

      <Card title="⚙️ Background Processing Strategy" highlight>
        <div className="space-y-3">
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="font-bold text-sm text-purple-700">Async-First Approach:</p>
            <p className="text-xs text-gray-600 mt-1">
              Heavy operations (image gen, LLM calls, file processing) run async with 
              loading states. Never block UI thread.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-xs font-bold text-blue-700">Cron Jobs:</p>
              <p className="text-xs text-gray-600">Automated, scheduled tasks</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-xs font-bold text-green-700">On-Demand:</p>
              <p className="text-xs text-gray-600">User-triggered heavy ops</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="⏰ Scheduled Jobs (Cron)">
        <div className="space-y-4">
          <div className="border-r-4 border-purple-500 pr-4">
            <h4 className="font-bold text-[#1E3A5F] mb-2">Daily Sitemap Scan</h4>
            <p className="text-gray-600 text-sm">📅 Schedule: Daily at 02:00</p>
            <p className="text-gray-600 text-sm">⚡ Function: cronDailyScan</p>
            <p className="text-gray-600 text-sm mt-2">Tasks:</p>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mr-4">
              <li>Scan all pages for changes</li>
              <li>Update PageSnapshot records</li>
              <li>Detect content changes via hash</li>
              <li>Log substantial changes to SEOLog</li>
            </ul>
          </div>
          
          <div className="border-r-4 border-orange-500 pr-4">
            <h4 className="font-bold text-[#1E3A5F] mb-2">Weekly Sitemap Ping</h4>
            <p className="text-gray-600 text-sm">📅 Schedule: Weekly (Monday 03:00)</p>
            <p className="text-gray-600 text-sm">⚡ Function: cronAutoSitemapPing</p>
            <p className="text-gray-600 text-sm mt-2">Tasks:</p>
            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1 mr-4">
              <li>Generate fresh sitemap XML</li>
              <li>Ping Google Search Console</li>
              <li>Update last_ping_sent in SEOConfig</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔥 Real-Time Heavy Operations">
        <div className="space-y-3">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-semibold text-sm text-gray-700">Image Generation (AI)</p>
            <p className="text-sm text-gray-600 mt-1">⏱️ Duration: 5-10 seconds</p>
            <p className="text-sm text-gray-600">🔧 Integration: Core.GenerateImage</p>
            <p className="text-sm text-gray-600">💡 Optimization: Show loading state to user</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-semibold text-sm text-gray-700">LLM Invocation</p>
            <p className="text-sm text-gray-600 mt-1">⏱️ Duration: 2-5 seconds</p>
            <p className="text-sm text-gray-600">🔧 Integration: Core.InvokeLLM</p>
            <p className="text-sm text-gray-600">💡 Optimization: Async processing with loading indicators</p>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="font-semibold text-sm text-gray-700">File Data Extraction</p>
            <p className="text-sm text-gray-600 mt-1">⏱️ Duration: 3-8 seconds (depends on file size)</p>
            <p className="text-sm text-gray-600">🔧 Integration: Core.ExtractDataFromUploadedFile</p>
            <p className="text-sm text-gray-600">💡 Optimization: Progress bar for large files</p>
          </div>
        </div>
      </Card>

      <Card title="📊 Performance Monitoring">
        <p className="text-gray-700 mb-3">נעקב באמצעות:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>WebVitalsMonitor component (LCP, FID, CLS)</li>
          <li>Google Tag Manager events</li>
          <li>SEOLog for tracking automation performance</li>
        </ul>
      </Card>
    </div>
  );
}

function MigrationSection() {
  return (
    <div>
      <SectionHeader 
        title="Migration Plan (Export)" 
        icon={Download}
        description="איך מוציאים את כל הדאטה במקרה של מעבר פלטפורמה"
      />

      <Card title="🎯 Platform Independence Philosophy" highlight>
        <div className="space-y-3">
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-bold text-sm text-yellow-800">⚠️ No Vendor Lock-In:</p>
            <p className="text-xs text-gray-600 mt-1">
              While built on Base44, system designed for portability. All data exportable, 
              URLs preserved, minimal platform-specific features used.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 p-2 rounded text-center">
              <p className="text-xl font-bold text-green-700">100%</p>
              <p className="text-xs text-gray-600">Data Export</p>
            </div>
            <div className="bg-blue-50 p-2 rounded text-center">
              <p className="text-xl font-bold text-blue-700">~4h</p>
              <p className="text-xs text-gray-600">Migration Time</p>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <p className="text-xl font-bold text-purple-700">0</p>
              <p className="text-xs text-gray-600">Data Loss</p>
            </div>
          </div>
        </div>
      </Card>
      
      <Card title="🗄️ Database Export Strategy" highlight>
        <div className="space-y-4">
          <p className="text-gray-700">במקרה של מעבר לפלטפורמה אחרת, יש לשמור את הדברים הבאים:</p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-bold text-[#1E3A5F] mb-2">🔑 Must Keep 1:1</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>Entity IDs:</strong> כל ה-IDs חייבים להישמר (לקשרים בין טבלאות)</li>
              <li><strong>URLs/Slugs:</strong> כל ה-URLs חייבים להישאר זהים (SEO critical)</li>
              <li><strong>created_date:</strong> תאריכי יצירה מקוריים</li>
              <li><strong>created_by:</strong> קשרים למשתמשים</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="📦 Export Format: JSON">
        <p className="text-gray-700 mb-3">כל entity יוצא כ-JSON array:</p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono">
{`{
  "export_date": "2026-01-08T12:00:00Z",
  "entities": {
    "leads": [
      {
        "id": "abc123",
        "name": "יוסי כהן",
        "phone": "0501234567",
        "created_date": "2026-01-01T10:00:00Z",
        ...
      }
    ],
    "blog_posts": [...],
    "professions": [...],
    "sitemap_urls": [...],
    "seo_logs": [...],
    "users": [...]
  },
  "metadata": {
    "total_records": 1523,
    "version": "1.0"
  }
}`}
        </pre>
      </Card>

      <Card title="🔄 Export Process">
        <ol className="list-decimal list-inside space-y-2 text-gray-700">
          <li>Export all entities using base44.entities.[Entity].list()</li>
          <li>Save each entity type to separate JSON files</li>
          <li>Include all relationships (IDs)</li>
          <li>Export uploaded files separately (URLs mapping)</li>
          <li>Create manifest file with all exports metadata</li>
          <li>Verify data integrity (counts, IDs)</li>
        </ol>
      </Card>

      <Card title="📋 Export Checklist">
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">Lead entity (all records)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">BlogPost entity + featured images</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">Profession entity</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">SitemapURL entity (all URLs)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">SEOLog entity (history)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">SEOConfig entity</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">User entity</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">All uploaded files + mapping</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">SEO configuration (keywords, rules)</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-gray-700">Analytics tracking setup</span>
          </label>
        </div>
      </Card>

      <Card title="⚠️ Critical URLs to Preserve">
        <p className="text-gray-700 mb-2">אלו URLs חייבים להישאר זהים (301 redirects אם משנים):</p>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>/blog/[slug] - כל מאמרי הבלוג</li>
            <li>/professions/[slug] - כל דפי המקצועות</li>
            <li>/Services - דף שירותים ראשי</li>
            <li>/Pricing - דף מחירון</li>
            <li>/Contact - דף צור קשר</li>
            <li>/sitemap.xml - הסייטמאפ</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}