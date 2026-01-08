import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Play, Settings, Code, Package, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeveloperSetup() {
  const setupGuide = `
# 🚀 Perfect One - Developer Setup Guide

> **מדריך התקנה מלא ומפורט** - כל מה שצריך כדי להריץ את המערכת לוקלית או לפרוס production

---

## 📋 תוכן עניינים

1. [דרישות מערכת](#דרישות-מערכת)
2. [התקנה לוקלית](#התקנה-לוקלית)
3. [Environment Variables](#environment-variables)
4. [Package.json מלא](#packagejson-מלא)
5. [Vite Configuration](#vite-configuration)
6. [Routing Setup](#routing-setup)
7. [Base44 Integration](#base44-integration)
8. [Deployment](#deployment)
9. [CI/CD Pipeline](#cicd-pipeline)
10. [Troubleshooting](#troubleshooting)

---

## 1️⃣ דרישות מערכת

### ✅ חובה
- **Node.js**: v18+ (מומלץ v20)
- **npm**: v9+ או **yarn**: v1.22+
- **Git**: כל גרסה
- חשבון **Base44** (להרשמה: [base44.com](https://base44.com))

### 🔧 כלים מומלצים
- **VS Code** עם Extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux snippets

---

## 2️⃣ התקנה לוקלית

### שלב 1: Clone הפרויקט
\`\`\`bash
# אם יש לך גישה לגיטהאב
git clone https://github.com/your-org/perfect-one.git
cd perfect-one

# או צור פרויקט חדש Base44
npx @base44/cli create perfect-one
cd perfect-one
\`\`\`

### שלב 2: התקן תלויות
\`\`\`bash
npm install
# או
yarn install
\`\`\`

### שלב 3: הגדר Environment Variables
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

### שלב 4: הרץ את השרת המקומי
\`\`\`bash
npm run dev
# או
yarn dev
\`\`\`

הפרויקט יהיה זמין ב: **http://localhost:5173**

---

## 3️⃣ Environment Variables

### 📄 קובץ .env.local מלא

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

### 🔐 איך להשתמש ב-Env Variables בקוד

\`\`\`javascript
// בכל מקום בקוד
const appId = import.meta.env.VITE_BASE44_APP_ID;
const phone = import.meta.env.VITE_PHONE;

// בדיקת feature flags
if (import.meta.env.VITE_ENABLE_BLOG === 'true') {
  // הצג בלוג
}
\`\`\`

---

## 4️⃣ Package.json מלא

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
    "@base44/vite-plugin": "^0.2.5",
    "@hello-pangea/dnd": "^17.0.0",
    "@hookform/resolvers": "^4.1.2",
    "@radix-ui/react-accordion": "^1.2.3",
    "@radix-ui/react-alert-dialog": "^1.1.6",
    "@radix-ui/react-avatar": "^1.1.3",
    "@radix-ui/react-checkbox": "^1.1.4",
    "@radix-ui/react-dialog": "^1.1.6",
    "@radix-ui/react-dropdown-menu": "^2.1.6",
    "@radix-ui/react-label": "^2.1.2",
    "@radix-ui/react-popover": "^1.1.6",
    "@radix-ui/react-select": "^2.1.6",
    "@radix-ui/react-separator": "^1.1.2",
    "@radix-ui/react-slot": "^1.1.2",
    "@radix-ui/react-switch": "^1.1.3",
    "@radix-ui/react-tabs": "^1.1.3",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.8",
    "@tanstack/react-query": "^5.84.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.16.4",
    "lodash": "^4.17.21",
    "lucide-react": "^0.475.0",
    "moment": "^2.30.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-helmet-async": "^2.0.5",
    "react-hook-form": "^7.54.2",
    "react-markdown": "^9.0.1",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.15.4",
    "sonner": "^2.0.1",
    "tailwind-merge": "^3.0.2",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.24.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "postcss": "^8.4.38",
    "prettier": "^3.2.5",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.10"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
\`\`\`

---

## 5️⃣ Vite Configuration

### 📄 vite.config.js

\`\`\`javascript
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
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          animations: ['framer-motion']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  }
});
\`\`\`

---

## 6️⃣ Routing Setup

### 📄 src/main.jsx (Entry Point)

\`\`\`javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './Layout';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import Professions from './pages/Professions';
import Contact from './pages/Contact';
import LeadsAdmin from './pages/LeadsAdmin';
// ... more pages

import './globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/Home" element={<Layout><Home /></Layout>} />
          <Route path="/Services" element={<Layout><Services /></Layout>} />
          <Route path="/Professions" element={<Layout><Professions /></Layout>} />
          <Route path="/Contact" element={<Layout><Contact /></Layout>} />
          <Route path="/LeadsAdmin" element={<Layout><LeadsAdmin /></Layout>} />
          {/* Add all routes here */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
\`\`\`

---

## 7️⃣ Base44 Integration

### 📄 @/api/base44Client.js (Auto-generated)

\`\`\`javascript
import { Base44 } from '@base44/sdk';

export const base44 = new Base44({
  appId: import.meta.env.VITE_BASE44_APP_ID,
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  apiUrl: import.meta.env.VITE_BASE44_API_URL || 'https://api.base44.com'
});

// Export for convenience
export default base44;
\`\`\`

### 🔌 שימוש בקוד

\`\`\`javascript
import { base44 } from '@/api/base44Client';

// Fetch data
const leads = await base44.entities.Lead.list();

// Create
await base44.entities.Lead.create({ name: "Test", phone: "123" });

// Update
await base44.entities.Lead.update(id, { status: "contacted" });

// Delete
await base44.entities.Lead.delete(id);

// Auth
const user = await base44.auth.me();
await base44.auth.updateMe({ full_name: "New Name" });
\`\`\`

---

## 8️⃣ Deployment

### 🚀 Deploy ל-Production

#### Option 1: Base44 Hosting (Recommended)
\`\`\`bash
# Build
npm run build

# Deploy
npx @base44/cli deploy

# או דרך Dashboard
# Dashboard → Deploy → Upload dist folder
\`\`\`

#### Option 2: Vercel
\`\`\`bash
# התקן Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
\`\`\`

**vercel.json:**
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

#### Option 3: Netlify
\`\`\`bash
# התקן Netlify CLI
npm i -g netlify-cli

# Deploy
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

## 9️⃣ CI/CD Pipeline

### GitHub Actions Example

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
          
      - name: Deploy to Base44
        run: npx @base44/cli deploy
        env:
          BASE44_TOKEN: \${{ secrets.BASE44_TOKEN }}
\`\`\`

---

## 🔟 Troubleshooting

### ❌ בעיות נפוצות ופתרונות

#### 1. "Module not found" Error
\`\`\`bash
# פתרון:
rm -rf node_modules package-lock.json
npm install
\`\`\`

#### 2. Base44 SDK לא עובד
- ✅ בדוק ש-\`.env.local\` קיים
- ✅ בדוק שה-\`VITE_BASE44_APP_ID\` נכון
- ✅ Restart dev server

#### 3. Tailwind Classes לא עובדים
- ✅ בדוק שיש \`@tailwind\` directives ב-\`globals.css\`
- ✅ Restart dev server

#### 4. RTL לא עובד
- ✅ ודא ש-\`dir="rtl"\` על \`<div>\` הראשי ב-Layout
- ✅ בדוק \`direction: rtl;\` ב-CSS

#### 5. Build נכשל
\`\`\`bash
# נקה cache
rm -rf dist .vite node_modules
npm install
npm run build
\`\`\`

---

## 📚 משאבים נוספים

- 📖 [Base44 Documentation](https://docs.base44.com)
- 🎨 [Tailwind CSS Docs](https://tailwindcss.com/docs)
- ⚛️ [React Router Docs](https://reactrouter.com)
- 🔄 [TanStack Query Docs](https://tanstack.com/query)
- 🎭 [Framer Motion Docs](https://www.framer.com/motion)

---

## ✅ Checklist לפני Production

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

**🎉 מזל טוב! המערכת שלך מוכנה לעלייה!**

`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] text-white p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                  <Rocket className="w-10 h-10" />
                  Developer Setup Guide
                </h1>
                <p className="text-xl opacity-90">
                  מדריך התקנה והרצה מלא - מקומי ו-Production
                </p>
              </div>
              <Button 
                onClick={() => {
                  const blob = new Blob([setupGuide], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'Perfect-One-Setup-Guide.md';
                  a.click();
                }}
                className="bg-white text-[#27AE60] hover:bg-gray-100"
              >
                <Download className="w-5 h-5 ml-2" />
                הורד Setup Guide
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                <Package className="w-8 h-8" />
                <div>
                  <div className="font-bold">התקנה</div>
                  <div className="text-sm opacity-90">npm install</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                <Settings className="w-8 h-8" />
                <div>
                  <div className="font-bold">הגדרות</div>
                  <div className="text-sm opacity-90">.env.local</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                <Play className="w-8 h-8" />
                <div>
                  <div className="font-bold">הרצה</div>
                  <div className="text-sm opacity-90">npm run dev</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/20 rounded-lg p-4">
                <Rocket className="w-8 h-8" />
                <div>
                  <div className="font-bold">Deploy</div>
                  <div className="text-sm opacity-90">npm run build</div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose prose-lg prose-slate max-w-none" dir="rtl">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-4xl font-black text-[#27AE60] border-b-4 border-blue-400 pb-3 mb-6">
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
                        <code className="bg-blue-100 px-2 py-1 rounded text-sm text-blue-900 font-mono">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 border-l-4 border-[#27AE60]">
                        <code className={className}>{children}</code>
                      </pre>
                    );
                  },
                  ul: ({ children }) => (
                    <ul className="mr-6 my-4 space-y-2 list-disc">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mr-6 my-4 space-y-2 list-decimal">{children}</ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-r-4 border-blue-500 bg-blue-50 pr-4 py-3 my-4 rounded">
                      {children}
                    </blockquote>
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
                  )
                }}
              >
                {setupGuide}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}