import { useLanguage } from '@/contexts/LanguageContext';

const DeveloperBrand = () => {
  const { t } = useLanguage();
  
  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-3 animate-slide-in">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold to-primary/80 flex items-center justify-center glow-gold">
        <span className="text-2xl font-bold text-background">HO</span>
      </div>
      <span className="text-gold font-bold text-xl tracking-wider text-glow-gold">
        {t.developer}
      </span>
    </div>
  );
};

export default DeveloperBrand;
