import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Loader2, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function CreditsPage() {
    const [downloadCredits, setDownloadCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(null);

    useEffect(() => {
        loadCredits();
    }, []);

    const loadCredits = async () => {
        try {
            const res = await base44.functions.invoke('getDownloadCredits', {});
            setDownloadCredits(res.data?.download_credits || 0);
        } catch (err) {
            toast.error('Failed to load credits');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCredits = async (amount) => {
        setAdding(amount);
        try {
            const res = await base44.functions.invoke('addDownloadCredits', {
                amount,
                reason: `manual_topup_${amount}`
            });
            setDownloadCredits(res.data?.download_credits || 0);
            toast.success(`Added ${amount} download credits! 🎉`);
        } catch (err) {
            toast.error('Error: ' + err.message);
        } finally {
            setAdding(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8" dir="rtl">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full">
                        <Zap className="w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900">Buy Download Credits</h1>
                    <p className="text-gray-600">Unlock and download your logos with download credits</p>
                </div>

                {/* Current Credits */}
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-3">
                    <p className="text-gray-600 text-lg">Your Download Credits</p>
                    <p className="text-6xl font-bold text-purple-600">{downloadCredits}</p>
                    <p className="text-sm text-gray-500">Use 1 credit to unlock and download any logo</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-purple-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(downloadCredits * 10, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Credit Packages */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 text-center">Add Download Credits</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { amount: 1, price: '₪19', best: false },
                            { amount: 5, price: '₪79', best: true },
                            { amount: 10, price: '₪149', best: false }
                        ].map(pkg => (
                            <div 
                                key={pkg.amount}
                                className={`relative rounded-2xl p-6 transition-all ${
                                    pkg.best 
                                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl scale-105' 
                                        : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {pkg.best && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1 rounded-full text-sm font-bold">
                                        Best Deal
                                    </div>
                                )}
                                <div className="text-4xl font-bold mb-2">{pkg.amount}</div>
                                <div className={`text-sm mb-4 ${pkg.best ? 'text-white/80' : 'text-gray-500'}`}>
                                    Download Credits
                                </div>
                                <Button
                                    onClick={() => handleAddCredits(pkg.amount)}
                                    disabled={adding === pkg.amount}
                                    className={`w-full h-12 font-bold ${
                                        pkg.best 
                                            ? 'bg-white text-blue-600 hover:bg-gray-50' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {adding === pkg.amount ? (
                                        <>
                                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Gift className="w-4 h-4 ml-2" />
                                            Add {pkg.amount} Credits
                                        </>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 space-y-3">
                    <h3 className="font-bold text-gray-900">How it works</h3>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex gap-2">
                            <span className="text-purple-600 font-bold">1.</span>
                            <span>Generate 3 free logo previews per project</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-600 font-bold">2.</span>
                            <span>Like a logo? Use 1 download credit to unlock it</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-600 font-bold">3.</span>
                            <span>Download your logo in high quality</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-purple-600 font-bold">4.</span>
                            <span>Continue generating more free previews</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}