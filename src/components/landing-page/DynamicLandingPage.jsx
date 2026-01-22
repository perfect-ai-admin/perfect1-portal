import React, { useState } from 'react';
import { Phone, MessageCircle, Check, ArrowLeft, ChevronDown, Send, Star, User, Clock, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

export default function DynamicLandingPage({ data }) {
    if (!data) return null;

    const { primary_color, sections_json } = data;

    // Helper to inject dynamic styles
    const themeStyle = {
        '--primary': primary_color || '#3B82F6',
    };

    return (
        <div style={themeStyle} className="min-h-screen bg-white text-gray-900 font-sans" dir="rtl">
            {sections_json?.map((section, idx) => {
                switch (section.type) {
                    case 'hero':
                        return (
                            <header key={idx} className="relative bg-[var(--primary)] text-white py-24 px-6 text-center overflow-hidden">
                                <div className="max-w-4xl mx-auto relative z-10">
                                    <motion.h1 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight"
                                    >
                                        {section.title}
                                    </motion.h1>
                                    <motion.p 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto font-light"
                                    >
                                        {section.subtitle}
                                    </motion.p>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <Button 
                                            className="bg-white text-[var(--primary)] hover:bg-gray-100 text-lg px-10 py-8 rounded-full font-bold shadow-xl transition-transform hover:scale-105"
                                            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                        >
                                            {section.ctaText || 'לפרטים נוספים'}
                                            <ArrowLeft className="mr-2 w-5 h-5" />
                                        </Button>
                                    </motion.div>
                                </div>
                                {/* Abstract BG Shapes */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black rounded-full blur-3xl"></div>
                                </div>
                            </header>
                        );

                    case 'pain_points':
                        return (
                            <section key={idx} className="py-20 px-6 bg-red-50/50">
                                <div className="max-w-5xl mx-auto">
                                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
                                        {section.title}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="bg-white p-8 rounded-2xl shadow-sm border-t-4 border-red-400">
                                                <h3 className="text-xl font-bold mb-3 text-red-600">{item.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'features':
                        return (
                            <section key={idx} className="py-20 px-6 bg-white">
                                <div className="max-w-6xl mx-auto">
                                    <div className="text-center mb-16">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
                                        {section.subtitle && <p className="text-xl text-gray-500">{section.subtitle}</p>}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="group p-8 rounded-3xl bg-gray-50 hover:bg-[var(--primary)] hover:text-white transition-all duration-300">
                                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                                    <Check className="w-7 h-7 text-[var(--primary)]" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                                <p className="text-gray-500 group-hover:text-blue-100 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'process':
                        return (
                            <section key={idx} className="py-20 px-6 bg-gray-900 text-white overflow-hidden relative">
                                <div className="max-w-5xl mx-auto relative z-10">
                                    <h2 className="text-3xl font-bold text-center mb-16">{section.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                                        {/* Connecting Line (Desktop) */}
                                        <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-gray-700 -z-10" />
                                        
                                        {section.steps?.map((step, stepIdx) => (
                                            <div key={stepIdx} className="text-center relative">
                                                <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg shadow-[var(--primary)]/30 border-4 border-gray-900">
                                                    {stepIdx + 1}
                                                </div>
                                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                                <p className="text-gray-400">{step.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'testimonials':
                        return (
                            <section key={idx} className="py-20 px-6 bg-blue-50/50">
                                <div className="max-w-5xl mx-auto">
                                    <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">{section.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {section.items?.map((item, itemIdx) => (
                                            <Card key={itemIdx} className="border-none shadow-md">
                                                <CardContent className="pt-8 px-6 pb-6">
                                                    <div className="flex gap-1 mb-4">
                                                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                                                    </div>
                                                    <p className="text-gray-600 mb-6 italic leading-relaxed">"{item.text}"</p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <User className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm">{item.name}</div>
                                                            <div className="text-xs text-gray-500">{item.role || 'לקוח ממליץ'}</div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'faq':
                        return (
                            <section key={idx} className="py-20 px-6 bg-white">
                                <div className="max-w-3xl mx-auto">
                                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title}</h2>
                                    <Accordion type="single" collapsible className="w-full">
                                        {section.items?.map((item, itemIdx) => (
                                            <AccordionItem key={itemIdx} value={`item-${itemIdx}`}>
                                                <AccordionTrigger className="text-right text-lg font-medium hover:no-underline hover:text-[var(--primary)]">
                                                    {item.question}
                                                </AccordionTrigger>
                                                <AccordionContent className="text-gray-600 text-base leading-relaxed">
                                                    {item.answer}
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            </section>
                        );

                    case 'contact':
                        return (
                            <section key={idx} id="contact" className="py-24 px-6 bg-gray-50">
                                <div className="max-w-5xl mx-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 md:p-12 shadow-xl">
                                        <div>
                                            <h2 className="text-3xl font-bold mb-4 text-gray-900">
                                                {section.title || 'יצירת קשר'}
                                            </h2>
                                            <p className="text-lg text-gray-600 mb-10">
                                                {section.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם'}
                                            </p>
                                            
                                            <div className="space-y-6">
                                                {section.phone && (
                                                    <a 
                                                        href={`tel:${section.phone}`}
                                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                                    >
                                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                                                            <Phone className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">טלפון</div>
                                                            <div className="text-gray-600">{section.phone}</div>
                                                        </div>
                                                    </a>
                                                )}
                                                {section.whatsapp && (
                                                    <a 
                                                        href={`https://wa.me/${section.whatsapp.replace(/[^0-9]/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                                    >
                                                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                                                            <MessageCircle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">WhatsApp</div>
                                                            <div className="text-gray-600">שלחו הודעה</div>
                                                        </div>
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-4 p-4">
                                                     <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                                                        <Clock className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">זמינות</div>
                                                        <div className="text-gray-600">א׳-ה׳ 09:00-18:00</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                                            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                                {section.form_fields?.includes('name') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
                                                        <Input placeholder="ישראל ישראלי" className="bg-white" />
                                                    </div>
                                                )}
                                                
                                                {section.form_fields?.includes('phone') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
                                                        <Input placeholder="050-0000000" type="tel" className="bg-white" />
                                                    </div>
                                                )}
                                                
                                                {section.form_fields?.includes('email') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
                                                        <Input placeholder="your@email.com" type="email" className="bg-white" />
                                                    </div>
                                                )}

                                                {section.form_fields?.includes('message') && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">הודעה</label>
                                                        <Textarea placeholder="ספר לנו במה אפשר לעזור..." className="bg-white resize-none" rows={4} />
                                                    </div>
                                                )}

                                                <Button className="w-full h-12 text-lg bg-[var(--primary)] hover:brightness-110 shadow-lg mt-2">
                                                    {section.ctaText || 'שלח פרטים'}
                                                    <Send className="mr-2 w-4 h-4" />
                                                </Button>
                                                
                                                <p className="text-center text-xs text-gray-400 mt-4">
                                                    <Shield className="w-3 h-3 inline-block ml-1" />
                                                    הפרטים שלך מאובטחים ולא יעברו לצד ג׳
                                                </p>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        );

                    default:
                        return null;
                }
            })}

            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-right">
                        <h4 className="text-xl font-bold mb-2">{data.business_name}</h4>
                        <p className="text-gray-400 text-sm">כל הזכויות שמורות © {new Date().getFullYear()}</p>
                    </div>
                    <div className="flex gap-4">
                        {/* Social Links placeholders */}
                    </div>
                </div>
            </footer>
        </div>
    );
}