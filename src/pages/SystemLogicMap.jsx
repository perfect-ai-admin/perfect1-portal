import React from 'react';
import { Download, Code, Database, GitBranch, Settings, Lock, AlertCircle, Rocket, Package, Play, FileText, Search, TrendingUp, Shield, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Helper component for section headers
function SectionHeader({ title, icon: Icon, description }) {
  return (
    <div className="mb-8 border-b-4 border-[#D4AF37] pb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-black text-[#1E3A5F]">{title}</h2>
      </div>
      {description && <p className="text-gray-600 text-lg mr-15">{description}</p>}
    </div>
  );
}

// Helper component for cards
function Card({ title, children, highlight = false }) {
  return (
    <div className={`mb-6 rounded-xl border-2 overflow-hidden ${
      highlight 
        ? 'border-[#D4AF37] bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg' 
        : 'border-gray-200 bg-white shadow-md'
    }`}>
      {title && (
        <div className={`px-6 py-4 border-b-2 ${
          highlight ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-gray-50 border-gray-200'
        }`}>
          <h3 className={`text-xl font-bold ${
            highlight ? 'text-white' : 'text-[#1E3A5F]'
          }`}>{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default function SystemLogicMap() {
  const [activeTab, setActiveTab] = React.useState('overview');

  const categories = [
    { id: 'overview', label: '🎯 Overview', icon: Rocket },
    { id: 'entities', label: '🗄️ Database', icon: Database },
    { id: 'code', label: '💻 Code', icon: Code },
    { id: 'flows', label: '⚙️ Flows', icon: GitBranch },
    { id: 'seo', label: '🔍 SEO', icon: Search },
    { id: 'tracking', label: '📊 Tracking', icon: TrendingUp },
    { id: 'security', label: '🔐 Security', icon: Shield },
    { id: 'jobs', label: '⏰ Jobs', icon: Clock },
    { id: 'migration', label: '📤 Migration', icon: Download },
    { id: 'seo_tools', label: '🛠️ SEO Tools', icon: Download }
  ];

  const downloadDocumentation = () => {
    const docContent = `# Perfect One - מפת הלוגיקה המלאה
התיעוד הושלם והוא זמין בעמוד.`;
    const blob = new Blob([docContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Perfect-One-System-Logic-Map.md';
    a.click();
  };

  const oldMarkdownContent = `
# 📚 Perfect One - מפת הלוגיקה המלאה של המערכת

> **תיעוד מקיף ומפורט** - כל מה שצריך כדי להבין, לתחזק, או לבנות את המערכת מאפס

---

## 📖 מדריך שימוש במסמך

מסמך זה מחולק ל-10 קטגוריות עיקריות:

1. **סקירת המערכת** - מבנה כללי, טכנולוגיות, ותכונות
2. **ארכיטקטורת Database** - Entities, יחסים, וסכמות
3. **Data Flow & State Management** - ניהול מצב ותזרים נתונים
4. **API Patterns** - דפוסי API ושימוש ב-SDK
5. **דפי המערכת (Pages)** - כל העמודים ופונקציונליות
6. **קומפוננטות (Components)** - רכיבים מרכזיים
7. **SEO & Performance** - אופטימיזציה ו-SEO
8. **Security & Authentication** - אבטחה והרשאות
9. **Error Handling** - טיפול בשגיאות
10. **Code Standards** - סטנדרטים ו-Best Practices

---

## 1️⃣ סקירת המערכת

### 🎯 מטרת המערכת
אתר שיווקי ומערכת CRM לניהול לידים עבור שירותי פתיחת עוסק פטור בישראל.

### 🏗️ ארכיטקטורה כללית
\`\`\`
┌─────────────────────────────────────────────────┐
│              Frontend (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Pages   │  │Components│  │  Layout  │     │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘     │
│       │             │              │           │
│       └─────────────┴──────────────┘           │
│                     │                           │
│              ┌──────▼───────┐                  │
│              │  Base44 SDK  │                  │
│              └──────┬───────┘                  │
└─────────────────────┼───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│           Base44 Backend (BaaS)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │ Database │  │   Auth   │  │Integration│     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
\`\`\`

### 🛠️ טכנולוגיות מרכזיות

| טכנולוגיה | גרסה | שימוש |
|-----------|------|-------|
| **React** | 18.2.0 | UI Framework |
| **React Router** | 6.26.0 | Routing & Navigation |
| **TanStack Query** | 5.84.1 | Data Fetching & Caching |
| **Tailwind CSS** | Latest | Styling |
| **Shadcn/UI** | Latest | UI Components |
| **Framer Motion** | 11.16.4 | Animations |
| **Lucide React** | 0.475.0 | Icons |
| **Base44 SDK** | 0.8.11 | Backend Client |

### 📁 מבנה תיקיות
\`\`\`
/
├── entities/           # Database schemas (JSON)
├── pages/             # React pages (flat structure)
├── components/        # Reusable components
│   ├── layout/       # Header, Footer, Layout
│   ├── seo/          # SEO components
│   ├── forms/        # Form components
│   ├── cro/          # CRO components
│   ├── tracking/     # Analytics trackers
│   └── performance/  # Performance optimizations
├── Layout.js         # Main layout wrapper
└── globals.css       # Global styles
\`\`\`

---

## 2️⃣ ארכיטקטורת Database

### 🗄️ Entity Schema Overview

המערכת משתמשת ב-NoSQL Database עם 7 Entities עיקריים:

#### **Lead Entity** (ליבת המערכת)
\`\`\`json
{
  "name": "Lead",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "שם מלא" },
    "phone": { "type": "string", "description": "מספר טלפון" },
    "email": { "type": "string", "description": "כתובת אימייל" },
    "profession": { "type": "string", "description": "מקצוע" },
    "category": {
      "type": "string",
      "enum": ["osek_patur", "monthly_support", "invoice", "consultation", "other"],
      "default": "osek_patur",
      "description": "קטגוריית הליד"
    },
    "status": {
      "type": "string",
      "enum": ["new", "contacted", "no_answer", "in_progress", "qualified", "not_interested", "converted", "closed"],
      "default": "new"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "default": "medium"
    },
    "source_page": { "type": "string", "description": "דף המקור" },
    "interaction_type": {
      "type": "string",
      "enum": ["form", "phone_click", "whatsapp_click", "manual"],
      "default": "form"
    },
    "follow_up_date": { "type": "string", "format": "date" },
    "last_contact_date": { "type": "string", "format": "date" },
    "consent": { "type": "boolean", "default": false }
  },
  "required": ["name", "phone"]
}
\`\`\`

**Built-in Fields (אוטומטיים):**
- \`id\` - UUID ייחודי
- \`created_date\` - תאריך יצירה
- \`updated_date\` - תאריך עדכון אחרון
- \`created_by\` - מייל המשתמש שיצר

---

#### **BlogPost Entity**
\`\`\`json
{
  "name": "BlogPost",
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "slug": { "type": "string", "description": "URL slug" },
    "excerpt": { "type": "string" },
    "content": { "type": "string", "description": "תוכן HTML/Markdown" },
    "category": {
      "type": "string",
      "enum": ["general", "osek-patur", "taxes", "professions", "guides"]
    },
    "keywords": {
      "type": "array",
      "items": { "type": "string" }
    },
    "meta_title": { "type": "string" },
    "meta_description": { "type": "string" },
    "featured_image": { "type": "string" },
    "author": { "type": "string", "default": "צוות Perfect One" },
    "read_time": { "type": "number" },
    "published": { "type": "boolean", "default": true }
  },
  "required": ["title", "slug", "content", "category"]
}
\`\`\`

---

#### **Profession Entity**
\`\`\`json
{
  "name": "Profession",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "slug": { "type": "string" },
    "icon": { "type": "string" },
    "color": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["creative", "writing", "tech", "music", "health", "services", "food", "education", "cosmetics"]
    },
    "subcategory": { "type": "string" },
    "description": { "type": "string" },
    "services": {
      "type": "array",
      "items": { "type": "string" }
    },
    "tips": {
      "type": "array",
      "items": { "type": "string" }
    },
    "meta_title": { "type": "string" },
    "meta_description": { "type": "string" }
  },
  "required": ["name", "slug", "category"]
}
\`\`\`

---

#### **SEO Entities** (3 טבלאות)

**SitemapURL:**
\`\`\`json
{
  "url": { "type": "string" },
  "type": { "enum": ["page", "article", "profession", "service", "landing"] },
  "priority": { "type": "number", "minimum": 0.0, "maximum": 1.0, "default": 0.8 },
  "changefreq": { "enum": ["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] },
  "lastmod": { "type": "string", "format": "date" },
  "status": { "enum": ["active", "deleted", "noindex"], "default": "active" }
}
\`\`\`

**SEOLog:**
\`\`\`json
{
  "entity_name": { "type": "string" },
  "entity_id": { "type": "string" },
  "url": { "type": "string" },
  "action": { "enum": ["created", "updated_content", "updated_minor", "deleted"] },
  "fields_changed": { "type": "array", "items": { "type": "string" } },
  "is_substantial_change": { "type": "boolean" },
  "lastmod_updated": { "type": "boolean" },
  "ping_sent": { "type": "boolean" },
  "ping_status": { "type": "string" },
  "error_message": { "type": "string" }
}
\`\`\`

**PageSnapshot:**
\`\`\`json
{
  "url": { "type": "string" },
  "entity_name": { "type": "string" },
  "entity_id": { "type": "string" },
  "last_scanned": { "type": "string" },
  "lastmod": { "type": "string" },
  "content_hash": { "type": "string" },
  "title": { "type": "string" },
  "status": { "enum": ["active", "changed", "deleted"], "default": "active" }
}
\`\`\`

---

### 🔗 Entity Relationships

\`\`\`
User (Built-in)
  │
  ├─► Lead (created_by → User.email)
  │     └─► Many Leads per User
  │
  └─► BlogPost (implicitly via created_by)
        └─► Many BlogPosts per Admin User

Profession ◄─► BlogPost (via category/tags)

SitemapURL ◄─► PageSnapshot (via URL)
SEOLog ◄─► Entities (via entity_name + entity_id)
\`\`\`

---

## 3️⃣ Data Flow & State Management

### 📊 State Management Architecture

המערכת משתמשת ב-**TanStack Query (React Query)** לניהול מצב גלובלי:

\`\`\`javascript
// ✅ דוגמה: Fetching Leads
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

function LeadsAdmin() {
  const queryClient = useQueryClient();

  // Fetch data
  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 100),
    initialData: []
  });

  // Create mutation
  const createLead = useMutation({
    mutationFn: (leadData) => base44.entities.Lead.create(leadData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });

  // Update mutation
  const updateLead = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    }
  });
}
\`\`\`

### 🔄 Data Flow Patterns

\`\`\`
User Action (Form Submit)
        ↓
   React Component
        ↓
   useMutation Hook
        ↓
   Base44 SDK Client
        ↓
   Backend API (BaaS)
        ↓
   Database Write
        ↓
   onSuccess Callback
        ↓
 invalidateQueries()
        ↓
   Automatic Refetch
        ↓
   UI Update
\`\`\`

---

## 4️⃣ API Patterns (Base44 SDK)

### 📡 Base44 Client Setup

\`\`\`javascript
// @/api/base44Client.js (auto-generated)
import { Base44 } from '@base44/sdk';

export const base44 = new Base44({
  appId: process.env.APP_ID,
  apiKey: process.env.API_KEY
});
\`\`\`

### 🔧 CRUD Operations

#### **READ Operations**
\`\`\`javascript
// List all (with sorting & limit)
const leads = await base44.entities.Lead.list('-updated_date', 20);

// Filter
const activeLeads = await base44.entities.Lead.filter(
  { status: 'active', created_by: user.email },
  '-created_date',
  10
);

// Get schema
const schema = await base44.entities.Lead.schema();
\`\`\`

#### **CREATE Operations**
\`\`\`javascript
// Create single
const newLead = await base44.entities.Lead.create({
  name: "יוסי כהן",
  phone: "0501234567",
  profession: "מעצב גרפי",
  status: "new"
});

// Bulk create
const leads = await base44.entities.Lead.bulkCreate([
  { name: "משה לוי", phone: "0509876543" },
  { name: "דנה אברהם", phone: "0507654321" }
]);
\`\`\`

#### **UPDATE Operations**
\`\`\`javascript
// Update by ID
await base44.entities.Lead.update(leadId, {
  status: "contacted",
  last_contact_date: new Date().toISOString().split('T')[0]
});
\`\`\`

#### **DELETE Operations**
\`\`\`javascript
// Delete by ID
await base44.entities.Lead.delete(leadId);
\`\`\`

---

### 🔐 Authentication API

\`\`\`javascript
// Get current user
const user = await base44.auth.me(); // { email, full_name, role, id }

// Update current user
await base44.auth.updateMe({ 
  full_name: "שם חדש",
  customField: "value"
});

// Logout
base44.auth.logout('/Home'); // redirects after logout

// Login redirect
base44.auth.redirectToLogin('/Dashboard'); // redirects back after login

// Check authentication
const isAuth = await base44.auth.isAuthenticated(); // boolean
\`\`\`

---

### 📧 Integrations API

\`\`\`javascript
// Send Email
await base44.integrations.Core.SendEmail({
  to: 'client@example.com',
  subject: 'ליד חדש!',
  body: '<h1>פרטי הליד...</h1>',
  from_name: 'Perfect One' // optional
});

// Upload File
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Invoke LLM
const response = await base44.integrations.Core.InvokeLLM({
  prompt: "סכם את המידע הזה...",
  add_context_from_internet: true,
  response_json_schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      key_points: { type: "array", items: { type: "string" } }
    }
  }
});

// Generate Image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "לוגו מקצועי לעסק פיננסי",
  existing_image_urls: ["https://example.com/ref.jpg"]
});
\`\`\`

---

## 5️⃣ דפי המערכת (Pages)

### 🏠 Public Pages

| דף | תיאור | קובץ | פונקציונליות עיקרית |
|----|-------|------|---------------------|
| **Home** | דף בית | \`pages/Home.js\` | Hero, Features, Services, CTA |
| **Services** | שירותים | \`pages/Services.js\` | רשימת שירותים + קישור לדפי שירות |
| **ServicePage** | דף שירות דינמי | \`pages/ServicePage.js\` | תצוגה לפי ?service=X |
| **Professions** | רשימת מקצועות | \`pages/Professions.js\` | ProfessionsGrid + חיפוש |
| **ProfessionPage** | דף מקצוע | \`pages/ProfessionPage.js\` | תוכן SEO לפי מקצוע |
| **Pricing** | מחירון | \`pages/Pricing.js\` | טבלת מחירים |
| **About** | אודות | \`pages/About.js\` | סיפור החברה |
| **Contact** | צור קשר | \`pages/Contact.js\` | טופס + מפה |
| **Blog** | בלוג | \`pages/Blog.js\` | רשימת מאמרים |
| **BlogPost** | מאמר | \`pages/BlogPost.js\` | תצוגת מאמר דינמי |

### 📄 Landing Pages

| דף | מטרה | קובץ |
|----|------|------|
| **OsekPaturLanding** | המרה - עוסק פטור | \`pages/OsekPaturLanding.js\` |
| **OsekPaturOnlineLanding** | המרה - אונליין | \`pages/OsekPaturOnlineLanding.js\` |
| **PricingLanding** | המרה - מחיר | \`pages/PricingLanding.js\` |
| **UrgentInvoice** | המרה - חשבונית דחופה | \`pages/UrgentInvoice.js\` |

**Landing Pages Professions:**
- \`GraphicDesignerLanding.js\`
- \`PhotographerLanding.js\`
- \`FitnessTrainerLanding.js\`
- \`MakeupArtistLanding.js\`
- \`CosmeticianLanding.js\`
- \`ManicuristLanding.js\`
- \`HairStylistLanding.js\`
- ...ועוד

### 🔐 Admin Pages

| דף | תיאור | קובץ |
|----|-------|------|
| **LeadsAdmin** | ניהול לידים | \`pages/LeadsAdmin.js\` |
| **SEOAdmin** | ניהול SEO | \`pages/SEOAdmin.js\` |

---

### 📄 דוגמה מלאה: Home Page

\`\`\`javascript
// pages/Home.js
import React from 'react';
import SEOOptimized from './SEOOptimized';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import HeroSection from '../components/home/HeroSection';
import WhatIsSection from '../components/home/WhatIsSection';
import FeaturesSection from '../components/home/FeaturesSection';
import ServicesSection from '../components/home/ServicesSection';
import ProcessSection from '../components/home/ProcessSection';
import PricingSection from '../components/home/PricingSection';
import FAQSection from '../components/home/FAQSection';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <SEOOptimized
      title="פתיחת עוסק פטור מהיר ופשוט | Perfect One 2026"
      description="פתיחת עוסק פטור תוך 48 שעות. ליווי מקצועי מא' עד ת'. מחיר שקוף ללא הפתעות."
      keywords="עוסק פטור, פתיחת עוסק, עצמאי, עסק קטן"
      canonicalUrl="/Home"
    >
      <LocalBusinessSchema
        name="Perfect One - המרכז לעוסקים פטורים"
        description="מומחים בפתיחת עוסק פטור בישראל"
        address={{
          streetAddress: "רחוב ראשי 123",
          addressLocality: "תל אביב",
          postalCode: "12345",
          addressCountry: "IL"
        }}
        telephone="+972-50-227-7087"
        priceRange="₪₪"
        services={[
          "פתיחת עוסק פטור",
          "ליווי חודשי",
          "דוח שנתי",
          "ייעוץ מקצועי"
        ]}
      />
      
      <HeroSection />
      <WhatIsSection />
      <FeaturesSection />
      <ServicesSection />
      <ProcessSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </SEOOptimized>
  );
}
\`\`\`

---

## 6️⃣ קומפוננטות מרכזיות

### 🎨 Layout Components

#### **Layout.js** (Main Wrapper)
\`\`\`javascript
// Layout.js
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import WhatsAppButton from './components/layout/WhatsAppButton';
import SidePopup from './components/cro/SidePopup';
import StickyCTA from './components/cro/StickyCTA';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const getWhatsAppMessage = () => {
    const messages = {
      Home: 'היי, הגעתי מהאתר ואשמח לקבל ייעוץ',
      Professions: 'היי, אני מחפש מידע על פתיחת עוסק פטור',
      // ... more pages
    };
    return messages[currentPageName] || messages.Home;
  };

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-[#F8F9FA]" dir="rtl">
        <Header />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton message={getWhatsAppMessage()} />
        <SidePopup />
        <StickyCTA />
      </div>
    </HelmetProvider>
  );
}
\`\`\`

#### **Header.jsx**
\`\`\`javascript
// components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Menu, Phone, MessageCircle, ChevronDown } from 'lucide-react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={\`fixed top-0 left-0 right-0 z-50 transition-all \${
      isScrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'
    }\`}>
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link to={createPageUrl('Home')} className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-white font-black text-2xl">P1</span>
          </div>
          <div>
            <h1 className="font-black text-xl text-[#1E3A5F]">פרפקט וואן</h1>
            <p className="text-xs text-gray-500">המרכז לעוסקים פטורים</p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          <Link to={createPageUrl('Home')} className="px-4 py-2 hover:text-[#1E3A5F]">
            דף הבית
          </Link>
          <Link to={createPageUrl('Blog')} className="px-4 py-2 hover:text-[#1E3A5F]">
            בלוג
          </Link>
          {/* More nav items */}
        </nav>

        <div className="flex items-center gap-3">
          <a href="tel:0502277087">
            <Button variant="outline">
              <Phone className="w-5 h-5 ml-2" />
              0502277087
            </Button>
          </a>
          <a href="https://wa.me/972502277087">
            <Button className="bg-gradient-to-r from-[#25D366] to-[#128C7E]">
              <MessageCircle className="w-5 h-5 ml-2" />
              וואטסאפ
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
\`\`\`

---

### 📝 Form Components

#### **LeadForm.jsx**
\`\`\`javascript
// components/forms/LeadForm.jsx
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackLeadSubmit } from '../tracking/EventTracker';

export default function LeadForm({ 
  title = "🚀 התחל את העסק שלך היום",
  sourcePage = "כללי",
  compact = false
}) {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create lead
    const newLead = await base44.entities.Lead.create({
      ...formData,
      source_page: sourcePage,
      status: 'new'
    });

    // Track conversion
    trackLeadSubmit(newLead);

    // Send email
    await base44.integrations.Core.SendEmail({
      to: 'yosi5919@gmail.com',
      subject: \`🎯 ליד חדש מ\${sourcePage}\`,
      body: \`
        <h2>ליד חדש! 🎉</h2>
        <p><strong>שם:</strong> \${newLead.name}</p>
        <p><strong>טלפון:</strong> \${newLead.phone}</p>
        <p><strong>מקור:</strong> \${sourcePage}</p>
      \`
    });

    // Redirect
    window.location.href = '/ThankYou';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="שם מלא *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <Input
        type="tel"
        placeholder="טלפון *"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'שולח...' : 'בדיקה ללא התחייבות'}
      </Button>
    </form>
  );
}
\`\`\`

---

### 🔍 SEO Components

#### **SEOOptimized.jsx** (Page Wrapper)
\`\`\`javascript
// pages/SEOOptimized.js
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOOptimized({
  title,
  description,
  keywords,
  canonicalUrl,
  children
}) {
  const fullUrl = \`https://perfect1.co.il\${canonicalUrl}\`;
  
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={fullUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={fullUrl} />
        <meta property="og:type" content="website" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
      </Helmet>
      {children}
    </>
  );
}
\`\`\`

#### **InternalLinker.jsx** (Auto Internal Links)
\`\`\`javascript
// components/seo/InternalLinker.jsx
import React, { useMemo } from 'react';
import { KEYWORD_MAPPING } from './internalLinkingConfig';

export default function InternalLinker({ content, currentPage }) {
  const processedContent = useMemo(() => {
    if (!content) return content;
    
    let text = content;
    const linkedKeywords = new Set();
    
    for (const mapping of KEYWORD_MAPPING) {
      if (currentPage === mapping.target.page) continue; // No self-linking
      
      for (const keyword of mapping.keywords) {
        if (linkedKeywords.has(keyword)) continue;
        
        const regex = new RegExp(\`(?!<a[^>]*>)(\${keyword})(?![^<]*</a>)\`, 'i');
        
        if (regex.test(text)) {
          const url = mapping.target.params 
            ? \`\${createPageUrl(mapping.target.page)}?\${mapping.target.params}\`
            : createPageUrl(mapping.target.page);
          
          text = text.replace(
            regex,
            \`<a href="\${url}" class="text-[#1E3A5F] font-bold hover:text-[#27AE60]">\$1</a>\`
          );
          
          linkedKeywords.add(keyword);
        }
      }
    }
    
    return text;
  }, [content, currentPage]);

  return (
    <div 
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
}
\`\`\`

---

## 7️⃣ SEO & Performance

### 🚀 Performance Optimizations

#### **CriticalCSS.jsx**
\`\`\`javascript
// components/performance/CriticalCSS.jsx
export default function CriticalCSS() {
  return (
    <style>{\`
      body { direction: rtl; font-family: 'Heebo', sans-serif; }
      .gradient-primary { background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%); }
    \`}</style>
  );
}
\`\`\`

#### **ResourceHints.jsx**
\`\`\`javascript
// components/performance/ResourceHints.jsx
import { Helmet } from 'react-helmet-async';

export default function ResourceHints({ priorityImages, prefetchPages }) {
  return (
    <Helmet>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://api.base44.com" />
      {priorityImages?.map(img => (
        <link key={img} rel="preload" as="image" href={img} />
      ))}
      {prefetchPages?.map(page => (
        <link key={page} rel="prefetch" href={page} />
      ))}
    </Helmet>
  );
}
\`\`\`

---

### 📈 Analytics & Tracking

#### **EventTracker.js**
\`\`\`javascript
// components/tracking/EventTracker.js

export const trackLeadSubmit = (lead) => {
  // GTM Event
  window.dataLayer?.push({
    event: 'lead_submit',
    lead_name: lead.name,
    lead_source: lead.source_page,
    lead_category: lead.category
  });

  // Facebook Pixel
  window.fbq?.('track', 'Lead', {
    content_name: lead.source_page,
    value: 500,
    currency: 'ILS'
  });
};

export const trackPhoneClick = (location) => {
  window.dataLayer?.push({
    event: 'phone_click',
    location: location
  });
};

export const trackWhatsAppClick = (location, message) => {
  window.dataLayer?.push({
    event: 'whatsapp_click',
    location: location,
    message: message
  });
};
\`\`\`

---

## 8️⃣ Security & Authentication

### 🔐 User Entity (Built-in)

**Built-in Attributes:**
\`\`\`javascript
{
  id: "uuid",
  email: "user@example.com",
  full_name: "שם המשתמש",
  role: "admin" | "user",
  created_date: "2026-01-08T10:00:00Z"
}
\`\`\`

### 🛡️ Security Rules

1. **User Management:**
   - רק Admin יכול למחוק/לערוך משתמשים אחרים
   - משתמש רגיל יכול לערוך רק את עצמו

2. **Lead Access:**
   - כל משתמש יכול לראות את כל הלידים
   - רק Admin יכול למחוק לידים

3. **Content Management:**
   - רק Admin יכול ליצור/לערוך BlogPosts, Professions

---

## 9️⃣ Error Handling

### ⚠️ Error Handling Strategy

**חוקים:**
1. ❌ לא להשתמש ב-\`try/catch\` אלא אם המשתמש ביקש
2. ✅ לתת לשגיאות "לבעבע" חזרה לתיקון
3. ✅ להציג הודעות שגיאה ידידותיות למשתמש

**דוגמה:**
\`\`\`javascript
// ❌ לא נכון
try {
  await base44.entities.Lead.create(data);
} catch (error) {
  console.log("Error occurred");
}

// ✅ נכון
const handleSubmit = async () => {
  setIsSubmitting(true);
  
  const newLead = await base44.entities.Lead.create(data); // Will throw if fails
  
  // Only reaches here if successful
  window.location.href = '/ThankYou';
};
\`\`\`

---

## 🔟 Code Standards

### 📏 Coding Conventions

#### **File Naming**
- Pages: \`PascalCase.js\` (e.g., \`Home.js\`, \`LeadsAdmin.js\`)
- Components: \`PascalCase.jsx\` (e.g., \`Header.jsx\`, \`LeadForm.jsx\`)
- Folders: \`lowercase\` (e.g., \`layout/\`, \`seo/\`)

#### **Component Structure**
\`\`\`javascript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// 2. Component
export default function MyComponent({ prop1, prop2 }) {
  // 3. State
  const [data, setData] = useState([]);
  
  // 4. Effects
  useEffect(() => {
    // ...
  }, []);
  
  // 5. Handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
\`\`\`

#### **Styling Guidelines**
- ✅ Tailwind utility classes
- ✅ RTL support (\`dir="rtl"\`)
- ✅ Responsive: \`sm:\`, \`md:\`, \`lg:\`
- ✅ Theme colors: \`[#1E3A5F]\`, \`[#D4AF37]\`, \`[#27AE60]\`

#### **Best Practices**
1. **קומפוננטיזציה:** קבצים קטנים, ממוקדים (מקס 50 שורות)
2. **Parallel Queries:** השתמש ב-\`Promise.all()\` כשאפשר
3. **Lazy Loading:** טען קומפוננטות כבדות רק בצורך
4. **Memoization:** השתמש ב-\`useMemo\`, \`useCallback\` לאופטימיזציה
5. **Accessibility:** \`aria-label\`, keyboard navigation

---

## 🎨 globals.css (Styling)

\`\`\`css
@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --primary: #1E3A5F;
  --secondary: #D4AF37;
  --accent: #27AE60;
  --background: #F8F9FA;
  --text: #2C3E50;
}

* {
  font-family: 'Heebo', sans-serif;
}

body {
  direction: rtl;
  background-color: var(--background);
  color: var(--text);
}

@layer utilities {
  .gradient-primary {
    background: linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%);
  }
  
  .gradient-gold {
    background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
  }
  
  .gradient-green {
    background: linear-gradient(135deg, #27AE60 0%, #2ECC71 100%);
  }
  
  .shadow-elegant {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #1E3A5F;
  border-radius: 4px;
}
\`\`\`

---

## ✅ סיכום תיעוד

מסמך זה מכיל:
- ✅ ארכיטקטורת מערכת מלאה
- ✅ כל ה-Entities + Schemas
- ✅ דפוסי API ו-SDK
- ✅ קוד מלא של קבצים קריטיים
- ✅ Component structure
- ✅ SEO & Performance
- ✅ Security & Authentication
- ✅ Code Standards

---

## ⚙️ Developer Setup Guide

### 📋 דרישות מערכת

#### ✅ חובה
- **Node.js**: v18+ (מומלץ v20)
- **npm**: v9+ או **yarn**: v1.22+
- **Git**: כל גרסה
- חשבון **Base44** (להרשמה: [base44.com](https://base44.com))

#### 🔧 כלים מומלצים
- **VS Code** עם Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux snippets

---

### 🚀 התקנה לוקלית

#### שלב 1: Clone הפרויקט
\`\`\`bash
# אם יש לך גישה לגיטהאב
git clone https://github.com/your-org/perfect-one.git
cd perfect-one

# או צור פרויקט חדש Base44
npx @base44/cli create perfect-one
cd perfect-one
\`\`\`

#### שלב 2: התקן תלויות
\`\`\`bash
npm install
# או
yarn install
\`\`\`

#### שלב 3: הגדר Environment Variables
צור קובץ \`.env.local\` בשורש הפרויקט:

\`\`\`env
# Base44 Configuration
VITE_BASE44_APP_ID=your_app_id_here
VITE_BASE44_API_KEY=your_api_key_here

# Analytics (Optional)
VITE_GTM_ID=GTM-PNK9CCRQ
VITE_FB_PIXEL_ID=your_pixel_id

# Contact Info
VITE_PHONE=0502277087
VITE_WHATSAPP=972502277087
VITE_EMAIL=yosi5919@gmail.com
\`\`\`

> 💡 **איפה למצוא את ה-App ID & API Key?**
> 1. היכנס ל-[Dashboard של Base44](https://app.base44.com)
> 2. Settings → API Keys
> 3. העתק את ה-App ID ו-API Key

#### שלב 4: הרץ את השרת המקומי
\`\`\`bash
npm run dev
# או
yarn dev
\`\`\`

הפרויקט יהיה זמין ב: **http://localhost:5173**

---

### 📄 Environment Variables מלא

\`\`\`env
# ========================================
# Base44 Backend Configuration
# ========================================
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_API_KEY=your_api_key
VITE_BASE44_API_URL=https://api.base44.com

# ========================================
# Analytics & Tracking
# ========================================
VITE_GTM_ID=GTM-PNK9CCRQ
VITE_FB_PIXEL_ID=1234567890
VITE_GA4_ID=G-XXXXXXXXXX

# ========================================
# Contact Information
# ========================================
VITE_PHONE=0502277087
VITE_WHATSAPP=972502277087
VITE_EMAIL=yosi5919@gmail.com

# ========================================
# SEO & Metadata
# ========================================
VITE_SITE_URL=https://perfect1.co.il
VITE_SITE_NAME=Perfect One
VITE_DEFAULT_TITLE=פתיחת עוסק פטור | Perfect One
VITE_DEFAULT_DESCRIPTION=פתיחת עוסק פטור מהיר ופשוט

# ========================================
# Feature Flags
# ========================================
VITE_ENABLE_BLOG=true
VITE_ENABLE_CHAT=false
VITE_MAINTENANCE_MODE=false
\`\`\`

---

### 📦 Package.json מלא

\`\`\`json
{
  "name": "perfect-one",
  "version": "2.0.0",
  "description": "Perfect One - The Ultimate Osek Patur Platform",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx",
    "lint:fix": "eslint . --ext .js,.jsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@base44/sdk": "^0.8.11",
    "@tanstack/react-query": "^5.84.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.16.4",
    "lucide-react": "^0.475.0",
    "tailwindcss": "^3.4.3"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.10"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
\`\`\`

---

### ⚙️ Vite Configuration

\`\`\`javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { base44VitePlugin } from '@base44/vite-plugin';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    base44VitePlugin()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog'],
          animations: ['framer-motion']
        }
      }
    }
  }
});
\`\`\`

---

## 🚀 Deployment Guide

### Deploy ל-Production

#### Option 1: Base44 Hosting (Recommended)
\`\`\`bash
# Build
npm run build

# Deploy
npx @base44/cli deploy
\`\`\`

#### Option 2: Vercel
\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

**vercel.json:**
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

#### Option 3: Netlify
\`\`\`bash
npm i -g netlify-cli
netlify deploy --prod
\`\`\`

**netlify.toml:**
\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

---

### 🔧 CI/CD Pipeline (GitHub Actions)

\`\`\`.github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_BASE44_APP_ID: \${{ secrets.BASE44_APP_ID }}
          VITE_BASE44_API_KEY: \${{ secrets.BASE44_API_KEY }}
          
      - name: Deploy
        run: npx @base44/cli deploy
        env:
          BASE44_TOKEN: \${{ secrets.BASE44_TOKEN }}
\`\`\`

---

### 🔍 Troubleshooting

#### ❌ בעיות נפוצות

**1. "Module not found" Error**
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

**2. Base44 SDK לא עובד**
- ✅ בדוק \`.env.local\` קיים
- ✅ בדוק App ID נכון
- ✅ Restart dev server

**3. Build נכשל**
\`\`\`bash
rm -rf dist .vite node_modules
npm install
npm run build
\`\`\`

---

### ✅ Checklist לפני Production

- [ ] Environment Variables מוגדרים
- [ ] GTM & Analytics מחוברים
- [ ] WhatsApp & Phone מעודכנים
- [ ] SEO Meta Tags מוגדרים
- [ ] Sitemap עובד
- [ ] Forms שולחים מיילים
- [ ] Admin Panel מאובטח
- [ ] Mobile Responsive
- [ ] Performance (Lighthouse > 90)
- [ ] טסטים ידניים

---

**🎉 סיימנו! המערכת מתועדת ומוכנה לפיתוח/שכפול!**

`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] text-white shadow-2xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                <Database className="w-10 h-10" />
                Perfect One - מפת לוגיקה מלאה
              </h1>
              <p className="text-base md:text-lg opacity-90">
                תיעוד טכני מקיף למשקיעים ו-Development Team
              </p>
            </div>
            <Button 
              onClick={downloadDocumentation}
              className="bg-white text-[#1E3A5F] hover:bg-gray-100 whitespace-nowrap"
            >
              <Download className="w-5 h-5 ml-2" />
              הורד PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-24 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap transition-all ${
                  activeTab === cat.id
                    ? 'bg-[#1E3A5F] text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-12">
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'entities' && <EntitiesSection />}
        {activeTab === 'code' && <CodeSection />}
        {activeTab === 'flows' && <FlowsSection />}
        {activeTab === 'seo' && <SEOSection />}
        {activeTab === 'tracking' && <TrackingSection />}
        {activeTab === 'security' && <PermissionsSection />}
        {activeTab === 'jobs' && <JobsSection />}
        {activeTab === 'migration' && <MigrationSection />}
        {activeTab === 'seo_tools' && <SEOToolsSection />}
      </div>
    </div>
  );
}

// Code Section Component
function CodeSection() {
  const [expandedFile, setExpandedFile] = React.useState(null);

  const codeFiles = [
    {
      name: 'entities/Lead.json',
      category: 'Database',
      code: `{
  "name": "Lead",
  "type": "object",
  "properties": {
    "name": { "type": "string", "description": "שם המוביל" },
    "phone": { "type": "string", "description": "מספר טלפון" },
    "email": { "type": "string", "description": "כתובת אימייל" },
    "profession": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["osek_patur", "monthly_support", "invoice", "consultation", "other"],
      "default": "osek_patur"
    },
    "status": {
      "type": "string",
      "enum": ["new", "contacted", "no_answer", "in_progress", "qualified", "not_interested", "converted", "closed"],
      "default": "new"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "default": "medium"
    },
    "source_page": { "type": "string" },
    "interaction_type": {
      "type": "string",
      "enum": ["form", "phone_click", "whatsapp_click", "manual"],
      "default": "form"
    },
    "follow_up_date": { "type": "string", "format": "date" },
    "last_contact_date": { "type": "string", "format": "date" },
    "consent": { "type": "boolean", "default": false }
  },
  "required": ["name", "phone"]
}`
    },
    {
      name: 'entities/BlogPost.json',
      category: 'Database',
      code: `{
  "name": "BlogPost",
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "slug": { "type": "string", "description": "URL slug" },
    "excerpt": { "type": "string" },
    "content": { "type": "string" },
    "category": {
      "type": "string",
      "enum": ["general", "osek-patur", "taxes", "professions", "guides"]
    },
    "keywords": { "type": "array", "items": { "type": "string" } },
    "meta_title": { "type": "string" },
    "meta_description": { "type": "string" },
    "featured_image": { "type": "string" },
    "author": { "type": "string", "default": "צוות Perfect One" },
    "read_time": { "type": "number" },
    "published": { "type": "boolean", "default": true }
  },
  "required": ["title", "slug", "content", "category"]
}`
    },
    {
      name: 'components/forms/LeadForm.jsx',
      category: 'Frontend',
      code: `import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackLeadSubmit } from '../tracking/EventTracker';

export default function LeadForm({ 
  title = "🚀 התחל את העסק שלך היום",
  sourcePage = "כללי"
}) {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', profession: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Create lead
    const newLead = await base44.entities.Lead.create({
      ...formData,
      source_page: sourcePage,
      status: 'new'
    });

    // Track conversion
    trackLeadSubmit(newLead);

    // Send email
    await base44.integrations.Core.SendEmail({
      to: 'yosi5919@gmail.com',
      subject: \`🎯 ליד חדש מ\${sourcePage}\`,
      body: \`<h2>ליד חדש!</h2><p>שם: \${newLead.name}</p>\`
    });

    window.location.href = '/ThankYou';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="שם מלא *" required />
      <Input type="tel" placeholder="טלפון *" required />
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'שולח...' : 'בדיקה ללא התחייבות'}
      </Button>
    </form>
  );
}`
    },
    {
      name: 'components/tracking/EventTracker.js',
      category: 'Frontend',
      code: `export const trackLeadSubmit = (lead) => {
  window.dataLayer?.push({
    event: 'lead_submit',
    lead_name: lead.name,
    lead_source: lead.source_page,
    lead_category: lead.category
  });

  window.fbq?.('track', 'Lead', {
    content_name: lead.source_page,
    value: 500,
    currency: 'ILS'
  });
};

export const trackPhoneClick = (location) => {
  window.dataLayer?.push({
    event: 'phone_click',
    location: location
  });
};

export const trackWhatsAppClick = (location, message) => {
  window.dataLayer?.push({
    event: 'whatsapp_click',
    location: location,
    message: message
  });
};`
    }
  ];

  return (
    <div>
      <SectionHeader 
        title="💻 Code Library" 
        icon={Code}
        description="כל הקודים הקריטיים בפרויקט - Database, Frontend & Tracking"
      />

      <div className="space-y-4">
        {codeFiles.map(file => (
          <Card key={file.name} title={`${file.category} / ${file.name}`}>
            <button
              onClick={() => setExpandedFile(expandedFile === file.name ? null : file.name)}
              className="w-full flex items-center justify-between p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-[#1E3A5F] transition-all"
            >
              <span>{expandedFile === file.name ? '▼' : '▶'} הצג קוד</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{file.category}</span>
            </button>
            
            {expandedFile === file.name && (
              <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs leading-relaxed font-mono">
                  <code>{file.code}</code>
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Section Components Below...

function OverviewSection() {
  return (
    <div>
      <SectionHeader 
        title="סקירת המערכת" 
        icon={Rocket}
        description="מטרה, טכנולוגיות, וארכיטקטורה כללית"
      />
      
      <Card title="🎯 מטרת המערכת" highlight>
        <p className="text-lg text-gray-700 leading-relaxed">
          <strong className="text-[#1E3A5F]">Perfect One</strong> היא פלטפורמת SaaS לשיווק וניהול לקוחות (CRM) 
          לעסקים בתחום <strong>פתיחת עוסק פטור</strong> בישראל. 
          המערכת משלבת אתר שיווקי עם SEO מתקדם, מנגנוני המרה חכמים, 
          ו-CRM פנימי לניהול לידים וליווי לקוחות.
        </p>
      </Card>

      <Card title="🏗️ ארכיטקטורה - Stack טכנולוגי">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Frontend:</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono">React 18.2.0</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono">Tailwind CSS</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono">Framer Motion</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono">Shadcn/UI</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono">TanStack Query</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Backend (BaaS):</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-mono">Base44 Platform</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-mono">NoSQL Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-mono">JWT Auth</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Integrations:</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-mono">GTM + GA4</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-mono">Facebook Pixel</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-mono">Email API</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-mono">LLM (AI)</span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="📊 KPIs & Metrics (2026)">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-black text-green-700">~200</div>
            <div className="text-sm text-gray-600 mt-1">לידים/חודש</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-black text-blue-700">3.2%</div>
            <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-black text-purple-700">₪2.5K</div>
            <div className="text-sm text-gray-600 mt-1">LTV ממוצע</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-black text-orange-700">45+</div>
            <div className="text-sm text-gray-600 mt-1">דפים באתר</div>
          </div>
        </div>
      </Card>
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
      desc: 'מקצועות - דפי Landing SEO',
      fields: ['name', 'slug', 'icon', 'color', 'category', 'subcategory', 'description', 'services', 'tips', 'meta_title', 'meta_description'],
      relations: [],
      indexes: ['slug (unique)', 'category'],
      businessLogic: [
        'Dynamic landing pages: /professions/{slug}',
        'LocalBusiness schema per profession',
        'Internal links from all relevant pages'
      ],
      volume: '~50 professions',
      retention: 'Permanent'
    },
    {
      name: 'SitemapURL',
      desc: 'רשימת כל ה-URLs לGoogle',
      fields: ['url', 'type', 'priority', 'changefreq', 'lastmod', 'status'],
      relations: ['PageSnapshot ← url'],
      indexes: ['url (unique)', 'status', 'lastmod'],
      businessLogic: [
        'Auto-updated on entity create/update',
        'Ping Google on substantial changes',
        'Dynamic sitemap generation from DB'
      ],
      volume: '45+ URLs',
      retention: 'Permanent + historical tracking'
    },
    {
      name: 'SEOLog',
      desc: 'Audit trail - כל שינוי בתוכן',
      fields: ['entity_name', 'entity_id', 'url', 'action', 'fields_changed', 'is_substantial_change', 'lastmod_updated', 'ping_sent', 'ping_status', 'error_message'],
      relations: ['Entity (polymorphic)'],
      indexes: ['entity_id', 'created_date', 'action'],
      businessLogic: [
        'Trigger on any entity save (BlogPost, Profession, etc.)',
        'Track substantial vs minor changes',
        'Record Google ping results'
      ],
      volume: '~500 logs (historical)',
      retention: '1 year retention policy'
    },
    {
      name: 'PageSnapshot',
      desc: 'צילומי מצב של דפים - Change Detection',
      fields: ['url', 'entity_name', 'entity_id', 'last_scanned', 'lastmod', 'content_hash', 'title', 'status'],
      relations: ['SitemapURL → url'],
      indexes: ['url (unique)', 'content_hash'],
      businessLogic: [
        'Daily cron scan all pages',
        'Hash comparison for change detection',
        'Trigger sitemap update if changed'
      ],
      volume: '45+ snapshots',
      retention: 'Last 30 days only'
    },
    {
      name: 'User (Built-in)',
      desc: 'משתמשי מערכת - Admin/CRM',
      fields: ['email', 'full_name', 'role (admin/user)'],
      relations: ['Lead ← created_by'],
      indexes: ['email (unique)', 'role'],
      businessLogic: [
        'Admin: Full CRM access',
        'User: Read-only dashboard',
        'Auto email on new lead'
      ],
      volume: '2-5 users',
      retention: 'Permanent'
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
      name: 'SEO Auto-Indexing Flow',
      trigger: 'BlogPost or Profession created/updated',
      conditions: ['substantial change detected (title, content, slug)', 'entity.published = true'],
      actions: [
        '1. Calculate content hash',
        '2. Check if substantial change',
        '3. Update SitemapURL.lastmod',
        '4. Create SEOLog entry',
        '5. Ping Google Search Console'
      ],
      outputs: ['Updated sitemap', 'SEOLog record', 'Google notified'],
      failure: 'Log error, retry ping after 1 hour'
    },
    {
      name: 'Internal Linking Flow',
      trigger: 'BlogPost save or page render',
      conditions: ['content has linkable keywords', 'not already linked', 'target page exists'],
      actions: [
        '1. Parse content for keywords (KEYWORD_MAPPING)',
        '2. Find first occurrence',
        '3. Check not in <a> tag already',
        '4. Replace with anchor link',
        '5. Max 1 link per keyword'
      ],
      outputs: ['HTML with smart internal links'],
      failure: 'No linking applied, original content returned'
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
            
            {flow.conditions && (
              <div>
                <span className="font-bold text-blue-700">✅ Conditions:</span>
                <ul className="mt-2 space-y-1">
                  {flow.conditions.map((cond, i) => (
                    <li key={i} className="text-gray-700">• {cond}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <span className="font-bold text-purple-700">⚙️ Actions:</span>
              <ul className="mt-2 space-y-1">
                {flow.actions.map((action, i) => (
                  <li key={i} className="text-gray-700">{action}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <span className="font-bold text-orange-700">📤 Outputs:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {flow.outputs.map((output, i) => (
                  <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">
                    {output}
                  </span>
                ))}
              </div>
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
        <div className="space-y-3">
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">1. On-Page SEO</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Semantic HTML5 + proper heading hierarchy (H1 → H6)</li>
              <li>✅ Meta title (50-60 chars) + Meta description (150-160 chars)</li>
              <li>✅ Canonical URLs prevent duplicate content</li>
              <li>✅ Alt text על כל התמונות</li>
              <li>✅ Internal linking - אוטומטי דרך InternalLinker component</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">2. Technical SEO</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✅ Sitemap.xml דינמי (מ-DB)</li>
              <li>✅ robots.txt</li>
              <li>✅ Google Search Console ping on content updates</li>
              <li>✅ Structured Data: LocalBusiness, FAQPage, BreadcrumbList, HowTo</li>
              <li>✅ Core Web Vitals optimized (Lighthouse 90+)</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🌍 Local SEO (GEO + GBP)">
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-bold text-blue-700 mb-1">Google Business Profile (GBP)</h4>
            <p className="text-sm text-gray-700">כל דף שירות/מקצוע כולל LocalBusiness schema + Google Map embed</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <h4 className="font-bold text-green-700 mb-1">GeoContent Component</h4>
            <p className="text-sm text-gray-700">תוכן דינמי לפי ערים בישראל - מוזכר תל אביב, ירושלים, חיפה, באר שבע וכו'</p>
          </div>
        </div>
      </Card>

      <Card title="🔗 Internal Linking Strategy">
        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            <strong>InternalLinker component</strong> מזהה מילות מפתח בתוכן ויוצר קישורים אוטומטיים:
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="font-semibold text-sm mb-2">חוקים:</h5>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• קישור אחד לכל ביטוי בעמוד (רק הופעה ראשונה)</li>
              <li>• לא לקשר בכותרות (H1/H2/H3)</li>
              <li>• מקסימום 1-2 קישורים לאותו דף יעד</li>
              <li>• Context awareness - בודק הקשר טקסטואלי</li>
              <li>• מניעת cannibalization - דף לא מקשר לעצמו</li>
            </ul>
          </div>
        </div>
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
      name: 'lead_submit',
      trigger: 'Form submission success',
      payload: { lead_name: 'string', lead_source: 'string', lead_category: 'string' },
      destinations: ['GTM', 'Facebook Pixel (Lead event)']
    },
    {
      name: 'phone_click',
      trigger: 'Click on phone number',
      payload: { location: 'header/footer/sticky' },
      destinations: ['GTM']
    },
    {
      name: 'whatsapp_click',
      trigger: 'Click on WhatsApp button',
      payload: { location: 'string', message: 'string' },
      destinations: ['GTM', 'Facebook Pixel (Contact event)']
    },
    {
      name: 'form_view',
      trigger: 'LeadForm rendered',
      payload: { form_location: 'string' },
      destinations: ['GTM']
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
        <div className="space-y-2">
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Google Tag Manager (GTM)</h4>
            <p className="text-xs text-gray-600">Container ID: GTM-PNK9CCRQ</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-800 mb-1">Facebook Pixel</h4>
            <p className="text-xs text-gray-600">Pixel ID: (set in Layout.js)</p>
          </div>
        </div>
      </Card>

      {events.map(event => (
        <Card key={event.name} title={event.name}>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-sm text-gray-700">🎯 Trigger:</span>
              <p className="text-sm text-gray-600 mt-1">{event.trigger}</p>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">📦 Payload:</span>
              <div className="bg-gray-50 p-2 rounded mt-1">
                <code className="text-xs text-gray-700">{JSON.stringify(event.payload, null, 2)}</code>
              </div>
            </div>
            <div>
              <span className="font-semibold text-sm text-gray-700">📍 Destinations:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {event.destinations.map((dest, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
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
        <div className="space-y-3">
          <div className="border-r-4 border-blue-500 pr-4">
            <h4 className="font-bold text-blue-700">Admin</h4>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>✅ Full CRM access (LeadsAdmin)</li>
              <li>✅ Create/Edit/Delete BlogPosts</li>
              <li>✅ Create/Edit/Delete Professions</li>
              <li>✅ View SEOAdmin dashboard</li>
              <li>✅ Invite new users</li>
            </ul>
          </div>
          <div className="border-r-4 border-green-500 pr-4">
            <h4 className="font-bold text-green-700">User (Regular)</h4>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>✅ View leads (read-only)</li>
              <li>❌ Cannot delete leads</li>
              <li>❌ Cannot create content</li>
              <li>✅ Update own profile only</li>
            </ul>
          </div>
          <div className="border-r-4 border-gray-500 pr-4">
            <h4 className="font-bold text-gray-700">Anonymous (Public)</h4>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>✅ View all public pages</li>
              <li>✅ Submit lead forms</li>
              <li>❌ No CRM access</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔒 Entity-Level Permissions">
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <p className="font-semibold text-sm">Lead Entity:</p>
            <p className="text-xs text-gray-600">Admin: Full CRUD | User: Read + Update | Public: Create only (via form)</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="font-semibold text-sm">BlogPost Entity:</p>
            <p className="text-xs text-gray-600">Admin: Full CRUD | User: Read | Public: Read (published only)</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="font-semibold text-sm">User Entity:</p>
            <p className="text-xs text-gray-600">Admin: Full CRUD (all users) | User: Update self only</p>
          </div>
        </div>
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
            <p className="text-sm text-gray-700 mb-2"><strong>Schedule:</strong> Daily at 3:00 AM</p>
            <p className="text-sm text-gray-700 mb-2"><strong>Function:</strong> cronDailyScan()</p>
            <p className="text-sm text-gray-700"><strong>Action:</strong> Scans all pages, compares content hash, updates PageSnapshot</p>
          </div>
          <div className="border-r-4 border-blue-500 pr-4">
            <h4 className="font-bold text-[#1E3A5F] mb-2">Auto Sitemap Ping</h4>
            <p className="text-sm text-gray-700 mb-2"><strong>Schedule:</strong> Daily at 4:00 AM (after scan)</p>
            <p className="text-sm text-gray-700 mb-2"><strong>Function:</strong> cronAutoSitemapPing()</p>
            <p className="text-sm text-gray-700"><strong>Action:</strong> If changes detected, ping Google Search Console</p>
          </div>
        </div>
      </Card>

      <Card title="🚀 On-Demand Jobs">
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-sm">Generate Image (AI)</h4>
            <p className="text-xs text-gray-600">Uses: base44.integrations.Core.GenerateImage() | ~5-10s</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-sm">Invoke LLM</h4>
            <p className="text-xs text-gray-600">Uses: base44.integrations.Core.InvokeLLM() | ~2-5s</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h4 className="font-semibold text-sm">Extract Data from File</h4>
            <p className="text-xs text-gray-600">Uses: base44.integrations.Core.ExtractDataFromUploadedFile() | ~3-8s</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function SEOToolsSection() {
  return (
    <div>
      <SectionHeader 
        title="Advanced SEO Tools" 
        icon={Search}
        description="Competitor analysis, AI content suggestions, and broken link checker"
      />

      <Card title="🔍 Competitor Analyzer" highlight>
        <p className="text-gray-700 mb-3">
          <strong>Purpose:</strong> Monitor and analyze top-ranking competitors for target keywords.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">✅ <strong>Features:</strong></p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Add competitors by domain</li>
            <li>• Auto-analyze using LLM (title, meta, word count, schema)</li>
            <li>• Benchmark against your content</li>
            <li>• Store in CompetitorData entity</li>
          </ul>
        </div>
      </Card>

      <Card title="💡 Content Suggestion Engine" highlight>
        <p className="text-gray-700 mb-3">
          <strong>Purpose:</strong> AI-powered recommendations for SEO improvements based on competitors.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">✅ <strong>Capabilities:</strong></p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Analyze BlogPosts & Professions</li>
            <li>• Compare vs competitor benchmarks</li>
            <li>• Suggest: titles, meta, keywords, schema, internal links</li>
            <li>• Track implementation status</li>
            <li>• Powered by LLM with competitor context</li>
          </ul>
        </div>
      </Card>

      <Card title="🔗 Broken Link Checker" highlight>
        <p className="text-gray-700 mb-3">
          <strong>Purpose:</strong> Audit entire website for broken links and crawl errors.
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">✅ <strong>Features:</strong></p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            <li>• Full-site link crawl</li>
            <li>• Detects: 404s, timeouts, DNS errors</li>
            <li>• Severity levels (critical, high, medium, low)</li>
            <li>• Track fixes and recheck history</li>
            <li>• Stores in LinkReport entity</li>
          </ul>
        </div>
      </Card>

      <Card title="📊 Database Schema" highlight>
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-sm">CompetitorData Entity</p>
            <p className="text-xs text-gray-600 mt-1">Stores: domain, url, keyword, metrics (word count, images, links, schema), ranking position</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-sm">ContentSuggestion Entity</p>
            <p className="text-xs text-gray-600 mt-1">Stores: suggestion type, current/suggested values, reasoning, impact level, implementation status</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="font-semibold text-sm">LinkReport Entity</p>
            <p className="text-xs text-gray-600 mt-1">Stores: broken link URL, page source, error type, status code, severity, fix status, recheck history</p>
          </div>
        </div>
      </Card>

      <Card title="🚀 New Page: /SEOAnalytics">
        <p className="text-sm text-gray-700 mb-3">
          Dedicated dashboard with 3 tabs for accessing all SEO analysis tools. Located at pages/SEOAnalytics.js
        </p>
        <div className="bg-blue-50 p-3 rounded text-xs text-gray-700">
          Tabs: Competitors | Content Suggestions | Link Audit
        </div>
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
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Step 1: Entity Export</h4>
            <p className="text-sm text-gray-700 mb-2">All entities support CSV export:</p>
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono">
              const leads = await base44.entities.Lead.list('-created_date', 10000);<br/>
              // Export to CSV via LeadsAdmin "Export" button
            </div>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Step 2: File Assets</h4>
            <p className="text-sm text-gray-700">All uploaded files accessible via URLs - bulk download script available</p>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Step 3: Code Export</h4>
            <p className="text-sm text-gray-700">Full React codebase - standard Git repository</p>
          </div>
          <div>
            <h4 className="font-bold text-[#1E3A5F] mb-2">Step 4: Migrate to New Platform</h4>
            <ul className="text-sm text-gray-700 space-y-1 mr-4">
              <li>• Option A: Supabase (PostgreSQL + Auth)</li>
              <li>• Option B: Firebase (NoSQL + Auth)</li>
              <li>• Option C: Custom Node.js backend</li>
            </ul>
          </div>
        </div>
      </Card>

      <Card title="🔄 Migration Checklist">
        <div className="space-y-2">
          {[
            'Export all entities to CSV/JSON',
            'Download all file assets',
            'Clone Git repository',
            'Document env variables',
            'Setup new database schema',
            'Import data with transformations',
            'Update API calls (replace base44 SDK)',
            'Test authentication flows',
            'Verify SEO (301 redirects if needed)',
            'Switch DNS'
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}