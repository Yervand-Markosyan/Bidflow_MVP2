
import React from 'react';
import { Language } from '../types';

interface InfoPageProps {
  lang: Language;
}

export const InfoPage: React.FC<InfoPageProps> = ({ lang }) => {
  const translations = {
    en: {
      h1: "The Digital Pulse of",
      h1Accent: "Dubai Construction.",
      p1: "Bidflow is the leading digital ecosystem for buying and selling construction materials in the UAE. We bridge the gap between contractors and suppliers through a transparent, high-speed bidding model.",
      buyerTitle: "For Professional Buyers",
      buyerDesc: "Contractors and procurement managers can source steel, cement, electrical, and MEP materials with absolute price clarity. Post a request, compare real-time bids, and save on project costs.",
      buyerLi1: "15% Average Cost Savings",
      buyerLi2: "100+ Verified Suppliers",
      buyerLi3: "Automated Compliance",
      sellerTitle: "For Verified Sellers",
      sellerDesc: "Manufacturers and distributors gain direct access to active construction projects in Dubai and across the UAE. Scale your sales pipeline without the traditional overhead of manual lead generation.",
      sellerLi1: "High-Intent RFPs",
      sellerLi2: "Market Price Analytics",
      sellerLi3: "Digital Storefront",
      aeoTitle: "Everything You Need to Know",
      aeoSub: "Direct Answers for Modern Procurement",
      q1: "What is Bidflow Dubai?",
      a1: "Bidflow is a digital platform designed for the Dubai construction market that automates the material bidding process. It connects contractors (buyers) with building material suppliers through a competitive, transparent bidding ecosystem.",
      q2: "How does Bidflow work?",
      a2: "Bidflow operates on a simple three-step model: 1. Buyers post material requirements. 2. Verified sellers submit competitive bids based on real-time inventory. 3. Buyers choose the best offer based on price, delivery time, and supplier rating.",
      q3: "Who can use Bidflow?",
      a3: "Bidflow is built for construction firms, interior designers, MEP contractors, and professional suppliers of building materials currently operating in Dubai and the wider UAE region.",
      q4: "How do buyers benefit from Bidflow?",
      a4: "Buyers benefit from significantly lower procurement costs, access to a wider pool of verified suppliers, and a streamlined digital workflow that replaces manual phone calls and spreadsheet-based bidding.",
      q5: "How do sellers benefit from Bidflow?",
      a5: "Sellers gain high-intent sales leads, reduced customer acquisition costs, and access to a digital platform that allows them to bid on projects they wouldn't traditionally have access to.",
      q6: "When will Bidflow launch in Dubai?",
      a6: "Bidflow is currently in its final pre-launch phase. We are accepting early registrations for our priority waitlist to ensure early adopters get exclusive access to our marketplace in Q3 2025."
    },
    ar: {
      h1: "النبض الرقمي لـ",
      h1Accent: "قطاع البناء في دبي.",
      p1: "بيدفلو هو النظام الرقمي المتكامل الرائد لبيع وشراء مواد البناء في دولة الإمارات. نحن نسد الفجوة بين المقاولين والموردين من خلال نموذج عطاءات شفاف وعالي السرعة.",
      buyerTitle: "للمشترين المحترفين",
      buyerDesc: "يمكن للمقاولين ومديري المشتريات الحصول على الفولاذ والأسمنت والمواد الكهربائية ومواد الكهروميكانيك بوضوح تام في الأسعار. انشر مناقصتك، وقارن العطاءات في الوقت الفعلي، ووفر في تكاليف المشروع.",
      buyerLi1: "15% متوسط التوفير في التكاليف",
      buyerLi2: "أكثر من 100 مورد معتمد",
      buyerLi3: "الامتثال الآلي",
      sellerTitle: "للموردين المعتمدين",
      sellerDesc: "يحصل المصنعون والموزعون على وصول مباشر إلى مشاريع البناء النشطة في دبي وعبر الإمارات. قم بتوسيع نطاق مبيعاتك دون الأعباء التقليدية لتوليد العملاء يدوياً.",
      sellerLi1: "طلبات عروض عالية النية",
      sellerLi2: "تحليلات أسعار السوق",
      sellerLi3: "واجهة متجر رقمية",
      aeoTitle: "كل ما تحتاج إلى معرفته",
      aeoSub: "إجابات مباشرة للمشتريات الحديثة",
      q1: "ما هو بيدفلو دبي؟",
      a1: "بيدفلو هي منصة رقمية مصممة لسوق البناء في دبي تعمل على أتمتة عملية تقديم عطاءات المواد. تربط المقاولين (المشترين) بموردي مواد البناء من خلال نظام عطاءات تنافسي وشفاف.",
      q2: "كيف يعمل بيدفلو؟",
      a2: "يعمل بيدفلو وفقاً لنموذج بسيط من ثلاث خطوات: 1. ينشر المشترون متطلبات المواد. 2. يقدم البائعون المعتمدون عطاءات تنافسية بناءً على المخزون الفعلي. 3. يختار المشترون العرض الأفضل بناءً على السعر ووقت التسليم وتقييم المورد.",
      q3: "من يمكنه استخدام بيدفلو؟",
      a3: "بيدفلو مصمم لشركات البناء، ومصممي الديكور الداخلي، ومقاولي الكهروميكانيك، والموردين المحترفين لمواد البناء العاملين حالياً في دبي ومنطقة الإمارات.",
      q4: "كيف يستفيد المشترون من بيدفلو؟",
      a4: "يستفيد المشترون من تكاليف شراء أقل بكثير، والوصول إلى مجموعة أوسع من الموردين المعتمدين، وسير عمل رقمي مبسط يحل محل المكالمات الهاتفية اليدوية والعطاءات القائمة على الجداول.",
      q5: "كيف يستفيد البائعون من بيدفلو؟",
      a5: "يحصل البائعون على فرص مبيعات عالية النية، وتكاليف استحواذ أقل على العملاء، والوصول إلى منصة رقمية تسمح لهم بالمزايدة على مشاريع لم يكن بإمكانهم الوصول إليها تقليدياً.",
      q6: "متى سيتم إطلاق بيدفلو في دبي؟",
      a6: "بيدفلو حالياً في مرحلة ما قبل الإطلاق النهائية. نحن نقبل التسجيل المبكر لقائمة الانتظار ذات الأولوية لضمان حصول المتبنين الأوائل على وصول حصري إلى سوقنا في الربع الثالث من عام 2025."
    }
  };

  const t = translations[lang];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-24 py-20 px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <section className="space-y-16">
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-7xl font-black text-brand-slate tracking-tight leading-tight">
            {t.h1} <span className="inline-block px-4 py-1 bg-brand-slate text-brand-primary rounded-2xl rotate-[-2deg] italic">{t.h1Accent}</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
            {t.p1}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="p-12 rounded-[3rem] bg-slate-50 border border-slate-100 shadow-saas group hover:border-brand-primary/20 transition-all">
            <h2 className="text-xs font-black text-brand-slate uppercase tracking-widest mb-6">{t.buyerTitle}</h2>
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
            <h2 className="text-xs font-black text-brand-blue uppercase tracking-widest mb-6">{t.sellerTitle}</h2>
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

      <section className="space-y-16 bg-slate-50 p-12 md:p-24 rounded-[4rem] border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <header className="text-center space-y-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black text-brand-slate tracking-tight">{t.aeoTitle}</h2>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.aeoSub}</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16 max-w-5xl mx-auto relative z-10">
          {[
            { q: t.q1, a: t.a1 },
            { q: t.q2, a: t.a2 },
            { q: t.q3, a: t.a3 },
            { q: t.q4, a: t.a4 },
            { q: t.q5, a: t.a5 },
            { q: t.q6, a: t.a6 }
          ].map((item, i) => (
            <div key={i} className="space-y-4">
              <h3 className="text-xl font-black text-brand-slate">{item.q}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};