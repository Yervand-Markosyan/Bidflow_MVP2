
import React from 'react';
import { Language } from '../types';

interface NavbarProps {
  onNavigate: (id: string) => void;
  currentPage: string;
  lang: Language;
  onLangChange: (lang: Language) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, lang, onLangChange }) => {
  const translations = {
    en: {
      howItWorks: "How it works",
      demo: "Try Demo",
      suppliers: "Suppliers",
      interest: "Interest",
      dubai: "Dubai"
    },
    ar: {
      howItWorks: "كيف يعمل",
      demo: "جرب العرض",
      suppliers: "الموردون",
      interest: "الاهتمام",
      dubai: "دبي"
    }
  };

  const t = translations[lang];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="w-full py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-slate-200/50">
      <div 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-2.5 group cursor-pointer"
      >
        <div className="w-9 h-9 bg-brand-slate rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <svg 
            id="Слой_1" 
            data-name="Слой 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 199.45 270.89"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <title>Bidflow Logo</title>
            <path 
              fill="#FACC15" 
              d="M156,125.62q30-22.62,30-56.76Q186,0,98.43,0H0V270.89H72.91V71.32H109.1a13.77,13.77,0,0,1,13.77,13.77h0A13.76,13.76,0,0,1,109.1,98.86H89.58V176H109.1a13.77,13.77,0,1,1,0,27.54H89.58v67.33h13.9c16.13,0,34.05-1.38,43.58-4.16A73.38,73.38,0,0,0,173.85,252q25.6-22,25.6-59.14Q199.45,144.48,156,125.62Z"
            />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-brand-slate leading-none">
            Bidflow<span className="text-brand-primary">.</span>
          </span>
          <span className="text-[7px] font-bold text-slate-400 tracking-[0.3em] mt-0.5 uppercase">{t.dubai}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 md:gap-8">
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-brand-slate transition-colors cursor-pointer">{t.howItWorks}</button>
          <button onClick={() => scrollTo('buyer-demo')} className="hover:text-brand-slate transition-colors cursor-pointer">{t.demo}</button>
          <button onClick={() => scrollTo('supplier-demo')} className="hover:text-brand-slate transition-colors cursor-pointer">{t.suppliers}</button>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full border border-slate-200">
          <button 
            onClick={() => onLangChange('en')}
            aria-label="Switch to English"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${lang === 'en' ? 'bg-white shadow-sm scale-100' : 'opacity-50 hover:opacity-100 scale-90'}`}
          >
             <img src="https://flagcdn.com/w40/us.png" alt="English" className="w-4 h-4 object-contain" />
          </button>
          <button 
            onClick={() => onLangChange('ar')}
            aria-label="Switch to Arabic"
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${lang === 'ar' ? 'bg-white shadow-sm scale-100' : 'opacity-50 hover:opacity-100 scale-90'}`}
          >
             <img src="https://flagcdn.com/w40/ae.png" alt="Arabic" className="w-4 h-4 object-contain" />
          </button>
        </div>

        <button 
          onClick={() => scrollTo('buyer-demo')}
          className="btn-primary hidden sm:flex px-5 py-2 rounded-full text-xs uppercase tracking-widest"
        >
          {lang === 'en' ? 'Get Started' : 'ابدأ الآن'}
        </button>
      </div>
    </nav>
  );
};