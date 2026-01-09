import React from 'react';
import { motion } from 'framer-motion';
import SEOOptimized from './SEOOptimized';

export default function Team() {
  const teamMembers = [
    {
      name: 'יוסי כהן',
      role: 'מייסד ורואה חשבון מוסמך',
      bio: 'בעל ניסיון של 20 שנה בחשבונאות וניהול עוסקים פטורים בישראל',
      image: '👨‍💼'
    }
  ];

  return (
    <>
      <SEOOptimized
        title="הצוות שלנו | Perfect One"
        description="פגשו את הצוות המקצועי של Perfect One - המומחים לפתיחת עוסקים פטורים בישראל"
        canonical="https://perfect1.co.il/Team"
      />
      <main className="pt-32 min-h-screen bg-gradient-to-b from-[#F8F9FA] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#1E3A5F] mb-4">הצוות שלנו</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              מומחים בעלי ניסיון רב בפתיחת עוסקים פטורים בישראל
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-6xl mb-4">{member.image}</div>
                <h3 className="text-2xl font-bold text-[#1E3A5F] mb-2">{member.name}</h3>
                <p className="text-[#D4AF37] font-semibold mb-3">{member.role}</p>
                <p className="text-gray-600">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}