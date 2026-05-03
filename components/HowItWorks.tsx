
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Send, BarChart3, CheckCircle2, ArrowRight } from 'lucide-react';
import { Language } from '../types';

interface HowItWorksProps {
  lang: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ lang }) => {
  const t = {
    en: {
      title: "How Bidflow Works",
      steps: [
        { title: "Post material request", desc: "Specify what you need and when.", icon: <FileText className="w-6 h-6" /> },
        { title: "Suppliers submit offers", desc: "Verified suppliers send their best bids.", icon: <Send className="w-6 h-6" /> },
        { title: "Compare offers", desc: "Choose the best price and save time.", icon: <BarChart3 className="w-6 h-6" /> },
        { title: "Select best deal", desc: "Finalize the deal and start delivery.", icon: <CheckCircle2 className="w-6 h-6" /> }
      ]
    },
    ar: {
      title: "كيف يعمل بيدفلو",
      steps: [
        { title: "أرسل طلب مواد", desc: "حدد ما تحتاجه ومتى.", icon: <FileText className="w-6 h-6" /> },
        { title: "الموردون يقدمون العروض", desc: "يرسل الموردون المعتمدون أفضل عروضهم.", icon: <Send className="w-6 h-6" /> },
        { title: "قارن العروض", desc: "اختر أفضل سعر ووفر الوقت.", icon: <BarChart3 className="w-6 h-6" /> },
        { title: "اختر أفضل صفقة", desc: "أنهِ الصفقة وابدأ التسليم.", icon: <CheckCircle2 className="w-6 h-6" /> }
      ]
    }
  }[lang];

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-20 tracking-tight text-brand-slate">
            {t.title}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-px bg-slate-100 -z-10"></div>
            
            {t.steps.map((step, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-2xl shadow-saas border border-slate-100 flex items-center justify-center mb-8 group-hover:border-brand-primary transition-colors relative">
                  <div className="text-brand-slate">{step.icon}</div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-brand-slate text-white rounded-full flex items-center justify-center text-xs font-bold border-4 border-white">
                    {idx + 1}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-brand-slate">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
                
                {/* Arrow for desktop */}
                {idx < t.steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-[-10%] translate-x-1/2 text-slate-200">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};