import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, Users, Shield, Star, Briefcase } from 'lucide-react';
import SEOOptimized from './SEOOptimized';
import Breadcrumbs from '../components/seo/Breadcrumbs';
import LeadForm from '../components/forms/LeadForm';

export default function Team() {
  const breadcrumbs = [
    { label: 'דף הבית', url: '/' },
    { label: 'הצוות המקצועי שלנו' }
  ];

  const teamMembers = [
    {
      name: 'רו"ח יוסי כהן',
      role: 'מייסד ומנהל',
      image: '👨‍💼',
      credentials: ['רו"ח מוסמך', 'מומחה בחשבונאות עצמאים', '20+ שנות ניסיון'],
      description: 'יוסי ייסד את Perfect One מתוך חזון ליצור שירות מקצועי ונגיש לעצמאים. מתמחה בליווי עוסקים פטורים וייעוץ מיסוי.',
      expertise: ['מיסוי עצמאים', 'תכנון מס', 'ליווי עסקי']
    },
    {
      name: 'רו"ח שרה לוי',
      role: 'מנהלת חשבונות ראשית',
      image: '👩‍💼',
      credentials: ['רו"ח מוסמכת', 'מומחית בביטוח לאומי', '15+ שנות ניסיון'],
      description: 'שרה מתמחה בניהול חשבונות שוטף ובייעוץ לעוסקים פטורים. מטפלת במאות לקוחות ומובילה את מערך השירות.',
      expertise: ['ביטוח לאומי', 'דוחות שנתיים', 'ניהול שוטף']
    },
    {
      name: 'רו"ח דוד אברהם',
      role: 'יועץ מיסוי בכיר',
      image: '🧑‍💼',
      credentials: ['רו"ח מוסמך', 'יועץ מס בכיר', '18+ שנות ניסיון'],
      description: 'דוד מתמחה בתכנון מס מתקדם ובהתמודדות עם רשויות המס. מלווה לקוחות בביקורות ומסייע באופטימיזציה מיסויית.',
      expertise: ['תכנון מס', 'התנגדויות', 'ביקורות מס']
    }
  ];

  const certifications = [
    {
      icon: Award,
      title: 'רישיון רו"ח מאושר',
      description: 'כל הצוות מורכב מרואי חשבון מוסמכים עם רישיון תקף מלשכת רואי החשבון בישראל'
    },
    {
      icon: BookOpen,
      title: 'השתלמויות שנתיות',
      description: 'הצוות עובר השתלמויות מקצועיות שנתיות חובה כנדרש על פי חוק ותקנות לשכת רואי החשבון'
    },
    {
      icon: Shield,
      title: 'ביטוח אחריות מקצועית',
      description: 'כל חברי הצוות מבוטחים בביטוח אחריות מקצועית מלא בסכומים גבוהים'
    },
    {
      icon: Users,
      title: 'חברות בארגונים מקצועיים',
      description: 'חברים פעילים בלשכת רואי החשבון ובארגונים מקצועיים נוספים בתחום'
    }
  ];

  const stats = [
    { number: '15+', label: 'שנות ניסיון ממוצע' },
    { number: '2,000+', label: 'לקוחות מרוצים' },
    { number: '100%', label: 'רו"ח מוסמכים' },
    { number: '24h', label: 'זמן תגובה ממוצע' }
  ];

  return (
    <>
      <SEOOptimized 
        title="הצוות המקצועי שלנו - רואי חשבון מומחים | Perfect One"
        description="הכירו את הצוות המקצועי של Perfect One - רואי חשבון מוסמכים עם ניסיון של מעל 15 שנה בפתיחה וליווי של עוסקים פטורים בישראל."
        keywords={['רואי חשבון מוסמכים', 'צוות מקצועי', 'מומחי עוסק פטור', 'ייעוץ חשבונאי']}
        canonical="https://perfect1.co.il/Team"
        schema={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": {
            "@type": "ProfessionalService",
            "name": "Perfect One",
            "employee": teamMembers.map(member => ({
              "@type": "Person",
              "name": member.name,
              "jobTitle": member.role,
              "description": member.description,
              "hasCredential": member.credentials
            }))
          }
        }}
      />

      <div className="pt-20 bg-gradient-to-br from-gray-50 to-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumbs items={breadcrumbs} />

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-black text-[#1E3A5F] mb-6">
              הצוות המקצועי שלנו
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              רואי חשבון מוסמכים עם<strong> מעל 15 שנות ניסיון</strong> בתחום העצמאים.
              אנחנו לא סתם משרד רואי חשבון - אנחנו מומחים בעוסקים פטורים.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-100"
              >
                <div className="text-4xl font-black text-[#1E3A5F] mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Team Members */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              פגשו את המומחים שלנו
            </h2>
            <div className="space-y-8">
              {teamMembers.map((member, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] flex items-center justify-center text-5xl">
                        {member.image}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-[#1E3A5F] mb-1">{member.name}</h3>
                      <p className="text-[#D4AF37] font-semibold mb-4">{member.role}</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {member.credentials.map((cred, i) => (
                          <span 
                            key={i}
                            className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                          >
                            {cred}
                          </span>
                        ))}
                      </div>
                      <p className="text-gray-700 leading-relaxed mb-4">{member.description}</p>
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm font-bold text-gray-700 mb-2">תחומי מומחיות:</p>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((exp, i) => (
                            <span 
                              key={i}
                              className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-medium"
                            >
                              ✓ {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mb-20">
            <h2 className="text-3xl font-black text-[#1E3A5F] mb-10 text-center">
              אישורים והסמכות מקצועיות
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {certifications.map((cert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#27AE60]/10 flex items-center justify-center flex-shrink-0">
                      <cert.icon className="w-6 h-6 text-[#27AE60]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A5F] mb-2">{cert.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{cert.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] rounded-2xl p-10 mb-16 text-white"
          >
            <h2 className="text-3xl font-black mb-6 text-center">למה לבחור בנו?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
                <h3 className="font-bold text-xl mb-2">מומחיות בעוסקים פטורים</h3>
                <p className="text-white/90">
                  לא רק רואי חשבון - מומחים בדיוק בתחום שלך
                </p>
              </div>
              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
                <h3 className="font-bold text-xl mb-2">שירות אישי</h3>
                <p className="text-white/90">
                  לא מספרים - אנשים. נותנים מענה אישי לכל לקוח
                </p>
              </div>
              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4 text-[#D4AF37]" />
                <h3 className="font-bold text-xl mb-2">אחריות מלאה</h3>
                <p className="text-white/90">
                  עומדים מאחורי העבודה עם ביטוח אחריות מקצועית
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-[#1E3A5F] mb-4 text-center">
                רוצים להכיר את הצוות?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                קבעו שיחת היכרות ראשונית ללא עלות עם אחד המומחים שלנו
              </p>
              <LeadForm 
                title=""
                subtitle=""
                sourcePage="Team"
                variant="card"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}