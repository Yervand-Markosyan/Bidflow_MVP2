
import React from 'react';
import { motion } from 'framer-motion';
import { HardHat, Building2, Hammer, Truck } from 'lucide-react';
import { Language } from '../types';

interface UserSegmentsProps {
  lang: Language;
}

export const UserSegments: React.FC<UserSegmentsProps> = ({ lang }) => {
  const t = {
    en: {
      title: "Who Bidflow is built for",
      segments: [
        {
          title: "Contractors",
          description: "Quickly find and compare offers for building materials.",
          icon: <HardHat className="w-6 h-6" />
        },
        {
          title: "Developers",
          description: "Manage multiple construction projects and suppliers more efficiently.",
          icon: <Building2 className="w-6 h-6" />
        },
        {
          title: "Renovation Companies",
          description: "Compare supplier prices and save time sourcing materials.",
          icon: <Hammer className="w-6 h-6" />
        },
        {
          title: "Material Suppliers",
          description: "Reach new buyers and receive material requests directly.",
          icon: <Truck className="w-6 h-6" />
        }
      ]
    },
    ar: {
      title: "من هو بيدفلو مبني من أجله",
      segments: [
        {
          title: "المقاولون",
          description: "البحث بسرعة عن عروض مواد البناء ومقارنتها.",
          icon: <HardHat className="w-6 h-6" />
        },
        {
          title: "المطورون",
          description: "إدارة مشاريع بناء متعددة وموردين بشكل أكثر كفاءة.",
          icon: <Building2 className="w-6 h-6" />
        },
        {
          title: "شركات التجديد",
          description: "مقارنة أسعار الموردين وتوفير الوقت في الحصول على المواد.",
          icon: <Hammer className="w-6 h-6" />
        },
        {
          title: "موردو المواد",
          description: "الوصول إلى مشترين جدد وتلقي طلبات المواد مباشرة.",
          icon: <Truck className="w-6 h-6" />
        }
      ]
    }
  }[lang];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-brand-slate tracking-tight">
            {t.title}
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.segments.map((segment, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-8 bg-white rounded-2xl shadow-saas border border-slate-100 hover:border-brand-primary/50 transition-all group"
            >
              <div className="w-12 h-12 bg-brand-slate text-brand-primary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {segment.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-slate mb-3">{segment.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                {segment.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};