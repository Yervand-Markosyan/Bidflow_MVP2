
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Gift } from 'lucide-react';
import { Language } from '../types';
import { trackEvent, saveUserRegistration } from '../services/trackingService';

interface SupplierDemoProps {
  lang: Language;
  onSubmit: (data: any) => void;
}

export const SupplierDemo: React.FC<SupplierDemoProps> = ({ lang, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    materials: [] as { name: string, unit: string, price: string }[],
    city: '',
    email: ''
  });
  const [selectedMaterialNames, setSelectedMaterialNames] = useState<string[]>([]);
  const [otherMaterial, setOtherMaterial] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const units = [
    { en: "piece", ar: "قطعة" }, { en: "box", ar: "صندوق" }, { en: "bag", ar: "كيس" },
    { en: "g", ar: "غرام" }, { en: "kg", ar: "كجم" }, { en: "ton", ar: "طن" },
    { en: "mm", ar: "مم" }, { en: "cm", ar: "سم" }, { en: "m", ar: "م" },
    { en: "m²", ar: "م²" }, { en: "m³", ar: "م³" }, { en: "ml", ar: "مل" }, { en: "l", ar: "ل" }
  ];

  const t = {
    en: {
      title: "Register as a supplier",
      subtitle: "Join our network of top-tier suppliers and grow your business in Dubai.",
      companyLabel: "Company name",
      materialsLabel: "Materials supplied",
      materialsOptions: ["Steel", "Cement", "Electrical", "Plumbing", "Finishing", "Other"],
      otherPlaceholder: "Enter material name",
      cityLabel: "City",
      cityPlaceholder: "e.g. Dubai",
      emailLabel: "Email",
      submit: "Join supplier early access",
      promo: "Early users receive 6 months free access when Bidflow launches.",
      success: "Registration received!",
      successMsg: "We'll contact you when we launch the supplier portal in Dubai. You've earned 6 months of free access!",
      alreadyRegisteredMsg: "Thank you! This email is already registered. We will notify you when Bidflow launches.",
      other: "Other",
      step2Title: "Unit and approximate price",
      selectUnit: "Select unit",
      pricingError: "Please provide both price and unit, or leave both empty.",
      pricePlaceholder: "Approximate price per unit (optional)",
      priceNote: "This information helps us understand market pricing and is not shown publicly.",
      step3Title: "Company information",
      step4Title: "Email and role",
      freeAccess: "6 months free access when Bidflow launches",
      continue: "Continue",
      join: "Join supplier early access",
      back: "Back",
      materialError: "Please select at least one product"
    },
    ar: {
      title: "سجل كمورد",
      subtitle: "انضم إلى شبكتنا من الموردين المتميزين ونمِ عملك في دبي.",
      companyLabel: "اسم الشركة",
      materialsLabel: "المواد الموردة",
      materialsOptions: ["حديد", "أسمنت", "كهرباء", "سباكة", "تشطيب", "أخرى"],
      otherPlaceholder: "أدخل اسم المادة",
      cityLabel: "المدينة",
      cityPlaceholder: "مثلاً دبي",
      emailLabel: "البريد الإلكتروني",
      submit: "انضم إلى الوصول المبكر للموردين",
      promo: "يحصل المستخدمون الأوائل على وصول مجاني لمدة 6 أشهر عند إطلاق بيدفلو.",
      success: "تم استلام التسجيل!",
      successMsg: "سنتصل بك عندما نطلق بوابة الموردين في دبي. لقد حصلت على وصول مجاني لمدة 6 أشهر!",
      alreadyRegisteredMsg: "شكراً لك! هذا البريد الإلكتروني مسجل بالفعل. سنقوم بإبلاغك عند إطلاق بيدفلو.",
      other: "أخرى",
      step2Title: "الوحدة والسعر التقريبي",
      selectUnit: "اختر الوحدة",
      pricingError: "يرجى تقديم كل من السعر والوحدة، أو تركهما فارغين.",
      pricePlaceholder: "السعر التقريبي لكل وحدة (اختياري)",
      priceNote: "تساعدنا هذه المعلومات في فهم أسعار السوق ولا يتم عرضها علنًا.",
      step3Title: "معلومات الشركة",
      step4Title: "البريد الإلكتروني والدور",
      freeAccess: "6 أشهر وصول مجاني عند إطلاق بيدفلو",
      continue: "متابعة",
      join: "انضم إلى الوصول المبكر للموردين",
      back: "رجوع",
      materialError: "يرجى اختيار منتج واحد على الأقل"
    },
    hy: {
      title: "Գրանցվել որպես մատակարար",
      subtitle: "Միացեք մեր առաջատար մատակարարների ցանցին և զարգացրեք ձեր բիզնեսը Դուբայում:",
      companyLabel: "Ընկերության անվանումը",
      materialsLabel: "Մատակարարվող նյութեր",
      materialsOptions: ["Պողպատ", "Ցեմենտ", "Էլեկտրականություն", "Ջրմուղ", "Հարդարում", "Այլ"],
      otherPlaceholder: "Մուտքագրեք նյութի անվանումը",
      cityLabel: "Քաղաք",
      cityPlaceholder: "օր.՝ Դուբայ",
      emailLabel: "Էլ. հասցե",
      submit: "Միացեք մատակարարների վաղ հասանելիությանը",
      promo: "Վաղ օգտատերերը ստանում են 6 ամիս անվճար հասանելիություն, երբ Bidflow-ը գործարկվի:",
      success: "Գրանցումը ստացված է!",
      successMsg: "Մենք կկապվենք ձեզ հետ, երբ գործարկենք մատակարարների պորտալը Դուբայում: Դուք ստացել եք 6 ամիս անվճար հասանելիություն:",
      alreadyRegisteredMsg: "Շնորհակալություն: Այս էլ. հասցեն արդեն գրանցված է: Մենք կտեղեկացնենք ձեզ, երբ Bidflow-ը գործարկվի:",
      other: "Այլ",
      step2Title: "Միավոր և մոտավոր գին",
      selectUnit: "Ընտրեք միավորը",
      pricingError: "Խնդրում ենք լրացնել և՛ գինը, և՛ միավորը, կամ երկուսն էլ թողնել դատարկ:",
      pricePlaceholder: "Մոտավոր գին մեկ միավորի համար (ըստ ցանկության)",
      priceNote: "Այս տեղեկատվությունը օգնում է մեզ հասկանալ շուկայական գները և հրապարակայնորեն չի ցուցադրվում:",
      step3Title: "Ընկերության տեղեկատվություն",
      step4Title: "Էլ. հասցե և դեր",
      freeAccess: "6 ամիս անվճար հասանելիություն, երբ Bidflow-ը գործարկվի",
      continue: "Շարունակել",
      join: "Միացեք մատակարարների վաղ հասանելիությանը",
      back: "Հետ",
      materialError: "Խնդրում ենք ընտրել առնվազն մեկ ապրանք"
    }
  }[lang];

  const [materialError, setMaterialError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlreadyRegistered(false);
    
    if (step === 1 && selectedMaterialNames.length === 0) {
      setMaterialError(true);
      return;
    }
    setMaterialError(false);

    if (step === 2) {
      const incomplete = formData.materials.some(mat => 
        (mat.price.trim() !== '' && !mat.unit) || 
        (mat.unit && mat.price.trim() === '')
      );
      if (incomplete) {
        setMaterialError(true);
        return;
      }
    }

    if (!hasStarted) {
      if (window.bidflow) {
        window.bidflow.trackSupplier(1, { source: 'supplier_demo' });
      }
      setHasStarted(true);
    }
    if (step < 4) {
      if (step === 1) {
        // Initialize materials array based on selected names
        const newMaterials = selectedMaterialNames.map(name => ({
          name: name === 'Other' || name === 'أخرى' ? otherMaterial : name,
          unit: '',
          price: ''
        }));
        setFormData(prev => ({ ...prev, materials: newMaterials }));
        
        await trackEvent('supplier_materials_selected', { selected_materials: selectedMaterialNames });
      }
      
      if (step === 2) {
        await trackEvent('supplier_pricing_entered', { materials_pricing: formData.materials });
      }
      
      if (step === 3) {
        await trackEvent('supplier_company_info_entered', { company_name: formData.companyName, location: formData.city });
      }
      
      setStep(step + 1);
    } else {
      await trackEvent('supplier_signup_submitted', {
          email: formData.email,
          company_name: formData.companyName,
          location: formData.city,
          supplier_materials: formData.materials
        });

      const result = await saveUserRegistration({
        email: formData.email.toLowerCase(),
        role: 'supplier',
        company_name: formData.companyName,
        location: formData.city,
        supplier_materials: formData.materials,
        source: 'supplier_demo'
      });

      if (result.alreadyExists) {
        setAlreadyRegistered(true);
        return;
      }
      
      onSubmit(formData);
      setIsSubmitted(true);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleMaterial = (mat: string) => {
    setSelectedMaterialNames(prev => prev.includes(mat)
      ? prev.filter(m => m !== mat)
      : [...prev, mat]
    );
  };

  const PromoBox = () => (
    <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-4 text-slate-600">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-saas">
        <Gift className="w-6 h-6 text-brand-primary" />
      </div>
      <p className="font-bold text-sm leading-tight">
        {t.promo}
      </p>
    </div>
  );

  if (isSubmitted) {
    return (
      <section id="supplier-demo" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-xl mx-auto p-12 bg-brand-slate rounded-3xl text-center space-y-6 shadow-saas border border-slate-800">
            <div className="w-20 h-20 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-brand-slate" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">{t.success}</h2>
            <p className="text-slate-400 font-medium text-lg">{t.successMsg}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="supplier-demo" className="py-24 bg-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-saas border border-slate-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-brand-primary to-transparent"></div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Progress Indicator */}
                <div className="flex gap-2 mb-8">
                  {[1, 2, 3, 4].map((s) => (
                    <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? 'bg-brand-primary' : 'bg-slate-200'}`} />
                  ))}
                </div>

                {step === 1 && (
                  <div className="space-y-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.materialsLabel}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {t.materialsOptions.map((mat) => (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => {
                            toggleMaterial(mat);
                            setMaterialError(false);
                          }}
                          className={`p-3 text-xs font-bold rounded-xl border-2 transition-all ${
                            selectedMaterialNames.includes(mat)
                              ? 'border-brand-primary bg-brand-primary/5 text-brand-slate'
                              : materialError 
                                ? 'border-red-100 bg-red-50/30 text-slate-500 hover:border-red-200'
                                : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {mat}
                        </button>
                      ))}
                    </div>
                    {materialError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-bold"
                      >
                        {t.materialError}
                      </motion.p>
                    )}
                    {(selectedMaterialNames.includes('Other') || selectedMaterialNames.includes('أخرى')) && (
                      <input 
                        type="text"
                        required
                        placeholder={t.otherPlaceholder}
                        value={otherMaterial}
                        onChange={(e) => setOtherMaterial(e.target.value)}
                        className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                      />
                    )}
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">{t.step2Title}</h3>
                    {formData.materials.map((mat, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-4">
                        <p className="font-bold">{mat.name}</p>
                        <div className="flex flex-col md:flex-row gap-3">
                          <input 
                            type="number"
                            placeholder={t.pricePlaceholder}
                            value={mat.price}
                            onChange={(e) => {
                              const newMaterials = [...formData.materials];
                              newMaterials[index].price = e.target.value;
                              setFormData(prev => ({ ...prev, materials: newMaterials }));
                              setMaterialError(false);
                            }}
                            className="w-full md:flex-[2] p-3 bg-white border border-slate-200 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <select 
                            value={mat.unit}
                            onChange={(e) => {
                              const newMaterials = [...formData.materials];
                              newMaterials[index].unit = e.target.value;
                              setFormData(prev => ({ ...prev, materials: newMaterials }));
                              setMaterialError(false);
                            }}
                            className="w-full md:flex-1 p-3 bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="">{t.selectUnit}</option>
                            {units.map(u => <option key={u.en} value={u.en}>{u[lang]}</option>)}
                          </select>
                        </div>
                      </div>
                    ))}
                    {materialError && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs font-bold"
                      >
                        {t.pricingError}
                      </motion.p>
                    )}
                    <p className="text-xs text-slate-500">{t.priceNote}</p>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">{t.step3Title}</h3>
                    <input 
                      type="text"
                      required
                      placeholder={t.companyLabel}
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                    />
                    <input 
                      type="text"
                      required
                      placeholder={t.cityLabel}
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black">{t.step4Title}</h3>
                    <div className="inline-block bg-brand-primary px-3 py-1.5 rounded-lg">
                      <p className="text-[#0f172a] font-bold text-sm leading-none">{t.freeAccess}</p>
                    </div>
                    <input 
                      type="email"
                      required
                      placeholder={t.emailLabel}
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        setAlreadyRegistered(false);
                      }}
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:border-brand-primary transition-all font-bold"
                    />
                    {alreadyRegistered && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                        {t.alreadyRegisteredMsg}
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex gap-3">
                    {step > 1 && (
                      <button 
                        type="button"
                        onClick={handleBack}
                        className="flex-1 p-4 rounded-xl text-lg font-bold border-2 border-slate-100 text-slate-500 hover:bg-slate-50 transition-all"
                      >
                        {t.back}
                      </button>
                    )}
                    <button 
                      type="submit"
                      className="btn-primary flex-[2] p-4 rounded-xl text-lg"
                    >
                      {step === 4 ? t.join : t.continue}
                    </button>
                  </div>
                  {step === 1 && <PromoBox />}
                </div>
              </form>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary text-brand-slate rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Truck className="w-3 h-3" />
                Supplier Portal
              </div>
              <div className="px-2 py-0.5 bg-brand-slate text-brand-primary rounded text-[9px] font-black uppercase tracking-tighter animate-pulse">
                {lang === 'en' ? 'Priority' : 'أولوية'}
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-brand-slate tracking-tight mb-6 leading-tight">
              {t.title}
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed mb-8">
              {t.subtitle}
            </p>
            
            <div className="rounded-3xl overflow-hidden shadow-saas border border-slate-100 aspect-video">
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1200&auto=format&fit=crop"
                alt="Construction Supplier Warehouse"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};