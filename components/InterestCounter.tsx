
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';

interface InterestCounterProps {
  lang: Language;
  buyersCount: number;
  suppliersCount: number;
  totalCount?: number;
}

export const InterestCounter: React.FC<InterestCounterProps> = ({ lang, buyersCount, suppliersCount, totalCount }) => {
  const total = totalCount || (buyersCount + suppliersCount);
  const goal = 500;
  const progress = Math.min((total / goal) * 100, 100);

  const t = {
    en: {
      title: "Join the Dubai launch list",
      subtitle: "Join the growing community of construction professionals preparing for the digital shift.",
      goal: `Goal: ${goal} early users`,
      current: `Current: ${total}`,
      joinNow: "Join now"
    },
    ar: {
      title: "الاهتمام بإطلاق دبي",
      subtitle: "انضم إلى المجتمع المتنامي من محترفي البناء الذين يستعدون للتحول الرقمي.",
      goal: `الهدف: ${goal} مستخدم مبكر`,
      current: `الحالي: ${total}`,
      joinNow: "انضم الآن"
    },
    hy: {
      title: "Միացեք Դուբայի գործարկման ցուցակին",
      subtitle: "Միացեք շինարարության ոլորտի մասնագետների աճող համայնքին, ովքեր պատրաստվում են թվային անցմանը:",
      goal: `Նպատակ՝ ${goal} վաղ օգտատեր`,
      current: `Ընթացիկ՝ ${total}`,
      joinNow: "Միացեք հիմա"
    }
  }[lang];

  return (
    <section id="interest" className="py-24 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto bg-brand-slate rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-saas">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="relative z-10">
            <div className="text-center space-y-8 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black !text-white tracking-tight leading-tight">{t?.title}</h2>
              <button 
                onClick={() => document.getElementById('registration-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary px-8 py-3 rounded-full font-bold"
              >
                {t.joinNow}
              </button>
              <p className="text-slate-400 text-lg font-medium">{t.subtitle}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span className="text-brand-primary">{t.current}</span>
                  <span>{t.goal}</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${progress}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-brand-primary rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                  ></motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};