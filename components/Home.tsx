import React from 'react';
import { Navbar } from './Navbar';
import { Hero } from './Hero';
import { UserSegments } from './UserSegments';
import { VideoSection } from './VideoSection';
import { Stats } from './Stats';
import { Problem } from './Problem';
import { HowItWorks } from './HowItWorks';
import { BuyerSavings } from './BuyerSavings';
import { SupplierGrowth } from './SupplierGrowth';
import { BuyerDemo } from './BuyerDemo';
import { SupplierDemo } from './SupplierDemo';
import { InterestCounter } from './InterestCounter';
import { FinalCTA } from './FinalCTA';
import { Footer } from './Footer';
import { Language, Page } from '../types';


interface HomeProps {
  lang: Language;
  setLang: (lang: Language) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  handleNavigate: (page: Page) => void;
  handleRegistration: (data: any) => Promise<void>;
  handleBuyerDemoSubmit: (data: any) => Promise<void>;
  handleSupplierDemoSubmit: (data: any) => Promise<void>;
  scrollToSection: (id: string) => void;
  buyersCount: number;
  suppliersCount: number;
  totalParticipants: number;
}

export const Home: React.FC<HomeProps> = (props) => {
    return (
        <div className={`min-h-screen flex flex-col selection:bg-yellow-100 relative ${props.lang === 'ar' ? 'font-arabic' : 'font-sans'}`}>
          <Navbar 
            onNavigate={props.handleNavigate} 
            currentPage={props.currentPage} 
            lang={props.lang} 
            onLangChange={props.setLang} 
          />
          
          <main className="flex-grow">
            <Hero 
              lang={props.lang} 
              onBuyerClick={() => props.scrollToSection('buyer-demo')}
              onSupplierClick={() => props.scrollToSection('supplier-demo')}
            />
            
            <UserSegments lang={props.lang} />
            
            <VideoSection lang={props.lang} />
            
            <Stats lang={props.lang} />
            
            <Problem lang={props.lang} />
            
            <HowItWorks lang={props.lang} />
            
            <BuyerSavings lang={props.lang} />
            
            <SupplierGrowth lang={props.lang} />
            
            <BuyerDemo 
              lang={props.lang} 
              onSubmit={props.handleBuyerDemoSubmit} 
            />
            
            <SupplierDemo 
              lang={props.lang} 
              onSubmit={props.handleSupplierDemoSubmit} 
            />
            
            <InterestCounter 
              lang={props.lang} 
              buyersCount={props.buyersCount} 
              suppliersCount={props.suppliersCount}
              totalCount={props.totalParticipants} 
            />
            
            <FinalCTA 
              lang={props.lang} 
              onSubmit={props.handleRegistration} 
            />
          </main>
    
          <Footer onNavigate={props.handleNavigate} lang={props.lang} />
        </div>
      );
}
