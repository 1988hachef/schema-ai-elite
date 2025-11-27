import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import SavedAnalyses from '@/components/SavedAnalyses';
import AnalysisViewer from '@/components/AnalysisViewer';

const History = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [viewImages, setViewImages] = useState<File[]>([]);

  const handleViewAnalysis = (analysis: any) => {
    // Convert data URLs back to File objects for AnalysisViewer
    const files = analysis.image_urls.map((url: string, idx: number) => {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], `image-${idx}.jpg`, { type: mime });
    });
    
    setViewImages(files);
    setSelectedAnalysis(analysis);
  };

  const handleBack = () => {
    if (selectedAnalysis) {
      setSelectedAnalysis(null);
      setViewImages([]);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background carbon-texture">
      <div className="container max-w-6xl mx-auto px-4 pt-8 pb-32">
        <div className="mb-8">
          <Button
            variant="outline"
            className="glass border-border/60 mb-4"
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {language === 'ar' ? 'رجوع' : language === 'fr' ? 'Retour' : 'Back'}
          </Button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-primary text-glow-gold mb-4">
            {language === 'ar'
              ? 'التحليلات المحفوظة'
              : language === 'fr'
              ? 'Analyses Enregistrées'
              : 'Saved Analyses'}
          </h1>
        </div>

        {selectedAnalysis ? (
          <AnalysisViewer 
            images={viewImages} 
            onReset={() => {
              setSelectedAnalysis(null);
              setViewImages([]);
            }} 
          />
        ) : (
          <SavedAnalyses onView={handleViewAnalysis} />
        )}
      </div>
    </div>
  );
};

export default History;