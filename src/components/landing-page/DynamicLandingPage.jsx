import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Check, ArrowLeft, ChevronDown, Send, Star, User, Clock, Shield, Zap, AlertCircle, Award, TrendingUp, Users, ThumbsUp, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

export default function DynamicLandingPage({ data }) {
    if (!data) return null;

    const { primary_color, sections_json } = data;

    // Helper to inject dynamic styles with enhanced aesthetics
    const themeStyle = {
        '--primary': primary_color || '#2563EB',
        '--primary-dark': `${primary_color}99` || '#1E40AF', // Darker shade/opacity
        '--primary-light': `${primary_color}10` || '#EFF6FF', // Light tint
    };

    // Sticky CTA Logic
    const [showStickyCTA, setShowStickyCTA] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setShowStickyCTA(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToContact = () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });

    return (
        <div style={themeStyle} className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-[var(--primary)] selection:text-white pb-20 md:pb-0" dir="rtl">
            
            {/* Sticky Floating CTA for Mobile & Desktop */}
            <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-transform duration-300 transform ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="font-bold text-slate-900 text-lg">{data.business_name}</p>
                        <p className="text-sm text-slate-500">הפתרון המושלם עבורך במרחק קליק</p>
                    </div>
                    <Button 
                        onClick={scrollToContact}
                        className="w-full md:w-auto h-12 md:h-14 px-8 text-lg font-bold rounded-full bg-[var(--primary)] hover:brightness-110 shadow-lg shadow-[var(--primary)]/30 animate-pulse-glow"
                    >
                        {sections_json?.find(s => s.type === 'hero')?.ctaText || 'אני רוצה להתחיל'}
                        <ArrowLeft className="mr-2 w-5 h-5" />
                    </Button>
                </div>
            </div>

            {sections_json?.map((section, idx) => {
                switch (section.type) {
                    case 'hero':
                        const bgImage = section.image_prompt 
                            ? `https://image.pollinations.ai/prompt/${encodeURIComponent(section.image_prompt)}?width=1920&height=1080&nologo=true`
                            : null;

                        return (
                            <header key={idx} className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
                                {bgImage && (
                                    <div className="absolute inset-0 z-0">
                                        <img 
                                            src={bgImage} 
                                            alt="Background" 
                                            className="w-full h-full object-cover opacity-30 mix-blend-overlay" 
                                            loading="eager"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-900"></div>
                                    </div>
                                )}
                                
                                {/* Dynamic Glow Effects */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-[var(--primary)] rounded-full blur-[150px] opacity-20 animate-pulse"></div>

                                <div className="max-w-6xl mx-auto relative z-10 px-6 text-center mt-12">
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                    >
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-blue-100 text-sm font-medium mb-8">
                                            ✨ הפתרון המוביל בתחום
                                        </div>
                                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-black text-white mb-8 leading-[1.05] tracking-tight drop-shadow-2xl">
                                            {section.title}
                                        </h1>
                                        <p className="text-xl md:text-3xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                                            {section.subtitle}
                                        </p>
                                        
                                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                            <Button 
                                                className="h-16 px-12 text-xl rounded-full bg-[var(--primary)] text-white hover:brightness-110 hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(37,99,235,0.4)] font-bold border-t border-white/20"
                                                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                            >
                                                {section.ctaText || 'התחל עכשיו'}
                                                <ArrowLeft className="mr-2 w-6 h-6" />
                                            </Button>
                                            <Button 
                                                variant="ghost"
                                                className="h-16 px-12 text-xl rounded-full text-white hover:bg-white/5 transition-all duration-300"
                                                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                            >
                                                למידע נוסף
                                                <ChevronDown className="mr-2 w-6 h-6" />
                                            </Button>
                                        </div>
                                    </motion.div>
                                </div>
                            </header>
                        );

                    case 'stats':
                        return (
                            <section key={idx} className="py-20 bg-slate-50 relative z-20 -mt-20 px-6">
                                <div className="max-w-6xl mx-auto bg-white rounded-[2rem] shadow-xl p-12 md:p-16 border border-slate-100 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -z-10"></div>
                                     <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-slate-100">
                                         {section.items?.map((stat, i) => (
                                             <div key={i} className="pt-8 md:pt-0">
                                                 <div className="text-5xl md:text-6xl font-black text-[var(--primary)] mb-4 tracking-tight">{stat.value}</div>
                                                 <div className="text-xl text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
                                             </div>
                                         ))}
                                     </div>
                                </div>
                            </section>
                        );

                    case 'pain_points':
                        return (
                            <section key={idx} className="py-24 px-6 bg-white relative overflow-hidden">
                                <div className="max-w-6xl mx-auto">
                                    <div className="text-center max-w-3xl mx-auto mb-20">
                                        <span className="text-red-500 font-bold tracking-widest uppercase text-sm mb-4 block">האתגר</span>
                                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                                            {section.title}
                                        </h2>
                                        <div className="w-24 h-1.5 bg-red-500 mx-auto rounded-full"></div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <motion.div 
                                                key={itemIdx}
                                                whileHover={{ y: -10 }}
                                                className="bg-red-50/30 p-10 rounded-[2rem] border border-red-100 relative group overflow-hidden"
                                            >
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-[4rem] transition-all group-hover:bg-red-500/10"></div>
                                                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                                    <AlertCircle className="w-7 h-7" />
                                                </div>
                                                <h3 className="text-2xl font-bold mb-4 text-slate-900">{item.title}</h3>
                                                <p className="text-slate-600 leading-relaxed text-lg">{item.description}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'features':
                        return (
                            <section key={idx} id="features" className="py-32 px-6 bg-slate-900 text-white relative overflow-hidden">
                                {/* Background effects */}
                                <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--primary)] rounded-full blur-[150px] opacity-10"></div>

                                <div className="max-w-7xl mx-auto relative z-10">
                                    <div className="text-center mb-24">
                                        <div className="inline-block px-4 py-1 rounded-full border border-[var(--primary)] text-[var(--primary)] text-sm font-bold tracking-widest uppercase mb-6 bg-[var(--primary)]/10">
                                            למה אנחנו?
                                        </div>
                                        <h2 className="text-4xl md:text-6xl font-black mb-6">{section.title}</h2>
                                        {section.subtitle && <p className="text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">{section.subtitle}</p>}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="group relative">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--primary)] to-blue-600 rounded-[2rem] opacity-20 group-hover:opacity-100 transition duration-500 blur"></div>
                                                <div className="relative h-full bg-slate-900/95 backdrop-blur-xl p-8 rounded-[1.9rem] border border-white/10 hover:border-white/20 transition-all flex flex-col">
                                                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--primary)] to-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                                                        <Check className="w-8 h-8 text-white" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 group-hover:to-white transition-all">{item.title}</h3>
                                                    <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-20 text-center">
                                        <Button 
                                            onClick={scrollToContact}
                                            className="h-14 px-10 text-lg rounded-full bg-white text-slate-900 hover:bg-blue-50 font-bold transition-transform hover:scale-105"
                                        >
                                            אני רוצה לשמוע עוד
                                            <ArrowLeft className="mr-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        );

                    case 'process':
                        return (
                            <section key={idx} className="py-32 px-6 bg-slate-50">
                                <div className="max-w-6xl mx-auto">
                                    <h2 className="text-4xl md:text-5xl font-black text-center mb-24 text-slate-900">{section.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                                        {/* Connecting Line */}
                                        <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent -z-0" />
                                        
                                        {section.steps?.map((step, stepIdx) => (
                                            <div key={stepIdx} className="relative z-10">
                                                <div className="bg-white p-2 rounded-full w-24 h-24 mx-auto mb-8 shadow-xl shadow-slate-200">
                                                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-slate-800 rounded-full flex items-center justify-center text-3xl font-black text-white">
                                                        {stepIdx + 1}
                                                    </div>
                                                </div>
                                                <div className="text-center px-4">
                                                    <h3 className="text-2xl font-bold mb-4 text-slate-900">{step.title}</h3>
                                                    <p className="text-slate-600 text-lg leading-relaxed">{step.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'testimonials':
                        return (
                            <section key={idx} className="py-32 px-6 bg-white">
                                <div className="max-w-7xl mx-auto">
                                    <h2 className="text-4xl md:text-5xl font-black text-center mb-20 text-slate-900">{section.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="bg-slate-50 p-10 rounded-[2.5rem] relative">
                                                <div className="absolute top-10 right-10 text-6xl text-[var(--primary)] opacity-20 font-serif leading-none">"</div>
                                                <div className="flex gap-1 mb-8">
                                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400 drop-shadow-sm" />)}
                                                </div>
                                                <p className="text-xl text-slate-700 mb-10 leading-relaxed font-medium">"{item.text}"</p>
                                                <div className="flex items-center gap-5 border-t border-slate-200 pt-8">
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center shadow-inner">
                                                        <User className="w-7 h-7 text-slate-500" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg text-slate-900">{item.name}</div>
                                                        <div className="text-slate-500">{item.role || 'לקוח מרוצה'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'faq':
                        return (
                            <section key={idx} className="py-24 px-6 bg-slate-50">
                                <div className="max-w-4xl mx-auto">
                                    <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-slate-900">{section.title}</h2>
                                    <div className="space-y-6">
                                        {section.items?.map((item, itemIdx) => (
                                            <Card key={itemIdx} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                                <Accordion type="single" collapsible className="w-full bg-white">
                                                    <AccordionItem value={`item-${itemIdx}`} className="border-b-0">
                                                        <AccordionTrigger className="px-8 py-6 text-xl font-bold text-slate-800 hover:text-[var(--primary)] hover:no-underline text-right transition-colors">
                                                            {item.question}
                                                        </AccordionTrigger>
                                                        <AccordionContent className="px-8 pb-8 text-lg text-slate-600 leading-relaxed">
                                                            {item.answer}
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </Accordion>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'contact':
                        return (
                            <section key={idx} id="contact" className="py-32 px-6 bg-gradient-to-b from-white to-blue-50">
                                <div className="max-w-7xl mx-auto">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                                        <div>
                                            <span className="text-[var(--primary)] font-bold tracking-widest uppercase text-sm mb-4 block">דברו איתנו</span>
                                            <h2 className="text-5xl md:text-6xl font-black mb-8 text-slate-900 leading-tight">
                                                {section.title || 'מוכנים להתקדם?'}
                                            </h2>
                                            <p className="text-2xl text-slate-600 mb-12 font-light">
                                                {section.subtitle || 'השאירו פרטים ונחזור אליכם בהקדם לשיחת ייעוץ ללא עלות.'}
                                            </p>
                                            
                                            <div className="space-y-8">
                                                {section.phone && (
                                                    <a href={`tel:${section.phone}`} className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                                        <div className="w-16 h-16 bg-blue-50 text-[var(--primary)] rounded-full flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                                            <Phone className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xl text-slate-900">שיחת ייעוץ</div>
                                                            <div className="text-slate-500 text-lg dir-ltr text-right">{section.phone}</div>
                                                        </div>
                                                    </a>
                                                )}
                                                {section.whatsapp && (
                                                    <a href={`https://wa.me/${section.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all group">
                                                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors">
                                                            <MessageCircle className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-xl text-slate-900">WhatsApp</div>
                                                            <div className="text-slate-500 text-lg">זמינים גם בהודעות</div>
                                                        </div>
                                                    </a>
                                                )}
                                                <div className="flex items-center gap-3 text-slate-400 mt-8">
                                                    <Shield className="w-5 h-5" />
                                                    <span className="text-sm">הפרטים שלך מאובטחים ב-100% ולא יועברו לצד שלישי.</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 relative">
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)] rounded-full blur-[60px] opacity-20"></div>
                                            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
                                                {section.form_fields?.includes('name') && (
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">שם מלא</label>
                                                        <Input placeholder="ישראל ישראלי" className="h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                                                    </div>
                                                )}
                                                
                                                {section.form_fields?.includes('phone') && (
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">טלפון</label>
                                                        <Input placeholder="050-0000000" type="tel" className="h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                                                    </div>
                                                )}
                                                
                                                {section.form_fields?.includes('email') && (
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">אימייל</label>
                                                        <Input placeholder="your@email.com" type="email" className="h-14 text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl" />
                                                    </div>
                                                )}

                                                {section.form_fields?.includes('message') && (
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-2">הודעה</label>
                                                        <Textarea placeholder="כתבו לנו..." className="min-h-[140px] text-lg bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl resize-none" />
                                                    </div>
                                                )}

                                                <Button className="w-full h-16 text-xl font-bold bg-[var(--primary)] hover:bg-slate-900 shadow-xl shadow-blue-500/20 hover:shadow-2xl transition-all rounded-xl mt-4">
                                                    {section.ctaText || 'שליחת פרטים'}
                                                    <Send className="mr-2 w-5 h-5" />
                                                </Button>
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

            <footer className="bg-slate-900 text-white py-20 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-right">
                        <h4 className="text-3xl font-black mb-4 tracking-tight">{data.business_name}</h4>
                        <p className="text-slate-400 text-lg font-light">כל הזכויות שמורות © {new Date().getFullYear()}</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}