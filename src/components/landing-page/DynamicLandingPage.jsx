import React from 'react';
import { Phone, MessageCircle, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
                            <header key={idx} className="relative bg-[var(--primary)] text-white py-20 px-6 text-center overflow-hidden">
                                <div className="max-w-4xl mx-auto relative z-10">
                                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                        {section.title}
                                    </h1>
                                    <p className="text-xl md:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">
                                        {section.subtitle}
                                    </p>
                                    <Button 
                                        className="bg-white text-[var(--primary)] hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-bold shadow-lg transition-transform hover:scale-105"
                                        onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        {section.ctaText || 'לפרטים נוספים'}
                                        <ArrowLeft className="mr-2 w-5 h-5" />
                                    </Button>
                                </div>
                                {/* Abstract BG Shapes */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
                                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-black rounded-full blur-3xl"></div>
                                </div>
                            </header>
                        );

                    case 'features':
                        return (
                            <section key={idx} className="py-20 px-6 bg-gray-50">
                                <div className="max-w-6xl mx-auto">
                                    {section.title && (
                                        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                                            {section.title}
                                        </h2>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {section.items?.map((item, itemIdx) => (
                                            <div key={itemIdx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-4">
                                                    <Check className="w-6 h-6 text-[var(--primary)]" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                                <p className="text-gray-600 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        );

                    case 'contact':
                        return (
                            <section key={idx} id="contact" className="py-20 px-6 bg-white">
                                <div className="max-w-md mx-auto text-center">
                                    <h2 className="text-3xl font-bold mb-8">
                                        {section.title || 'יצירת קשר'}
                                    </h2>
                                    <div className="space-y-4">
                                        {section.phone && (
                                            <a 
                                                href={`tel:${section.phone}`}
                                                className="flex items-center justify-center gap-3 w-full bg-gray-900 text-white py-4 rounded-xl font-medium hover:bg-black transition-colors"
                                            >
                                                <Phone className="w-5 h-5" />
                                                <span>{section.phone}</span>
                                            </a>
                                        )}
                                        {section.whatsapp && (
                                            <a 
                                                href={`https://wa.me/${section.whatsapp.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-xl font-medium hover:bg-[#128C7E] transition-colors"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );

                    default:
                        return null;
                }
            })}

            <footer className="bg-gray-50 py-8 text-center text-sm text-gray-500 border-t border-gray-100">
                <p>© {new Date().getFullYear()} {data.business_name}. כל הזכויות שמורות.</p>
            </footer>
        </div>
    );
}