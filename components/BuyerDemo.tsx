
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, Gift, ClipboardList } from 'lucide-react';
import { Language } from '../types';
import { trackEvent, saveUserRegistration } from '../services/trackingService';

interface BuyerDemoProps {
  lang: Language;
  onSubmit: (data: any) => void;
}

export const BuyerDemo: React.FC<BuyerDemoProps> = ({ lang, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    otherCategory: '',
    quantity: '',
    unit: '',
    location: '',
    email: '',
    companyName: '',
    role: 'Buyer / Contractor'
  });
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const t = {
    en: {
      quick: "Takes less than 30 seconds",
      title: "Try a sample material request",
      step1: "Material category",
      step2: "Estimated quantity",
      step2Unit: "Unit",
      step3: "Project location",
      step4: "Email and role",
      step4Benefit: "+ 6 months free access when Bidflow launches",
      categories: ["Cement", "Steel", "Electrical materials", "Plumbing materials", "Finishing materials", "Other"],
      otherPlaceholder: "Enter material name",
      quantityPlaceholder: "e.g. 40.5",
      locationPlaceholder: "e.g. Dubai Marina, Business Bay, Al Quoz, JVC",
      emailPlaceholder: "Email",
      companyPlaceholder: "Company name (optional)",
      roleLabel: "Role",
      roleValue: "Buyer / Contractor",
      next: "Next",
      back: "Back",
      submit: "Submit request",
      promo: "Early users receive 6 months free access when Bidflow launches.",
      success: "Request submitted!",
      successMsg: "We've received your sample request. You've earned 6 months of free access! We'll be in touch soon.",
      alreadyRegisteredMsg: "Thank you! This email is already registered. We will notify you when Bidflow launches.",
      stepLabel: "Step"
    },
    ar: {
      alreadyRegisteredMsg: "شكراً لك! هذا البريد الإلكتروني مسجل بالفعل. سنقوم بإبلاغك عند إطلاق بيدفلو.",
      quick: "يستغرق أقل من 30 ثانية",
      title: "جرب طلب مواد عينة",
      step1: "فئة المواد",
      step2: "الكمية التقديرية",
      step2Unit: "الوحدة",
      step3: "موقع المشروع",
      step4: "البريد الإلكتروني والدور",
      step4Benefit: "+ وصول مجاني لمدة 6 أشهر عند إطلاق بيدفلو",
      categories: ["أسمنت", "حديد", "مواد كهربائية", "مواد سباكة", "مواد تشطيب", "أخرى"],
      otherPlaceholder: "أدخل اسم المادة",
      quantityPlaceholder: "مثلاً 40.5",
      locationPlaceholder: "مثلاً دبي مارينا، الخليج التجاري، القوز، JVC",
      emailPlaceholder: "البريد الإلكتروني",
      companyPlaceholder: "اسم الشركة (اختياري)",
      roleLabel: "الدور",
      roleValue: "مشتري / مقاول",
      next: "التالي",
      back: "السابق",
      submit: "إرسال الطلب",
      promo: "يحصل المستخدمون الأوائل على وصول مجاني لمدة 6 أشهر عند إطلاق بيدفلو.",
      success: "تم إرسال الطلب!",
      successMsg: "لقد استلمنا طلب العينة الخاص بك. لقد حصلت على وصول مجاني لمدة 6 أشهر! سنتواصل معك قريبًا.",
      stepLabel: "خطوة"
    },
    hy: {
      quick: "Տևում է 30 վայրկյանից պակաս",
      title: "Փորձեք նմուշային նյութի հարցում",
      step1: "Նյութի կատեգորիա",
      step2: "Մոտավոր քանակ",
      step2Unit: "Միավոր",
      step3: "Նախագծի վայրը",
      step4: "Էլ. հասցե և դեր",
      step4Benefit: "+ 6 ամիս անվճար հասանելիություն, երբ Bidflow-ը գործարկվի",
      categories: ["Ցեմենտ", "Պողպատ", "Էլեկտրական նյութեր", "Ջրմուղի նյութեր", "Հարդարման նյութեր", "Այլ"],
      otherPlaceholder: "Մուտքագրեք նյութի անվանումը",
      quantityPlaceholder: "օր.՝ 40.5",
      locationPlaceholder: "օր.՝ Dubai Marina, Business Bay, Al Quoz, JVC",
      emailPlaceholder: "Էլ. հասցե",
      companyPlaceholder: "Ընկերության անվանումը (ըստ ցանկության)",
      roleLabel: "Դեր",
      roleValue: "Գնորդ / Կապալառու",
      next: "Հաջորդը",
      back: "Հետ",
      submit: "Ուղարկել հարցումը",
      promo: "Վաղ օգտատերերը ստանում են 6 ամիս անվճար հասանելիություն, երբ Bidflow-ը գործարկվի:",
      success: "Հարցումն ուղարկված է:",
      successMsg: "Մենք ստացել ենք ձեր նմուշային հարցումը: Դուք ստացել եք 6 ամիս անվճար հասանելիություն: Մենք շուտով կկապվենք ձեզ հետ:",
      alreadyRegisteredMsg: "Շնորհակալություն: Այս էլ. հասցեն արդեն գրանցված է: Մենք կտեղեկացնենք ձեզ, երբ Bidflow-ը գործարկվի:",
      stepLabel: "Քայլ"
    }
  }[lang];

  const units = ["piece", "box", "bag", "g", "kg", "ton", "mm", "cm", "m", "m²", "m³", "ml", "l"];
  
  const startTracking = () => {
    if (!hasStarted) {
      if (window.bidflow) {
        window.bidflow.trackBuyer(1, { source: 'buyer_demo' });
      }
      setHasStarted(true);
    }
  };

  const handleNext = () => {
    startTracking();
    if (step === 2 && !formData.unit) {
      setError(lang === 'en' ? 'Please select a unit.' : 'يرجى اختيار وحدة.');
      return;
    }
    setError('');
    
    const nextStep = step + 1;
    if (window.bidflow) {
      const data: any = { ...formData };
      if (step === 1) data.material_category = formData.category || formData.otherCategory;
      if (step === 2) data.material_quantity = `${formData.quantity} ${formData.unit}`;
      if (step === 3) data.location = formData.location;
      
      window.bidflow.trackBuyer(nextStep, data);
    }
    
    setStep(s => s + 1);
  };
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlreadyRegistered(false);
    
    if (window.bidflow) {
      window.bidflow.trackBuyer(5, {
        email: formData.email,
        company_name: formData.companyName,
        material_category: formData.category || formData.otherCategory,
        quantity: `${formData.quantity} ${formData.unit}`,
        location: formData.location
      });
    }

    const result = await saveUserRegistration({
      email: formData.email.toLowerCase(),
      role: 'buyer',
      company_name: formData.companyName,
      material_category: formData.category || formData.otherCategory,
      quantity: `${formData.quantity} ${formData.unit}`,
      location: formData.location,
      source: 'buyer_demo'
    });

    if (result.alreadyExists) {
      setAlreadyRegistered(true);
      return;
    }
    
    onSubmit(formData);
    setIsSubmitted(true);
  };

  const PromoBox = () => (
    <div className="p-6 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center gap-4 text-brand-slate">
      <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-saas">
        <Gift className="w-6 h-6 text-brand-slate" />
      </div>
      <p className="font-bold text-sm leading-tight">
        {t.promo}
      </p>
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-brand-slate shrink-0">1</span>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.step1}</label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {t.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFormData({ ...formData, category: cat });
                      if (cat !== 'Other' && cat !== 'أخرى') handleNext();
                    }}
                    className={`p-4 text-left rounded-xl border-2 transition-all font-bold text-sm ${
                      formData.category === cat 
                        ? 'border-brand-primary bg-brand-primary/5 text-brand-slate' 
                        : 'border-slate-100 bg-white hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {(formData.category === 'Other' || formData.category === 'أخرى') && (
                <motion.input 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  type="text"
                  autoFocus
                  placeholder={t.otherPlaceholder}
                  value={formData.otherCategory}
                  onChange={(e) => setFormData({ ...formData, otherCategory: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && formData.otherCategory && handleNext()}
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                />
              )}
            </div>
            {(formData.category === 'Other' || formData.category === 'أخرى') && formData.otherCategory && (
              <button onClick={handleNext} className="btn-primary w-full p-4 rounded-xl">
                {t.next}
              </button>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-brand-slate shrink-0">2</span>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.step2}</label>
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text"
                  inputMode="decimal"
                  autoFocus
                  placeholder={t.quantityPlaceholder}
                  value={formData.quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, '');
                    const parts = val.split('.');
                    const sanitized = parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
                    setFormData({ ...formData, quantity: sanitized });
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && formData.quantity && handleNext()}
                  className="w-full md:flex-[2] p-3 md:p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold text-base md:text-lg"
                />
                <select
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value });
                    setError('');
                  }}
                  className={`w-full md:flex-1 p-3 md:p-4 bg-white border-2 rounded-xl outline-none focus:border-brand-primary transition-all font-bold text-base md:text-lg ${error ? 'border-red-500' : 'border-slate-100'}`}
                >
                  <option value="">{lang === 'en' ? 'Select unit' : 'اختر الوحدة'}</option>
                  {units.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
            </div>
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 p-4 bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <ChevronLeft className="w-4 h-4" /> {t.back}
              </button>
              <button 
                disabled={!formData.quantity}
                onClick={handleNext} 
                className="btn-primary flex-[2] p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {t.next} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            key="step3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-brand-slate shrink-0">3</span>
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.step3}</label>
              </div>
              <input 
                type="text"
                autoFocus
                placeholder={t.locationPlaceholder}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && formData.location && handleNext()}
                className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold text-lg"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 p-4 bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <ChevronLeft className="w-4 h-4" /> {t.back}
              </button>
              <button 
                disabled={!formData.location}
                onClick={handleNext} 
                className="btn-primary flex-[2] p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {t.next} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-primary flex items-center justify-center text-[10px] font-black text-brand-slate shrink-0">4</span>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.step4}</label>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.roleLabel}</label>
                <input 
                  type="text"
                  readOnly
                  value={t.roleValue}
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.emailPlaceholder}</label>
                <input 
                  type="email"
                  autoFocus
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setAlreadyRegistered(false);
                  }}
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.companyPlaceholder}</label>
                <input 
                  type="text"
                  placeholder={t.companyPlaceholder}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                />
              </div>
            </div>

            <PromoBox />

            {alreadyRegistered && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                {t.alreadyRegisteredMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleBack} className="flex-1 p-4 bg-slate-50 text-slate-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <ChevronLeft className="w-4 h-4" /> {t.back}
              </button>
              <button 
                disabled={!formData.email.includes('@')}
                onClick={handleSubmit} 
                className="btn-primary flex-[2] p-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {t.submit}
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <section id="buyer-demo" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto p-12 bg-brand-slate rounded-3xl text-center space-y-6 shadow-saas border border-slate-800">
            <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-brand-slate" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{t.success}</h2>
            <p className="text-slate-400 font-medium text-lg">{t.successMsg}</p>
            <button 
              onClick={() => { setIsSubmitted(false); setStep(1); setFormData({ category: '', otherCategory: '', quantity: '', location: '', email: '', companyName: '', role: 'Buyer / Contractor' }); }}
              className="text-brand-primary font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Submit another request
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="buyer-demo" className="py-24 bg-slate-50 border-t border-slate-100 lg:border-t-0">
      <div className="container mx-auto px-6">
        {/* Mobile Separator */}
        <div className="flex lg:hidden items-center gap-4 mb-12">
          <div className="h-px bg-slate-200 flex-grow"></div>
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {t.stepLabel} {step}/4
          </div>
          <div className="h-px bg-slate-200 flex-grow"></div>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="relative">
            {/* Vertical connector line for desktop */}
            <div className="hidden lg:block absolute left-4 top-24 bottom-6 w-px bg-slate-200 -z-10"></div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/20 text-brand-slate rounded-full text-xs font-bold mb-6">
              <ClipboardList className="w-3 h-3" />
              {t.quick}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-slate tracking-tight mb-8 leading-tight">
              {t.title}
            </h2>
            
            <div className="space-y-8">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center gap-6 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm ${
                    s === step 
                      ? 'bg-brand-primary text-brand-slate' 
                      : s < step 
                        ? 'bg-brand-slate text-white' 
                        : 'bg-white border-2 border-slate-100 text-slate-300'
                  }`}>
                    {s < step ? '✓' : s}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-black uppercase tracking-wider transition-colors duration-300 ${s === step ? 'text-brand-slate' : 'text-slate-400'}`}>
                        {s === 1 ? t.step1 : s === 2 ? t.step2 : s === 3 ? t.step3 : t.step4}
                      </span>
                      {s === 4 && (
                        <motion.span 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="px-2 py-0.5 bg-brand-primary text-brand-slate text-[9px] font-black rounded uppercase tracking-tighter shadow-sm whitespace-nowrap flex items-center gap-1"
                        >
                          <Gift className="w-2.5 h-2.5" />
                          {lang === 'en' ? '6 Months Free' : '6 أشهر مجاناً'}
                        </motion.span>
                      )}
                    </div>
                    {s === 4 && s === step && (
                      <span className="text-[10px] text-brand-blue font-black animate-pulse uppercase tracking-tight">
                        {t.step4Benefit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-saas border border-slate-100 min-h-[500px] flex flex-col justify-center relative overflow-hidden">
            {/* Decorative mesh background */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-transparent"></div>
            
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};