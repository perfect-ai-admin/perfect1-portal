import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import InternalLinker from '../components/seo/InternalLinker';
import MicroCTA from '../components/cro/MicroCTA';
import SEOOptimized, { seoPresets } from './SEOOptimized';
import { Button } from '@/components/ui/button';
import GeoContent from '../components/seo/GeoContent';
import LocalBusinessSchema from '../components/seo/LocalBusinessSchema';
import { 
  ArrowLeft, CheckCircle, Home
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Breadcrumbs from '../components/seo/Breadcrumbs';

const iconMap = {
  FileText: 'FileText',
  Laptop: 'Laptop',
  Calculator: 'Calculator',
  Receipt: 'Receipt',
  BarChart3: 'BarChart3',
  XCircle: 'XCircle',
  Shield: 'Shield',
  Building2: 'Building2'
};

const getServiceLink = (service) => {
  if (service.id === 'ptihat-osek-patur' || service.title === 'פתיחת עוסק פטור') {
    return createPageUrl('OsekPaturLanding');
  }
  if (service.id === 'ptihat-osek-patur-online' || service.title === 'פתיחת עוסק אונליין') {
    return createPageUrl('OsekPaturOnlineLanding');
  }
  if (service.id === 'livui-chodshi' || service.title === 'ליווי חודשי') {
    return createPageUrl('ServicePage') + '?service=livui-chodshi';
  }
  if (service.id === 'doch-shnati' || service.title === 'דוח שנתי' || service.title === 'הגשת דוח שנתי') {
    return createPageUrl('ServicePage') + '?service=doch-shnati';
  }
  return createPageUrl('ServicePage') + `?service=${service.id}`;
};

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await base44.entities.Service.list();
        setServices(data || []);
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);
  // Enhanced Services Hub Schema
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "שירותים לעוסקים פטורים בישראל",
    "description": "מגוון שירותים מקיף לעוסקים פטורים - פתיחה, ליווי, דוחות, הנהלת חשבונות",
    "url": "https://perfect1.co.il/services",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Perfect One",
      "url": "https://perfect1.co.il"
    },
    "about": {
      "@type": "Thing",
      "name": "שירותים לעוסקים פטורים",
      "description": "שירותי פתיחה וליווי עוסקים פטורים בישראל"
    },
    "provider": {
      "@type": "Organization",
      "name": "Perfect One",
      "sameAs": [
        "https://www.facebook.com/perfect1.co.il",
        "https://www.linkedin.com/company/perfect1",
        "https://www.instagram.com/perfect1.co.il"
      ]
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "קטלוג שירותים",
      "itemListElement": services.map(service => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.title,
          "description": service.description
        }
      }))
    }
  };

  if (loading) {
    return (
      <>
        <LocalBusinessSchema />
        <SEOOptimized {...seoPresets.services} />
        <main className="pt-20">
          <section className="py-40 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-gray-600">טוען שירותים...</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <LocalBusinessSchema />
      <SEOOptimized 
        {...seoPresets.services}
        canonical="https://perfect1.co.il/services"
        schema={servicesSchema}
      />
      <main className="pt-20">
            {/* Breadcrumbs + Services Grid - Top Section */}
            <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16 border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                  <Breadcrumbs 
                    items={[
                      { label: "דף הבית", path: createPageUrl('Home') },
                      { label: "שירותים" }
                    ]}
                  />
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={getServiceLink(service)}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all h-full group">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-6 h-6 text-xl" style={{ color: service.color }}>
                          {service.icon === 'FileText' && '📄'}
                          {service.icon === 'Laptop' && '💻'}
                          {service.icon === 'Calculator' && '🧮'}
                          {service.icon === 'Receipt' && '🧾'}
                          {service.icon === 'BarChart3' && '📊'}
                          {service.icon === 'XCircle' && '❌'}
                          {service.icon === 'Shield' && '🛡️'}
                          {service.icon === 'Building2' && '🏢'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs text-white/70 mt-1 line-clamp-2">{service.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              שירותים לעוסקים פטורים בישראל
            </h1>
            <div className="text-xl text-white/80 max-w-2xl mx-auto">
              <InternalLinker
                content="מגוון שירותים מקיף לפתיחת עוסק פטור וליווי חודשי - הכל במקום אחד"
                currentPage="Services"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid - Full Details */}
      <section className="py-20 bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={getServiceLink(service)}>
                   <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-elegant-hover transition-all h-full group">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: service.color + '20' }}
                    >
                      <div className="w-7 h-7 text-2xl" style={{ color: service.color }}>
                        {service.icon === 'FileText' && '📄'}
                        {service.icon === 'Laptop' && '💻'}
                        {service.icon === 'Calculator' && '🧮'}
                        {service.icon === 'Receipt' && '🧾'}
                        {service.icon === 'BarChart3' && '📊'}
                        {service.icon === 'XCircle' && '❌'}
                        {service.icon === 'Shield' && '🛡️'}
                        {service.icon === 'Building2' && '🏢'}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-2 group-hover:text-[#D4AF37] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    {service.features && (
                      <ul className="space-y-2">
                        {service.features.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 flex items-center text-[#1E3A5F] font-medium group-hover:text-[#D4AF37] transition-colors">
                      <span>קרא עוד</span>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* GEO Content */}
          <div className="mt-16">
            <GeoContent title="מטפלים בעוסקים פטורים בכל רחבי הארץ" showStats={false} />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MicroCTA text="רוצה לשמוע עוד על השירותים?" cta="שיחה קצרה ללא התחייבות" />
      </div>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-4">
              לא בטוח מה מתאים לך?
            </h2>
            <div className="text-gray-600 text-lg mb-8">
              <InternalLinker
                content="צור קשר לייעוץ חינם ונעזור לך לפתוח עוסק פטור ולמצוא את השירות המתאים"
                currentPage="Services"
              />
            </div>
            <Link to={createPageUrl('Contact')}>
              <Button 
                size="lg"
                className="h-14 px-8 text-lg font-bold rounded-full bg-[#1E3A5F] hover:bg-[#2C5282]"
              >
                לייעוץ חינם
                <ArrowLeft className="mr-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      </main>
    </>
  );
}