import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DeveloperBrand from '@/components/DeveloperBrand';
import LanguageSelector from '@/components/LanguageSelector';
import InputButtons from '@/components/InputButtons';
import AnalysisViewer from '@/components/AnalysisViewer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleReset = () => {
    setSelectedImages([]);
  };

  return (
    <div className="min-h-screen bg-background carbon-texture">
      <div className="fixed top-4 right-4 z-50 flex gap-3 animate-slide-in">
        <Button
          variant="outline"
          size="icon"
          className="glass border-primary/30 hover:border-primary hover:glow-gold"
          onClick={() => navigate('/history')}
          title={language === 'ar' ? 'التحليلات المحفوظة' : language === 'fr' ? 'Analyses enregistrées' : 'Saved Analyses'}
        >
          <History className="h-5 w-5" />
        </Button>
        <LanguageSelector />
      </div>

      <div className="container max-w-6xl mx-auto px-4 pt-24 pb-32">
        <div className="text-center mb-12 space-y-4 animate-slide-up">
          <h1 className="text-4xl md:text-6xl font-bold text-primary text-glow-gold">
            {t.appName}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.description[useLanguage().language]}
          </p>
        </div>

        {selectedImages.length === 0 ? (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <InputButtons onImageCapture={setSelectedImages} />
          </div>
        ) : (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <AnalysisViewer images={selectedImages} onReset={handleReset} />
          </div>
        )}
      </div>
      
      <DeveloperBrand />
    </div>
  );
};

export default Index;
