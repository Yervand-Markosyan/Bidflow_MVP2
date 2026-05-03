
import React from 'react';
import { Language } from '../types';

interface AboutPageProps {
  lang: Language;
}

export const AboutPage: React.FC<AboutPageProps> = ({ lang }) => {
  const t = {
    en: {
      h1: "The New Standard",
      h1Accent: "for Procurement",
      p1: "Bidflow is a unified digital marketplace designed to bridge the trust gap between buyers and sellers. We create a high-integrity ecosystem that rewards quality and reliability.",
      buyerTitle: "For Professional Buyers",
      buyerDesc: "Sourcing goods and services should be fast, transparent, and data-driven. Bidflow empowers procurement teams to:",
      buyerLi1: "Deploy Bids Globally",
      buyerLi2: "Access Pre-Verified Vendor Pools",
      buyerLi3: "Analyze Real-Time Comparative Bids",
      sellerTitle: "For Verified Suppliers",
      sellerDesc: "Scale your business by connecting with high-intent enterprise buyers. Bidflow helps you grow through:",
      sellerLi1: "Direct Reach to Active RFPs",
      sellerLi2: "Digital Portfolio Showcase",
      sellerLi3: "Automated Lead Qualification",
      modernTitle: "Built for Modern Markets",
      modernDesc: "Our platform is optimized for diverse industries including Tech Infrastructure, Real Estate, Energy, and Enterprise Services.",
      tags: ['Bidding', 'Digital Procurement', 'Smart Sourcing', 'Verified Supply', 'Global Trade']
    },
    ar: {
      h1: "المعيار الجديد",
      h1Accent: "للمشتريات",
      p1: "بيدفلو هو سوق رقمي موحد مصمم لسد فجوة الثقة بين المشترين والبائعين. نحن ننشئ نظاماً عالي النزاهة يكافئ الجودة والموثوقية.",
      buyerTitle: "للمشترين المحترفين",
      buyerDesc: "يجب أن يكون توريد السلع والخدمات سريعاً وشفافاً وقائماً على البيانات. بيدفلو يمكّن فرق المشتريات من:",
      buyerLi1: "نشر العطاءات عالمياً",
      buyerLi2: "الوصول إلى قوائم الموردين المعتمدين مسبقاً",
      buyerLi3: "تحليل العطاءات المقارنة في الوقت الفعلي",
      sellerTitle: "للموردين المعتمدين",
      sellerDesc: "قم بتوسيع نطاق عملك من خلال التواصل مع مشتري الشركات ذوي النوايا العالية. يساعدك بيدفلو على النمو من خلال:",
      sellerLi1: "الوصول المباشر إلى طلبات العروض النشطة",
      sellerLi2: "عرض المحفظة الرقمية",
      sellerLi3: "التأهيل الآلي للعملاء المحتملين",
      modernTitle: "بني للأسواق الحديثة",
      modernDesc: "تم تحسين منصتنا لقطاعات متنوعة تشمل البنية التحتية التقنية، والعقارات، والطاقة، وخدمات الشركات.",
      tags: ['المناقصات', 'المشتريات الرقمية', 'التوريد الذكي', 'التوريد المعتمد', 'التجارة العالمية']
    }
  }[lang];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24 py-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <section className="space-y-16">
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black text-brand-slate tracking-tight leading-tight">
            {t.h1} <span className="inline-block px-4 py-1 bg-brand-slate text-brand-primary rounded-2xl rotate-[1deg] italic">{t.h1Accent}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            {t.p1}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="p-12 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-saas group hover:border-brand-primary/20 transition-all">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-8 text-brand-slate font-black">01</div>
            <h2 className="text-2xl font-black text-brand-slate mb-6">{t.buyerTitle}</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">
              {t.buyerDesc}
            </p>
            <ul className="space-y-4">
              {[t.buyerLi1, t.buyerLi2, t.buyerLi3].map((li, idx) => (
                <li key={idx} className="flex items-center gap-4 text-sm font-bold text-brand-slate uppercase tracking-widest">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  {li}
                </li>
              ))}
            </ul>
          </article>

          <article className="p-12 rounded-[3rem] bg-brand-slate text-white shadow-saas group hover:border-brand-primary/20 transition-all border border-transparent">
            <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center mb-8 text-brand-slate font-black">02</div>
            <h2 className="text-2xl font-black text-brand-primary mb-6">{t.sellerTitle}</h2>
            <p className="text-slate-400 font-medium leading-relaxed mb-10">
              {t.sellerDesc}
            </p>
            <ul className="space-y-4">
              {[t.sellerLi1, t.sellerLi2, t.sellerLi3].map((li, idx) => (
                <li key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-300 uppercase tracking-widest">
                  <div className="w-2 h-2 bg-brand-primary rounded-full"></div>
                  {li}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-slate-50 p-12 md:p-24 rounded-[4rem] border border-slate-100 text-center space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -ml-32 -mb-32"></div>
        
        <div className="relative z-10 space-y-8">
          <h2 className="text-3xl md:text-5xl font-black text-brand-slate tracking-tight">{t.modernTitle}</h2>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
            {t.modernDesc}
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            {t.tags.map(tag => (
              <span key={tag} className="px-6 py-3 bg-white text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 text-slate-600 shadow-saas">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};