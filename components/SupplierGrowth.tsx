import React from 'react';
import { Users } from 'lucide-react';
import { Language } from '../types';
import { SupplierGrowthChart } from './SupplierGrowthChart';

interface SupplierGrowthProps {
  lang: Language;
}

export const SupplierGrowth: React.FC<SupplierGrowthProps> = ({ lang }) => {
  const t = {
    en: {
      title: "Expand Your Market",
      subtitle: "Connect with more buyers and increase your revenue potential.",
      buyersReached: "Buyers reached",
      growth: "Potential revenue growth",
      requests: "Requests received",
      activeSuppliers: "Active suppliers in network"
    },
    ar: {
      title: "وسع سوقك",
      subtitle: "تواصل مع المزيد من المشترين وزد من إمكانات إيراداتك.",
      buyersReached: "المشترون الذين تم الوصول إليهم",
      growth: "نمو الإيرادات المحتمل",
      requests: "الطلبات المستلمة",
      activeSuppliers: "الموردون النشطون في الشبكة"
    }
  }[lang];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-brand-slate tracking-tight mb-6">{t.title}</h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">{t.subtitle}</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Stats Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100 shadow-saas group hover:border-brand-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-white rounded-xl shadow-saas flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-brand-primary" />
              </div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{t.buyersReached}</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-brand-slate">45</span>
                <span className="text-brand-blue font-bold text-sm">+1,400%</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">From 3 buyers in Month 1</p>
            </div>

            <div className="p-8 bg-brand-slate rounded-2xl shadow-saas relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-primary/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
              <div className="text-sm font-bold text-white uppercase tracking-wider mb-2 relative z-10">{t.requests}</div>
              <div className="text-4xl font-black text-white relative z-10">128</div>
              <p className="text-xs text-white/70 mt-2 relative z-10">Average monthly requests per supplier</p>
            </div>
          </div>

          {/* Right: Chart Column */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex-grow">
              <SupplierGrowthChart />
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/supplier${i}/100/100`} 
                        alt="Supplier" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-brand-primary flex items-center justify-center text-[10px] font-bold text-brand-slate">
                    +500
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-600">{t.activeSuppliers}</span>
              </div>
              <div className="hidden md:block h-2 w-32 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-brand-primary"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};