import React from 'react';
import { motion } from 'framer-motion';

export default function OsekMorshaSteps() {
  return (
    <main className="pt-20 min-h-screen bg-[#F8F9FA]">
      <section className="bg-gradient-to-br from-[#1E3A5F] to-[#2C5282] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white"
          >
            פתיחת עוסק מורשה – שלבים
          </motion.h1>
        </div>
      </section>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="text-gray-600">דף בתיקיה - בקרוב</p>
      </section>
    </main>
  );
}