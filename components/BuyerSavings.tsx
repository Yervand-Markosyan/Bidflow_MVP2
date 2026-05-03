import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { BuyerSavingsChart } from './BuyerSavingsChart';

interface BuyerSavingsProps {
  lang: Language;
}

export const BuyerSavings: React.FC<BuyerSavingsProps> = ({ lang }) => {
  const t = {
    en: {
      title: "How Buyers Save Money",
      step1: "Post Request",
      step2: "Suppliers Bid",
      step3: "Compare & Save",
      marketPrice: "Market price",
      bestOffer: "Best offer",
      savings: "Buyer saves"
    },
    ar: {
      title: "كيف يوفر المشترون المال",
      step1: "أرسل الطلب",
      step2: "الموردون يقدمون عروض",
      step3: "قارن ووفر",
      marketPrice: "سعر السوق",
      bestOffer: "أفضل عرض",
      savings: "توفر"
    }
  }[lang];

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-brand-slate tracking-tight mb-6">{t.title}</h2>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-saas border border-slate-100">
              <div className="w-6 h-6 bg-brand-slate text-white rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
              <span className="text-sm font-bold text-slate-600">{t.step1}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-saas border border-slate-100">
              <div className="w-6 h-6 bg-brand-slate text-white rounded-full flex items-center justify-center text-[10px] font-bold">2</div>
              <span className="text-sm font-bold text-slate-600">{t.step2}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 hidden md:block" />
            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full shadow-saas border border-slate-100">
              <div className="w-6 h-6 bg-brand-slate text-white rounded-full flex items-center justify-center text-[10px] font-bold">3</div>
              <span className="text-sm font-bold text-slate-600">{t.step3}</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <BuyerSavingsChart />
          <div className="p-10 bg-brand-slate rounded-3xl text-white shadow-saas relative overflow-hidden">
            {/* Decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-center pb-6 border-b border-white/10">
                <span className="text-slate-400 font-medium">{t.marketPrice}</span>
                <span className="font-bold text-xl line-through text-slate-500">10,000 AED</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-brand-primary font-bold uppercase tracking-widest text-[10px]">{t.bestOffer}</span>
                  <div className="text-4xl font-black text-white">8,700 AED</div>
                </div>
                <div className="px-4 py-2 bg-brand-primary/20 text-brand-primary rounded-lg text-sm font-bold border border-brand-primary/30">
                  -13%
                </div>
              </div>
              
              <div className="pt-8 flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium text-sm">{t.savings}</span>
                  <div className="text-5xl font-black text-brand-primary">1,300 AED</div>
                </div>
                <div className="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center rotate-12">
                  <span className="text-brand-slate font-black text-xl">✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};