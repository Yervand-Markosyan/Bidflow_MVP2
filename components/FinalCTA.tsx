
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Rocket } from 'lucide-react';
import { Language } from '../types';
import { trackEvent, saveUserRegistration } from '../services/trackingService';

interface FinalCTAProps {
  lang: Language;
  onSubmit: (data: any) => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ lang, onSubmit }) => {
  const [role, setRole] = useState<'buyer' | 'supplier' | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [errors, setErrors] = useState({ role: false, email: false });
  const [hasStarted, setHasStarted] = useState(false);

  const startTracking = (selectedRole: 'buyer' | 'supplier') => {
    if (!hasStarted) {
      const eventName = selectedRole === 'buyer' ? 'material_request_started' : 'supplier_signup_started';
      trackEvent(eventName, { source: 'final_cta' });
      setHasStarted(true);
    }
  };

  const t = {
    en: {
      title: "Ready to Transform Your Construction Procurement?",
      subtitle: "Leave your email to be notified when Bidflow launches. We will notify you as soon as the platform goes live.",
      buyer: "I'm a Buyer",
      supplier: "I'm a Supplier",
      emailPlaceholder: "Enter your work email",
      btn: "Get Early Access",
      success: "You're on the list!",
      successMsg: "We've received your interest. We'll be in touch soon.",
      alreadyRegisteredMsg: "Thank you! This email is already registered. We will notify you when Bidflow launches.",
      roleError: "Please select your role.",
      emailError: "Please enter a valid email.",
      back: "Back"
    },
    ar: {
      title: "جاهز لتحويل مشتريات البناء الخاصة بك؟",
      subtitle: "اترك بريدك الإلكتروني ليتم إخطارك عند إطلاق بيدفلو. سنقوم بإخطارك بمجرد تشغيل المنصة.",
      buyer: "أنا مشتري",
      supplier: "أنا مورد",
      emailPlaceholder: "أدخل بريدك الإلكتروني للعمل",
      btn: "احصل على وصول مبكر",
      success: "أنت الآن على القائمة!",
      successMsg: "لقد استلمنا اهتمامك. سنتواصل معك قريبًا.",
      alreadyRegisteredMsg: "شكراً لك! هذا البريد الإلكتروني مسجل بالفعل. سنقوم بإبلاغك عند إطلاق بيدفلو.",
      roleError: "يرجى اختيار دورك.",
      emailError: "يرجى إدخال بريد إلكتروني صالح.",
      back: "رجوع"
    },
    hy: {
      title: "Պատրա՞ստ եք վերափոխել ձեր շինարարական գնումները:",
      subtitle: "Թողեք ձեր էլ. հասցեն՝ Bidflow-ի գործարկման մասին տեղեկանալու համար: Մենք կտեղեկացնենք ձեզ հենց որ հարթակը գործարկվի:",
      buyer: "Ես Գնորդ եմ",
      supplier: "Ես Մատակարար եմ",
      emailPlaceholder: "Մուտքագրեք ձեր աշխատանքային էլ. հասցեն",
      btn: "Ստանալ վաղ հասանելիություն",
      success: "Դուք ցուցակում եք:",
      successMsg: "Մենք ստացել ենք ձեր հայտը: Մենք շուտով կկապվենք ձեզ հետ:",
      alreadyRegisteredMsg: "Շնորհակալություն: Այս էլ. հասցեն արդեն գրանցված է: Մենք կտեղեկացնենք ձեզ, երբ Bidflow-ը գործարկվի:",
      roleError: "Խնդրում ենք ընտրել ձեր դերը:",
      emailError: "Խնդրում ենք մուտքագրել վավեր էլ. հասցե:",
      back: "Հետ"
    }
  }[lang];

  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlreadyRegistered(false);
    if (role) startTracking(role);
    const hasRoleError = !role;
    const hasEmailError = !validateEmail(email);

    if (hasRoleError || hasEmailError) {
      setErrors({ role: hasRoleError, email: hasEmailError });
      return;
    }

    const result = await saveUserRegistration({
      email: email.toLowerCase(),
      role: role,
      source: 'final_cta'
    });

    if (result.alreadyExists) {
      setAlreadyRegistered(true);
      return;
    }

    if (result.success) {
      trackEvent('quick_registration', {
        email: email.toLowerCase(),
        user_code: result.code || '',
        role: role,
        registration_type: 'quick'
      });
    }

    onSubmit({ role, email });
    setIsSubmitted(true);
  };

  const handleRoleSelect = (selectedRole: 'buyer' | 'supplier') => {
    setRole(selectedRole);
    setErrors(prev => ({ ...prev, role: false }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setAlreadyRegistered(false);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: false }));
    }
  };

  return (
    <section id="ready-to-transform" className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-brand-slate rounded-[4rem] p-12 md:p-24 text-center space-y-12 relative overflow-hidden shadow-saas">
            {/* Mesh Gradient Background */}
            <div className="absolute inset-0 mesh-gradient opacity-20"></div>
            
            <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="w-20 h-20 bg-brand-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(250,204,21,0.3)]"
              >
                <Rocket className="w-10 h-10 text-brand-slate" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black !text-white tracking-tighter leading-[1.1]">
                {t.title}
              </h2>
              <p className="text-slate-400 text-lg md:text-xl font-medium">
                {t.subtitle}
              </p>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              {alreadyRegistered ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 glass-card border-green-500/20 text-white rounded-[3rem] text-center space-y-8"
                >
                  <h3 className="text-3xl font-black text-green-500 leading-tight">{t.alreadyRegisteredMsg}</h3>
                  <button 
                    onClick={() => setAlreadyRegistered(false)}
                    className="px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-[#0f172a] rounded-2xl font-bold transition-all shadow-lg"
                  >
                    {t.back}
                  </button>
                </motion.div>
              ) : isSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 glass-card border-brand-primary/20 text-white rounded-[3rem] text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="w-8 h-8 bg-brand-primary rounded-full"></div>
                  </div>
                  <h3 className="text-3xl font-black text-brand-primary">{t.success}</h3>
                  <p className="text-slate-400 font-medium">{t.successMsg}</p>
                </motion.div>
              ) : (
                <form id="registration-form" onSubmit={handleSubmit} className="space-y-10">
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('buyer')}
                        className={`flex-1 px-8 py-5 rounded-2xl font-bold transition-all border-2 min-h-[44px] ${
                          role === 'buyer' 
                            ? 'btn-primary border-brand-primary' 
                            : errors.role 
                              ? 'bg-red-500/10 border-red-500 text-red-500'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {t.buyer}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRoleSelect('supplier')}
                        className={`flex-1 px-8 py-5 rounded-2xl font-bold transition-all border-2 min-h-[44px] ${
                          role === 'supplier' 
                            ? 'btn-primary border-brand-primary' 
                            : errors.role 
                              ? 'bg-red-500/10 border-red-500 text-red-500'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                      >
                        {t.supplier}
                      </button>
                    </div>
                    {errors.role && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 font-bold text-sm"
                      >
                        {t.roleError}
                      </motion.p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input 
                        type="email"
                        placeholder={t.emailPlaceholder}
                        value={email}
                        onChange={handleEmailChange}
                        className={`flex-grow p-5 bg-white border-2 rounded-2xl outline-none transition-all font-bold text-lg min-h-[44px] ${
                          errors.email ? 'border-red-500 focus:border-red-500' : 'border-slate-100 focus:border-brand-primary'
                        }`}
                      />
                      <button 
                        type="submit"
                        className="btn-primary px-10 py-5 rounded-2xl uppercase tracking-wider text-lg min-h-[44px] whitespace-nowrap"
                      >
                        {t.btn}
                      </button>
                    </div>
                    {errors.email && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 font-bold text-sm text-left px-2"
                      >
                        {t.emailError}
                      </motion.p>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};