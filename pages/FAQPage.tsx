
import React from 'react';
import { Language } from '../types';

interface FAQPageProps {
  lang: Language;
}

export const FAQPage: React.FC<FAQPageProps> = ({ lang }) => {
  const t = {
    en: {
      h1: "Common Questions",
      h1Sub: "Essential Information about Bidflow",
      knowledge: "Bidflow Knowledge Base",
      protocol: "Transparent Bidding Protocols",
      security: "Supply Chain Security",
      standard: "Smart Procurement Standards",
      faqs: [
        {
          q: "What is Bidflow?",
          a: "Bidflow is a high-speed digital platform that automates the bidding process. It bridges the gap between organizations needing services and suppliers capable of providing them."
        },
        {
          q: "How does the bidding work?",
          a: "Bidflow follows a secure model: Buyers post detailed requirements, verified sellers submit bids, and our platform helps compare them across price, timeline, and history."
        },
        {
          q: "Who is the platform for?",
          a: "Bidflow is built for procurement managers, small business owners, contractors, and manufacturers looking for a modern way to manage their supply chain."
        },
        {
          q: "What makes Bidflow unique?",
          a: "Our focus is on integrity and flow. We use smart verification to ensure all participants are high-quality, and our UI is designed to minimize friction at every step."
        },
        {
          q: "How do I get early access?",
          a: "By joining our waitlist today! Early registrants will receive priority access to our beta phase and exclusive platform benefits."
        },
        {
          q: "When is the official launch?",
          a: "We are currently in final development with a Dubai-focused launch scheduled for late 2025. Stay tuned for updates via email."
        }
      ]
    },
    ar: {
      h1: "الأسئلة الشائعة",
      h1Sub: "معلومات أساسية حول بيدفلو",
      knowledge: "قاعدة معرفة بيدفلو",
      protocol: "بروتوكولات العطاءات الشفافة",
      security: "أمن سلسلة التوريد",
      standard: "معايير المشتريات الذكية",
      faqs: [
        {
          q: "ما هو بيدفلو؟",
          a: "بيدفلو هي منصة رقمية عالية السرعة تعمل على أتمتة عملية تقديم العطاءات والمناقصات. وهي تسد الفجوة بين المؤسسات التي تحتاج إلى خدمات والموردين القادرين على تقديمها."
        },
        {
          q: "كيف تعمل عملية المزايدة؟",
          a: "يتبع بيدفلو نموذجاً آمناً: ينشر المشترون متطلبات مفصلة، ويقدم البائعون المعتمدون عطاءاتهم، وتساعد منصتنا في مقارنتها عبر السعر والجدول الزمني والتاريخ."
        },
        {
          q: "لمن هذه المنصة؟",
          a: "بيدفلو مخصص لمديري المشتريات، وأصحاب الشركات الصغيرة، والمقاولين، والمصنعين الذين يبحثون عن طريقة حديثة لإدارة سلسلة التوريد الخاصة بهم."
        },
        {
          q: "ما الذي يجعل بيدفلو فريداً؟",
          a: "تركيزنا ينصب على النزاهة والتدفق. نحن نستخدم التحقق الذكي لضمان جودة جميع المشاركين، وصممت واجهتنا لتقليل الاحتكاك في كل خطوة."
        },
        {
          q: "كيف يمكنني الحصول على وصول مبكر؟",
          a: "من خلال الانضمام إلى قائمة الانتظار اليوم! سيحصل المسجلون الأوائل على أولوية الوصول إلى مرحلتنا التجريبية ومزايا المنصة الحصرية."
        },
        {
          q: "متى سيتم الإطلاق الرسمي؟",
          a: "نحن حالياً في مرحلة التطوير النهائية مع إطلاق يركز على دبي في أواخر عام 2025. ترقبوا التحديثات عبر البريد الإلكتروني."
        }
      ]
    }
  }[lang];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-20 py-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-black text-brand-slate tracking-tight leading-tight">{t.h1}</h1>
        <p className="text-lg text-slate-500 font-medium max-w-2xl mx-auto">{t.h1Sub}</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {t.faqs.map((item, i) => (
          <article key={i} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-saas hover:border-brand-primary/20 transition-all group">
            <h3 className="text-xl font-black text-brand-slate mb-4 group-hover:text-brand-blue transition-colors">{item.q}</h3>
            <p className="text-slate-500 leading-relaxed font-medium">{item.a}</p>
          </article>
        ))}
      </div>

      <section className="text-center py-16 border-t border-slate-100 space-y-8">
        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.knowledge}</h2>
        <div className="flex flex-wrap justify-center gap-8">
          {[t.protocol, t.security, t.standard].map((text, idx) => (
            <p key={idx} className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">{text}</p>
          ))}
        </div>
      </section>
    </div>
  );
};