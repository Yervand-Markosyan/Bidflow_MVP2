
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { RedirectHandler } from './components/RedirectHandler';
import { Language, Page } from './types';
import { trackEvent, subscribeToCounters, initializeCounters, seedAdministrators } from './services/trackingService';

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
    <Routes>
      <Route path="/:shortId" element={<RedirectHandler />} />
      <Route path="/" element={
        <Home 
          lang={lang}
          setLang={setLang}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleNavigate={handleNavigate}
          handleRegistration={handleRegistration}
          handleBuyerDemoSubmit={handleBuyerDemoSubmit}
          handleSupplierDemoSubmit={handleSupplierDemoSubmit}
          scrollToSection={scrollToSection}
          buyersCount={buyersCount}
          suppliersCount={suppliersCount}
          totalParticipants={totalParticipants}
        />
      } />
    </Routes>
  );
};

export default App;
