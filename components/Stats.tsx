
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface StatsProps {
  lang: Language;
}

export const Stats: React.FC<StatsProps> = ({ lang }) => {
  const t = {
    en: {
      title: "Already tested in a real market",
      buyers: "Buyers registered",
      suppliers: "Suppliers joined",
      bids: "Bids posted",
      note: "These results were achieved within 8 months on our platform Shintender in Armenia.",
      subNote: "Now expanding to Dubai"
    },
    ar: {
      title: "تم اختباره بالفعل في سوق حقيقي",
      buyers: "مشتري مسجل",
      suppliers: "مورد انضموا",
      tenders: "مناقصة منشورة",
      note: "تم تحقيق هذه النتائج خلال 8 أشهر على منصتنا شينتندر في أرمينيا.",
      subNote: "نتوسع الآن في دبي"
    }
  }[lang];

  const stats = [
    { value: "658", label: t.buyers },
    { value: "215", label: t.suppliers },
    { value: "203", label: t.bids }
  ];

  return (
    <section className="py-24 bg-slate-50 border-y border-slate-200">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-brand-slate tracking-tight mb-4">
              {t.title}
            </h2>
            <p className="text-slate-500 font-medium">{t.note}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-white rounded-2xl shadow-saas border border-slate-100 text-center group hover:border-brand-primary/50 transition-colors"
              >
                <div className="text-5xl font-black text-brand-slate mb-3 group-hover:text-brand-blue transition-colors">{stat.value}</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-slate text-white rounded-full text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
              {t.subNote}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};