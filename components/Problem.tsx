
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, TrendingUp, Layers, FileSearch } from 'lucide-react';
import { Language } from '../types';

interface ProblemProps {
  lang: Language;
}

export const Problem: React.FC<ProblemProps> = ({ lang }) => {
  const t = {
    en: {
      title: "The Procurement Problem",
      subtitle: "Traditional construction procurement is broken. Contractors lose time and money on manual processes.",
      p1: {
        title: "Inefficient Workflows",
        desc: "Calling 10+ suppliers for every single order is a massive drain on your team's productivity."
      },
      p2: {
        title: "Hidden Price Gaps",
        desc: "Material prices can vary by up to 30% between suppliers. Without comparison, you're overpaying."
      },
      p3: {
        title: "Comparison Chaos",
        desc: "Offers arrive in fragmented formats, making it nearly impossible to identify the true best deal."
      }
    },
    ar: {
      title: "مشكلة المشتريات",
      subtitle: "مشتريات البناء التقليدية معطلة. يفقد المقاولون الوقت والمال في العمليات اليدوية.",
      p1: {
        title: "سير عمل غير فعال",
        desc: "الاتصال بأكثر من 10 موردين لكل طلب هو استنزاف هائل لإنتاجية فريقك."
      },
      p2: {
        title: "فجوات الأسعار المخفية",
        desc: "يمكن أن تختلف أسعار المواد بنسبة تصل إلى 30٪ بين الموردين. بدون مقارنة، أنت تدفع أكثر من اللازم."
      },
      p3: {
        title: "فوضى المقارنة",
        desc: "تصل العروض بتنسيقات مجزأة، مما يجعل من المستحيل تقريبًا تحديد أفضل صفقة حقيقية."
      }
    }
  }[lang];

  const problems = [
    { icon: <Clock className="w-8 h-8" />, ...t.p1 },
    { icon: <TrendingUp className="w-8 h-8" />, ...t.p2 },
    { icon: <FileSearch className="w-8 h-8" />, ...t.p3 }
  ];

  return (
    <section id="problem" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20 space-y-6">
            <h2 className="text-4xl md:text-6xl font-black text-brand-slate tracking-tight leading-tight">{t.title}</h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">{t.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-brand-primary/30 transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform border border-slate-100">
                    <div className="text-brand-blue w-8 h-8">{p.icon}</div>
                  </div>
                  <h3 className="text-2xl font-black text-brand-slate mb-4">{p.title}</h3>
                  <p className="text-slate-500 font-medium text-base leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};