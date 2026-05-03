
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UserSegments } from './components/UserSegments';
import { VideoSection } from './components/VideoSection';
import { Stats } from './components/Stats';
import { Problem } from './components/Problem';
import { HowItWorks } from './components/HowItWorks';
import { BuyerSavings } from './components/BuyerSavings';
import { SupplierGrowth } from './components/SupplierGrowth';
import { BuyerDemo } from './components/BuyerDemo';
import { SupplierDemo } from './components/SupplierDemo';
import { InterestCounter } from './components/InterestCounter';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { Language, Page } from './types';
import { trackEvent, saveUserRegistration, subscribeToCounters, initializeCounters, seedAdministrators } from './services/trackingService';

// App component for Bidflow Dubai
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [lang, setLang] = useState<Language>('en');

  // Sync language with global tracking metrics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).bidflow_metrics) {
        (window as any).bidflow_metrics.lang = lang;
      }
      // Expose trackEvent to global window for index.html scripts
      (window as any).bidflow_trackEvent = trackEvent;
    }
  }, [lang]);
  
  // Real-time counts from Firebase
  const [buyersCount, setBuyersCount] = useState(0); 
  const [suppliersCount, setSuppliersCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    // 1. Seed administrators immediately (one-time setup)
    seedAdministrators();

    // 2. Track initial page view
    trackEvent('page_view_landing', { language: lang });

    // 3. Initialize counters if they don't exist
    initializeCounters();

    // Subscribe to real-time counters
    const unsubscribe = subscribeToCounters((data) => {
      if (data.buyers !== undefined) setBuyersCount(data.buyers);
      if (data.suppliers !== undefined) setSuppliersCount(data.suppliers);
      if (data.total !== undefined) {
        setTotalParticipants(data.total);
      } else {
        setTotalParticipants(data.buyers + data.suppliers);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackEvent(`page_view_${page}`, { language: lang });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegistration = async (data: any) => {
    console.log('Registration:', data);
    const eventName = data.role === 'buyer' ? 'material_request_submitted' : 'supplier_signup_submitted';
    
    await trackEvent(eventName, { ...data, source: 'final_cta' });
    // saveUserRegistration is now handled inside FinalCTA component to check for uniqueness
  };

  const handleBuyerDemoSubmit = async (data: any) => {
    console.log('Buyer Demo Submit:', data);
    await trackEvent('material_request_submitted', { ...data, source: 'buyer_demo' });
    // saveUserRegistration is now handled inside BuyerDemo component
  };

  const handleSupplierDemoSubmit = async (data: any) => {
    console.log('Supplier Demo Submit:', data);
    await trackEvent('supplier_signup_submitted', { ...data, source: 'supplier_demo' });
    // saveUserRegistration is now handled inside SupplierDemo component
  };

  return (
    <div className={`min-h-screen flex flex-col selection:bg-yellow-100 relative ${lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
      <Navbar 
        onNavigate={handleNavigate} 
        currentPage={currentPage} 
        lang={lang} 
        onLangChange={setLang} 
      />
      
      <main className="flex-grow">
        <Hero 
          lang={lang} 
          onBuyerClick={() => scrollToSection('buyer-demo')}
          onSupplierClick={() => scrollToSection('supplier-demo')}
        />
        
        <UserSegments lang={lang} />
        
        <VideoSection lang={lang} />
        
        <Stats lang={lang} />
        
        <Problem lang={lang} />
        
        <HowItWorks lang={lang} />
        
        <BuyerSavings lang={lang} />
        
        <SupplierGrowth lang={lang} />
        
        <BuyerDemo 
          lang={lang} 
          onSubmit={handleBuyerDemoSubmit} 
        />
        
        <SupplierDemo 
          lang={lang} 
          onSubmit={handleSupplierDemoSubmit} 
        />
        
        <InterestCounter 
          lang={lang} 
          buyersCount={buyersCount} 
          suppliersCount={suppliersCount}
          totalCount={totalParticipants} 
        />
        
        <FinalCTA 
          lang={lang} 
          onSubmit={handleRegistration} 
        />
      </main>

      <Footer onNavigate={handleNavigate} lang={lang} />
    </div>
  );
};

export default App;