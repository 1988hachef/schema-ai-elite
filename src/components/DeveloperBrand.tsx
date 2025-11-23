import { useLanguage } from '@/contexts/LanguageContext';

const DeveloperBrand = () => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed top-3 left-3 z-50 flex items-center gap-2 animate-slide-in">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-primary/80 flex items-center justify-center">
        <span className="text-sm font-bold text-background">HO</span>
      </div>
      <span className="text-gold font-semibold text-sm tracking-wide">
        {t.developer}
      </span>
    </div>
  );
};

export default DeveloperBrand;
