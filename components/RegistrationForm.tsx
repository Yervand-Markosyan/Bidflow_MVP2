
import React, { useState } from 'react';
import { Page, Language } from '../types';
import { saveUserRegistration, trackEvent } from '../services/trackingService';

interface RegistrationFormProps {
  onSubmit: (email: string, role: 'buyer' | 'seller') => void;
  onNavigate: (page: Page) => void;
  lang: Language;
}

interface InsightItem {
  title: string;
  desc: string;
  target: Page;
  icon: React.ReactNode;
  color: string;
  accent: string;
  iconBg: string;
  iconColor: string;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, onNavigate, lang }) => {
  const [role, setRole] = useState<'buyer' | 'seller' | null>(null);
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const translations = {
    en: {
      step1: "Step 1: Select your role",
      step2: "Step 2: Notification details",
      buyer: "I am a Buyer",
      buyerSub: "Sourcing materials",
      seller: "I am a Seller",
      sellerSub: "Offering inventory",
      emailDesc: "Leave your email to receive an exclusive invitation and be the first to know the moment we launch our platform in Dubai.",
      emailPlaceholder: "Enter your professional email",
      btn: "Get Notified",
      limitMsg: "Strictly limited early access program",
      errorEmail: "Please enter a valid business email address.",
      alreadyMsg: "This email is already registered. Thank you for your interest!",
      insight1Title: "Fast Track",
      insight1Desc: "Our digital RFP engine cuts procurement cycles by 70%, moving your projects at Dubai speed.",
      insight2Title: "Cost Edge",
      insight2Desc: "Unmatched pricing transparency that has saved early adopters up to 18% on bulk material costs.",
      insight3Title: "Dubai 2040",
      insight3Desc: "A procurement platform built for the future, fully aligned with the UAE's digital master plan.",
      explore: "Explore Insight"
    },
    ar: {
      step1: "الخطوة الأولى: اختر دورك",
      step2: "الخطوة الثانية: تفاصيل الإشعارات",
      buyer: "أنا مشتري",
      buyerSub: "أبحث عن مواد",
      seller: "أنا بائع",
      sellerSub: "أقدم مخزوناً",
      emailDesc: "اترك بريدك الإلكتروني لتلقي دعوة حصرية وتكون أول من يعلم لحظة إطلاق منصتنا في دبي.",
      emailPlaceholder: "أدخل بريدك الإلكتروني العملي",
      btn: "أبلغني عند الإطلاق",
      limitMsg: "برنامج الوصول المبكر المحدود للغاية",
      errorEmail: "يرجى إدخال عنوان بريد إلكتروني عملي صالح.",
      alreadyMsg: "هذا البريد الإلكتروني مسجل بالفعل. شكراً لاهتمامكم!",
      insight1Title: "المسار السريع",
      insight1Desc: "محرك طلبات العروض الرقمي يقلل دورات الشراء بنسبة 70%، مما يحرك مشاريعك بسرعة دبي.",
      insight2Title: "ميزة التكلفة",
      insight2Desc: "شفافية لا تضاهى في الأسعار وفرت للمتبنين الأوائل ما يصل إلى 18% من تكاليف المواد.",
      insight3Title: "دبي 2040",
      insight3Desc: "منصة مشتريات بنيت للمستقبل، تتماشى تماماً مع الخطة الرقمية الشاملة لدولة الإمارات.",
      explore: "استكشف المزيد"
    }
  };

  const t = translations[lang];

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setIsAlreadyRegistered(false);
    
    if (!role || !email || !isEmailValid) {
      return;
    }

    const normalizedEmail = email.toLowerCase();

    if (window.bidflow) {
      window.bidflow.trackEarlyAccess(email, role === 'buyer' ? 'Buyer' : 'Supplier');
    }

    const result = await saveUserRegistration({
      email: normalizedEmail,
      role: role === 'buyer' ? 'buyer' : 'supplier',
      source: 'early_access'
    });

    if (result.alreadyExists) {
      setIsAlreadyRegistered(true);
      return;
    }

    if (result.success) {
      trackEvent('quick_registration', {
        email: normalizedEmail,
        user_code: result.code || '',
        role: role === 'buyer' ? 'buyer' : 'supplier',
        registration_type: 'quick'
      });
    }

    onSubmit(email, role);
  };

  const isRoleError = attemptedSubmit && !role;
  const isEmailError = attemptedSubmit && (!email || !isEmailValid);

  const insights: InsightItem[] = [
    {
      title: t.insight1Title,
      desc: t.insight1Desc,
      target: 'info',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />,
      color: "yellow",
      accent: "from-yellow-400/20 to-transparent",
      iconBg: "bg-yellow-400/10",
      iconColor: "text-yellow-600"
    },
    {
      title: t.insight2Title,
      desc: t.insight2Desc,
      target: 'faq',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
      color: "slate",
      accent: "from-slate-900/10 to-transparent",
      iconBg: "bg-slate-900/5",
      iconColor: "text-slate-900"
    },
    {
      title: t.insight3Title,
      desc: t.insight3Desc,
      target: 'about',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
      color: "emerald",
      accent: "from-emerald-500/10 to-transparent",
      iconBg: "bg-emerald-500/5",
      iconColor: "text-emerald-600"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="max-w-2xl mx-auto space-y-12">
        <div className="space-y-4 text-start relative">
          <div className="flex justify-between items-end">
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${isRoleError ? 'text-red-500' : 'text-slate-400'}`}>
              {t.step1}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-5 relative">
            <button
              type="button"
              onClick={() => { setRole('buyer'); }}
              className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                role === 'buyer' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02] z-10' 
                  : isRoleError 
                    ? 'bg-white border-red-200 text-slate-400 hover:border-yellow-400/50'
                    : 'bg-white border-slate-400 text-slate-400 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-100/30'
              }`}
            >
              {role === 'buyer' && (
                <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-10 h-10 bg-yellow-400 flex items-center justify-center ${lang === 'ar' ? 'rounded-br-xl' : 'rounded-bl-xl'}`}>
                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                role === 'buyer' 
                  ? 'bg-yellow-400 text-slate-900 scale-110 shadow-lg shadow-yellow-400/20' 
                  : 'bg-slate-50 text-slate-700 group-hover:bg-yellow-50 group-hover:text-yellow-500 group-hover:scale-105'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <span className={`font-black uppercase tracking-widest text-xs transition-colors ${role === 'buyer' ? 'text-white' : 'text-slate-900 opacity-70 group-hover:opacity-100'}`}>{t.buyer}</span>
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider transition-colors ${role === 'buyer' ? 'text-slate-400' : 'text-slate-400 group-hover:text-slate-500'}`}>{t.buyerSub}</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('seller'); }}
              className={`flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-500 group relative overflow-hidden ${
                role === 'seller' 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02] z-10' 
                  : isRoleError 
                    ? 'bg-white border-red-200 text-slate-400 hover:border-slate-900/50'
                    : 'bg-white border-slate-400 text-slate-400 hover:border-slate-900/50 hover:shadow-xl hover:shadow-slate-100/50'
              }`}
            >
              {role === 'seller' && (
                <div className={`absolute top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} w-10 h-10 bg-yellow-400 flex items-center justify-center ${lang === 'ar' ? 'rounded-br-xl' : 'rounded-bl-xl'}`}>
                  <svg className="w-5 h-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 ${
                role === 'seller' 
                  ? 'bg-yellow-400 text-slate-900 scale-110 shadow-lg shadow-yellow-400/20' 
                  : 'bg-slate-50 text-slate-700 group-hover:bg-slate-100 group-hover:text-slate-900 group-hover:scale-105'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className={`font-black uppercase tracking-widest text-xs transition-colors ${role === 'seller' ? 'text-white' : 'text-slate-900 opacity-70 group-hover:opacity-100'}`}>{t.seller}</span>
              <span className={`text-[10px] font-bold mt-1 uppercase tracking-wider transition-colors ${role === 'seller' ? 'text-slate-400' : 'text-slate-400 group-hover:text-slate-500'}`}>{t.sellerSub}</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 text-start">
          <div className="space-y-1">
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors duration-300 ${isEmailError ? 'text-red-500' : isAlreadyRegistered ? 'text-emerald-500' : 'text-slate-400'}`}>
              {t.step2}
            </p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.emailDesc}</p>
          </div>
          <form 
            onSubmit={handleSubmit}
            className={`group bg-white p-3 rounded-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border transition-all duration-500 flex flex-col md:flex-row md:items-center gap-3 relative ${
              isFocused 
                ? 'border-yellow-400 ring-[12px] ring-yellow-50' 
                : isEmailError 
                  ? 'border-red-200 ring-[8px] ring-red-50' 
                  : isAlreadyRegistered 
                    ? 'border-emerald-200 ring-[8px] ring-emerald-50' 
                    : 'border-slate-400'
            }`}
          >
            <div className="flex flex-col md:flex-row flex-grow relative gap-3">
              <div className={`flex-grow relative rounded-2xl transition-all duration-300 border-2 ${
                isFocused 
                  ? 'border-slate-900 bg-white' 
                  : isEmailError 
                    ? 'border-red-300 bg-red-50/30' 
                    : isAlreadyRegistered 
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-400 bg-slate-50'
              }`}>
                <input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => { 
                    setEmail(e.target.value); 
                    if (attemptedSubmit) setAttemptedSubmit(false); 
                    if (isAlreadyRegistered) setIsAlreadyRegistered(false);
                  }}
                  className="w-full px-8 py-5 text-slate-900 placeholder-slate-400 bg-transparent outline-none border-0 focus:ring-0 text-lg font-semibold"
                />
              </div>
              
              <button
                type="submit"
                className="bg-yellow-400 text-slate-900 font-black px-12 py-5 md:py-4 rounded-2xl transition-all active:scale-[0.97] whitespace-nowrap text-xs uppercase tracking-[0.2em] shadow-xl shadow-yellow-200/50 hover:bg-yellow-500 hover:shadow-yellow-300/50"
              >
                {t.btn}
              </button>
            </div>
            {(isEmailError || isAlreadyRegistered) && (
              <div className={`absolute -bottom-10 ${lang === 'ar' ? 'right-4' : 'left-4'} flex items-center gap-2 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2 duration-300 ${isEmailError ? 'text-red-500' : 'text-emerald-600'}`}>
                {isEmailError ? (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {t.errorEmail}
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t.alreadyMsg}
                  </>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-500 bg-yellow-400"></span>
          {t.limitMsg}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-slate-100/50">
        {insights.map((item, idx) => (
          <div 
            key={idx}
            className="group relative flex flex-col p-8 rounded-2xl bg-white border border-slate-200 transition-all duration-500 hover:border-transparent hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden text-start"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                  <svg className={`w-7 h-7 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {item.icon}
                  </svg>
                </div>
                <button 
                  onClick={() => onNavigate(item.target)}
                  className={`opacity-0 group-hover:opacity-100 transition-all duration-500 transform ${lang === 'ar' ? '-translate-x-2 group-hover:translate-x-0' : 'translate-x-2 group-hover:translate-x-0'} hover:scale-110 active:scale-95`}
                  aria-label={t.explore}
                >
                  <div className={`w-8 h-8 rounded-full ${item.iconBg} flex items-center justify-center border border-transparent hover:border-current transition-colors`}>
                     <svg className={`w-3 h-3 ${item.iconColor} ${lang === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" />
                     </svg>
                  </div>
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-slate-900">
                  {item.title}
                </h4>
                <p className="text-[13px] text-slate-500 group-hover:text-slate-600 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 group-hover:border-slate-200/50 transition-colors">
                <button 
                  onClick={() => onNavigate(item.target)}
                  className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.iconColor} flex items-center gap-2 group/btn`}
                >
                  <span className="border-b-2 border-transparent group-hover/btn:border-current transition-all">{t.explore}</span>
                </button>
              </div>
            </div>
            <div className={`absolute -bottom-4 ${lang === 'ar' ? '-left-4' : '-right-4'} w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none`}>
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="2" fill="currentColor" />
                    <circle cx="30" cy="10" r="2" fill="currentColor" />
                    <circle cx="50" cy="10" r="2" fill="currentColor" />
                    <circle cx="10" cy="30" r="2" fill="currentColor" />
                    <circle cx="30" cy="30" r="2" fill="currentColor" />
                    <circle cx="50" cy="30" r="2" fill="currentColor" />
                </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};