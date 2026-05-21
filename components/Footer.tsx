
import React from 'react';
import { Language } from '../types';
import { trackEvent } from '../services/trackingService';

interface FooterProps {
  onNavigate: (id: string) => void;
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, lang }) => {
  const t = {
    en: {
      copy: `© ${new Date().getFullYear()} Bidflow Dubai. All rights reserved.`,
      tag: "Empowering Construction Through Digital Innovation",
      li: "LinkedIn",
      ig: "Instagram",
      contact: "Contact",
      operatedBy: "Operated by Shintender LLC Armenia",
      disclaimer: "Bidflow is currently conducting market validation in the UAE construction materials sector. The platform is not yet operational and does not facilitate commercial transactions. All submissions are part of an early access program used to understand market demand and supplier interest."
    },
    ar: {
      copy: `© ${new Date().getFullYear()} بيدفلو دبي. جميع الحقوق محفوظة.`,
      tag: "تمكين قطاع البناء من خلال الابتكار الرقمي",
      li: "لينكد إن",
      ig: "إنستغرام",
      contact: "اتصال",
      operatedBy: "تدار بواسطة Shintender LLC أرمينيا",
      disclaimer: "Bidflow تقوم حالياً بدراسة الطلب في سوق مواد البناء في دولة الإمارات. المنصة ليست قيد التشغيل بعد ولا تُجرى أي معاملات تجارية عبرها. جميع البيانات المرسلة هي جزء من برنامج الوصول المبكر بهدف فهم الطلب في السوق واهتمام الموردين."
    },
    hy: {
      copy: `© ${new Date().getFullYear()} Bidflow Dubai: Բոլոր իրավունքները պաշտպանված են:`,
      tag: "Շինարարության հզորացում թվային նորարարության միջոցով",
      li: "LinkedIn",
      ig: "Instagram",
      contact: "Կապ",
      operatedBy: "Ղեկավարվում է Shintender LLC Armenia-ի կողմից",
      disclaimer: "Bidflow-ն այժմ իրականացնում է շուկայի վավերացում ԱՄԷ շինարարական նյութերի ոլորտում: Հարթակը դեռևս չի գործում և չի իրականացնում առևտրային գործարքներ: Բոլոր ներկայացված հայտերը վաղ հասանելիության ծրագրի մաս են, որն օգտագործվում է շուկայի պահանջարկը և մատակարարների հետաքրքրությունը հասկանալու համար:"
    }
  }[lang];

  const handleSocialClick = (platform: 'linkedin' | 'instagram', url: string) => {
    trackEvent('social_click', { 
      platform_name: platform,
      target_url: url
    });
  };

  return (
    <footer className="w-full py-12 px-6 md:px-20 border-t border-slate-100 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand-slate rounded-xl flex items-center justify-center shadow-lg shadow-brand-slate/10">
                <svg 
                  id="Слой_1_Footer" 
                  data-name="Слой 1" 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 199.45 270.89"
                  className="w-4 h-4"
                >
                  <path 
                    fill="#FACC15" 
                    d="M156,125.62q30-22.62,30-56.76Q186,0,98.43,0H0V270.89H72.91V71.32H109.1a13.77,13.77,0,0,1,13.77,13.77h0A13.76,13.76,0,0,1,109.1,98.86H89.58V176H109.1a13.77,13.77,0,1,1,0,27.54H89.58v67.33h13.9c16.13,0,34.05-1.38,43.58-4.16A73.38,73.38,0,0,0,173.85,252q25.6-22,25.6-59.14Q199.45,144.48,156,125.62Z"
                  />
                </svg>
              </div>
              <span className="text-2xl font-black text-brand-slate tracking-tight">Bidflow<span className="text-brand-primary">.</span></span>
            </div>
            <p className="text-slate-500 font-medium max-w-sm">
              {t.tag}
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-brand-slate uppercase tracking-widest">{t.contact}</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="mailto:info@bidflow.ae" 
                  onClick={() => trackEvent('footer_email_click', { language: lang })}
                  className="text-slate-500 hover:text-brand-blue transition-colors font-medium"
                >
                  info@bidflow.ae
                </a>
              </li>
              <li>
                <div className="flex items-center gap-6 pt-2">
                  <a 
                    href="https://www.linkedin.com/company/bidflow%E2%80%A4ae/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => handleSocialClick('linkedin', 'https://www.linkedin.com/company/bidflow%E2%80%A4ae/')}
                    className="text-slate-400 hover:text-brand-slate transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{t.li}</span>
                  </a>
                  <a 
                    href="https://www.instagram.com/bidflow.uae" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    onClick={() => handleSocialClick('instagram', 'https://www.instagram.com/bidflow.uae')}
                    className="text-slate-400 hover:text-brand-slate transition-colors"
                  >
                    <span className="text-xs font-bold uppercase tracking-widest">{t.ig}</span>
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-xs font-medium text-center md:text-left">
              {t.copy}
            </div>
            <div className="text-slate-400 text-xs font-medium text-center md:text-right">
              {t.operatedBy}
            </div>
          </div>
          <div className="max-w-4xl">
            <p className="text-slate-400 text-[10px] md:text-xs leading-relaxed font-normal text-center md:text-left opacity-80">
              {t.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};