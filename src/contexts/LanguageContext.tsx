import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ar' | 'fr' | 'en';

interface Translations {
  appName: string;
  developer: string;
  camera: string;
  uploadImages: string;
  uploadPDF: string;
  analyzing: string;
  analysis: string;
  audioNarration: string;
  play: string;
  pause: string;
  speed: string;
  chat: string;
  about: string;
  settings: string;
  language: string;
  export: string;
  description: {
    ar: string;
    fr: string;
    en: string;
  };
  offTopic: string;
  whoCreated: string;
  createdBy: string;
}

const translations: Record<Language, Translations> = {
  ar: {
    appName: 'HACHEF SCHÉMA ÉLECTRIQUE AI PRO',
    developer: 'HACHEF OUSSAMA',
    camera: 'كاميرا مباشرة',
    uploadImages: 'رفع صور',
    uploadPDF: 'رفع PDF',
    analyzing: 'جاري التحليل...',
    analysis: 'التحليل',
    audioNarration: 'الشرح الصوتي',
    play: 'تشغيل',
    pause: 'إيقاف مؤقت',
    speed: 'السرعة',
    chat: 'محادثة',
    about: 'عن التطبيق',
    settings: 'الإعدادات',
    language: 'اللغة',
    export: 'تصدير PDF',
    description: {
      ar: 'تطبيق احترافي مدعوم بالذكاء الاصطناعي لتحليل وشرح المخططات الكهربائية فقط. يدعم الكاميرا، الصور المتعددة، ملفات PDF، تحليل مرئي خطوة بخطوة، شرح صوتي كامل مع أدوات التحكم، وحوار تفاعلي متخصص.',
      fr: 'Application professionnelle IA pour l\'analyse exclusive de schémas électriques. Supporte caméra, images multiples, PDF, analyse visuelle pas à pas, narration audio complète avec contrôles de vitesse/avance-retour, et chat interactif spécialisé.',
      en: 'Professional AI app for electrical schematics only. Supports live camera, multiple images, PDF, step-by-step visual analysis, full audio narration with play/pause/speed/skip controls, and specialized interactive chat.'
    },
    offTopic: 'أنا متخصص فقط في المخططات الكهربائية',
    whoCreated: 'من طور هذا التطبيق؟',
    createdBy: 'This application was developed by HACHEF OUSSAMA'
  },
  fr: {
    appName: 'HACHEF SCHÉMA ÉLECTRIQUE AI PRO',
    developer: 'HACHEF OUSSAMA',
    camera: 'Caméra en direct',
    uploadImages: 'Télécharger des images',
    uploadPDF: 'Télécharger PDF',
    analyzing: 'Analyse en cours...',
    analysis: 'Analyse',
    audioNarration: 'Narration audio',
    play: 'Lecture',
    pause: 'Pause',
    speed: 'Vitesse',
    chat: 'Discussion',
    about: 'À propos',
    settings: 'Paramètres',
    language: 'Langue',
    export: 'Exporter PDF',
    description: {
      ar: 'تطبيق احترافي مدعوم بالذكاء الاصطناعي لتحليل وشرح المخططات الكهربائية فقط. يدعم الكاميرا، الصور المتعددة، ملفات PDF، تحليل مرئي خطوة بخطوة، شرح صوتي كامل مع أدوات التحكم، وحوار تفاعلي متخصص.',
      fr: 'Application professionnelle IA pour l\'analyse exclusive de schémas électriques. Supporte caméra, images multiples, PDF, analyse visuelle pas à pas, narration audio complète avec contrôles de vitesse/avance-retour, et chat interactif spécialisé.',
      en: 'Professional AI app for electrical schematics only. Supports live camera, multiple images, PDF, step-by-step visual analysis, full audio narration with play/pause/speed/skip controls, and specialized interactive chat.'
    },
    offTopic: 'Je suis spécialisé uniquement dans les schémas électriques',
    whoCreated: 'Qui a créé cette application?',
    createdBy: 'This application was developed by HACHEF OUSSAMA'
  },
  en: {
    appName: 'HACHEF SCHÉMA ÉLECTRIQUE AI PRO',
    developer: 'HACHEF OUSSAMA',
    camera: 'Live Camera',
    uploadImages: 'Upload Images',
    uploadPDF: 'Upload PDF',
    analyzing: 'Analyzing...',
    analysis: 'Analysis',
    audioNarration: 'Audio Narration',
    play: 'Play',
    pause: 'Pause',
    speed: 'Speed',
    chat: 'Chat',
    about: 'About',
    settings: 'Settings',
    language: 'Language',
    export: 'Export PDF',
    description: {
      ar: 'تطبيق احترافي مدعوم بالذكاء الاصطناعي لتحليل وشرح المخططات الكهربائية فقط. يدعم الكاميرا، الصور المتعددة، ملفات PDF، تحليل مرئي خطوة بخطوة، شرح صوتي كامل مع أدوات التحكم، وحوار تفاعلي متخصص.',
      fr: 'Application professionnelle IA pour l\'analyse exclusive de schémas électriques. Supporte caméra, images multiples, PDF, analyse visuelle pas à pas, narration audio complète avec contrôles de vitesse/avance-retour, et chat interactif spécialisé.',
      en: 'Professional AI app for electrical schematics only. Supports live camera, multiple images, PDF, step-by-step visual analysis, full audio narration with play/pause/speed/skip controls, and specialized interactive chat.'
    },
    offTopic: 'I only specialize in electrical schematics',
    whoCreated: 'Who created this app?',
    createdBy: 'This application was developed by HACHEF OUSSAMA'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'ar';
  });

  useEffect(() => {
    localStorage.setItem('app-language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
