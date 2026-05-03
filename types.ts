
export type Language = 'en' | 'ar' | 'hy';
export type Page = 'landing' | 'info' | 'about' | 'faq';

export interface RegistrationData {
  role: 'buyer' | 'supplier';
  email: string;
  timestamp: any;
}

export interface BuyerDemoData {
  category: string;
  quantity: string;
  location: string;
  email: string;
  role: 'buyer';
  timestamp: any;
}

export interface SupplierDemoData {
  companyName: string;
  materials: string[];
  city: string;
  email: string;
  timestamp: any;
}

declare global {
  interface Window {
    SESSION_START: number;
    bidflow: {
      track: (eventName: string, properties?: any) => void;
      getVideoWatchTime: () => number;
      trackEarlyAccess: (email: string, role: string) => void;
      trackSupplier: (step: number, data?: any) => void;
      trackBuyer: (step: number, data?: any) => void;
    };
  }
}