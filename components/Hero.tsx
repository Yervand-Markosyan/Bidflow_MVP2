
import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { ArrowRight, CheckCircle2, Package, Search } from 'lucide-react';

interface HeroProps {
  lang: Language;
  onBuyerClick: () => void;
  onSupplierClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, onBuyerClick, onSupplierClick }) => {
  const t = {
    en: {
      badge: "Coming soon in Dubai",
      headline: "Get the best price for construction materials",
      subtext: "The digital standard for construction bidding in the UAE. Connect with verified suppliers and streamline your procurement in minutes.",
      primaryCTA: "Post Request",
      secondaryCTA: "Explore Platform",
      preview: {
        request: "Material Request",
        item: "Ready-mix Concrete C40/50",
        qty: "500 m³",
        offers: "4 active offers",
        bestPrice: "Best price: 245 AED/m³",
        sample: "Sample Preview"
      }
    },
    ar: {
      badge: "قريباً في دبي",
      headline: "احصل على أفضل سعر لمواد البناء",
      subtext: "المعيار الرقمي لمناقصات البناء في الإمارات. تواصل مع موردين معتمدين وقم بتبسيط مشترياتك في دقائق.",
      primaryCTA: "أرسل طلبًا",
      secondaryCTA: "استكشف المنصة",
      preview: {
        request: "طلب مواد",
        item: "خرسانة جاهزة C40/50",
        qty: "500 م³",
        offers: "4 عروض نشطة",
        bestPrice: "أفضل سعر: 245 درهم/م³",
        sample: "عرض توضيحي"
      }
    },
    hy: {
      badge: "Շուտով Դուբայում",
      headline: "Ստացեք շինանյութերի լավագույն գինը",
      subtext: "Շինարարական մրցույթների թվային ստանդարտը ԱՄԷ-ում: Կապվեք ստուգված մատակարարների հետ և օպտիմալացրեք ձեր գնումները րոպեների ընթացքում:",
      primaryCTA: "Տեղադրել հարցում",
      secondaryCTA: "Բացահայտել հարթակը",
      preview: {
        request: "Նյութի հարցում",
        item: "Ready-mix Concrete C40/50",
        qty: "500 մ³",
        offers: "4 ակտիվ առաջարկ",
        bestPrice: "Լավագույն գին: 245 AED/մ³",
        sample: "Օրինակ"
      }
    }
  }[lang];

  return (
    <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none hidden lg:block">
        <img 
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop" 
          alt="Dubai Skyline" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: Content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-slate text-xs font-bold uppercase tracking-wider mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-primary"></span>
              </span>
              {t.badge}
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-brand-slate tracking-tight leading-[1.05] mb-8"
            >
              {t.headline}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed"
            >
              {t.subtext}
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <button 
                onClick={onBuyerClick}
                className="btn-primary w-full sm:w-auto px-8 py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {t.primaryCTA}
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
                onClick={onSupplierClick}
                className="btn-white w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                {t.secondaryCTA}
              </button>
            </motion.div>
          </div>

          {/* Right Side: Platform Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="relative"
          >
            <div className="shadow-saas rounded-2xl overflow-hidden bg-white border border-slate-200">
              {/* Mock Browser Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                </div>
                <div className="mx-auto bg-white border border-slate-200 rounded-md px-3 py-1 text-[10px] text-slate-400 w-1/2 text-center">
                  bidflow.ae/dashboard
                </div>
              </div>
              
              {/* Mock Dashboard Content */}
              <div className="p-6 bg-slate-50/50 relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-brand-slate">{t.preview.request}</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-brand-slate/5 text-brand-slate/30 text-[8px] font-black rounded uppercase tracking-tighter border border-brand-slate/5">
                      {t.preview.sample}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase tracking-wider">Active</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-brand-slate">{t.preview.item}</div>
                    <div className="text-xs text-slate-500">{t.preview.qty}</div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{t.preview.offers}</div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${i === 1 ? 'bg-brand-primary/5 border-brand-primary/30' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">S{i}</div>
                        <div>
                          <div className="text-[11px] font-bold text-brand-slate">Supplier {i}</div>
                          <div className="text-[9px] text-slate-400">Verified Partner</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[11px] font-bold ${i === 1 ? 'text-brand-slate' : 'text-slate-500'}`}>{245 + (i-1)*15} AED/m³</div>
                        {i === 1 && <div className="text-[9px] text-brand-blue font-bold">Best Price</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-saas border border-slate-100 flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-brand-slate flex items-center gap-1.5">
                  {t.preview.request} {lang === 'en' ? 'Filed' : lang === 'ar' ? 'تم الإرسال' : 'Ուղարկված է'}
                  <span className="text-[8px] opacity-30 font-black uppercase tracking-tighter">({t.preview.sample})</span>
                </div>
                <div className="text-[10px] text-slate-500">Saved 12,500 AED</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};