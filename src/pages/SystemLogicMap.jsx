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

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1E3A5F] via-[#2C5282] to-[#1E3A5F] text-white shadow-2xl sticky top-0 z-50">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                  <Database className="w-10 h-10" />
                  Perfect One - מפת לוגיקה מלאה
                </h1>
                <p className="text-base md:text-lg opacity-90">
                  תיעוד טכני מקיף + Setup Guide - כל מה שצריך לבניה מאפס
                </p>
              </div>
              <Button 
                onClick={() => {
                  const blob = new Blob([markdownContent], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Perfect-One-Complete-Documentation.md';
                  a.click();
                }}
                className="hidden md:flex bg-white text-[#1E3A5F] hover:bg-gray-100"
              >
                <Download className="w-5 h-5 ml-2" />
                הורד מסמך מלא
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="border-t border-white/20 px-8 py-3 bg-[#1E3A5F]/50 backdrop-blur-sm">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-2 pb-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                        activeSection === section.id
                          ? 'bg-white text-[#1E3A5F] shadow-lg'
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10">
              <div className="prose prose-lg prose-slate max-w-none" dir="rtl">
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-4xl font-black text-[#1E3A5F] border-b-4 border-[#D4AF37] pb-3 mb-6">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-3xl font-bold text-[#1E3A5F] mt-12 mb-4 flex items-center gap-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-2xl font-bold text-[#2C5282] mt-8 mb-3">
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className="text-xl font-bold text-gray-800 mt-6 mb-2">
                          {children}
                        </h4>
                      ),
                      code: ({ inline, className, children }) => {
                        if (inline) {
                          return (
                            <code className="bg-gray-100 px-2 py-1 rounded text-sm text-[#1E3A5F] font-mono">
                              {children}
                            </code>
                          );
                        }
                        return (
                          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                            <code className={className}>{children}</code>
                          </pre>
                        );
                      },
                      table: ({ children }) => (
                        <div className="overflow-x-auto my-6">
                          <table className="min-w-full border-collapse border border-gray-300">
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className="bg-[#1E3A5F] text-white px-4 py-2 text-right font-bold border border-gray-300">
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className="px-4 py-2 border border-gray-300">
                          {children}
                        </td>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-r-4 border-[#D4AF37] bg-blue-50 pr-4 py-3 my-4 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className="mr-6 my-4 space-y-2 list-disc">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mr-6 my-4 space-y-2 list-decimal">{children}</ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-700 leading-relaxed">{children}</li>
                      ),
                      a: ({ href, children }) => (
                        <a 
                          href={href}
                          className="text-[#27AE60] hover:text-[#2ECC71] font-bold underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      hr: () => (
                        <hr className="my-8 border-t-2 border-gray-200" />
                      )
                    }}
                  >
                    {markdownContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Bottom Download Button Mobile */}
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Button 
              onClick={() => {
                const blob = new Blob([markdownContent], { type: 'text/markdown' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'Perfect-One-Complete-Documentation.md';
                a.click();
              }}
              className="bg-[#27AE60] hover:bg-[#2ECC71] text-white shadow-2xl"
              size="lg"
            >
              <Download className="w-5 h-5 ml-2" />
              הורד מסמך
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}