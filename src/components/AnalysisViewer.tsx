import { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AudioNarration from './AudioNarration';
import ChatInterface from './ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisViewerProps {
  images: File[];
  onReset: () => void;
}

interface AnalysisSection {
  title: string;
  content: string;
  color: string;
}

const AnalysisViewer = ({ images, onReset }: AnalysisViewerProps) => {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [imageDataList, setImageDataList] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (images.length > 0) {
      analyzeImages();
    }
  }, [images]);

  const analyzeImages = async () => {
    setIsAnalyzing(true);
    
    try {
      // Convert images to base64
      const imageDataPromises = images.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      
      const imageData = await Promise.all(imageDataPromises);
      setImageDataList(imageData);
      setCurrentImage(imageData[0]);

      // Call AI analysis
      const { data, error } = await supabase.functions.invoke('analyze-schematic', {
        body: { images: imageData, language }
      });

      if (error) throw error;
      
      setAnalysis(data.sections || []);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAnnotations = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawAnnotations = (section: AnalysisSection, index: number) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simple animation: draw a box that grows
    const x = 50 + (index * 100) % 400;
    const y = 50 + Math.floor(index / 4) * 100;
    
    ctx.strokeStyle = section.color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, 80, 80);
    
    // Draw arrow
    ctx.beginPath();
    ctx.moveTo(x + 40, y + 80);
    ctx.lineTo(x + 40, y + 120);
    ctx.lineTo(x + 50, y + 110);
    ctx.moveTo(x + 40, y + 120);
    ctx.lineTo(x + 30, y + 110);
    ctx.stroke();
  };

  const handleExportPdf = () => {
    if (!analysis.length) return;

    const dir = language === 'ar' ? 'rtl' : 'ltr';
    const lang = language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en';

    const win = window.open('', '_blank');
    if (!win) return;

    const safeSections = analysis.map(section => ({
      title: section.title.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
      content: section.content.replace(/</g, '&lt;').replace(/>/g, '&gt;'),
    }));

    const sectionsHtml = safeSections
      .map(
        (section) => `
        <section style="margin-bottom:24px;">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;">${section.title}</h2>
          <p style="white-space:pre-wrap;line-height:1.7;font-size:14px;">${section.content}</p>
        </section>`
      )
      .join('');

    win.document.write(`
      <!DOCTYPE html>
      <html lang="${lang}" dir="${dir}">
        <head>
          <meta charset="utf-8" />
          <title>${t.appName}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 32px;
            }
          </style>
        </head>
        <body>
          <h1 style="font-size:24px;font-weight:800;margin-bottom:16px;">${t.appName}</h1>
          ${sectionsHtml}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="w-full space-y-6">
      {currentImage && (
        <Card className="glass p-4 relative overflow-hidden">
          <div className="relative">
            <img 
              src={currentImage} 
              alt="Schematic" 
              className="w-full rounded-lg"
            />
            <canvas 
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
          </div>

          {imageDataList.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto">
              {imageDataList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentImage(img);
                    if (canvasRef.current) {
                      const canvas = canvasRef.current;
                      const ctx = canvas.getContext('2d');
                      if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                      }
                    }
                  }}
                  className={`relative h-20 w-20 flex-shrink-0 rounded-md border-2 transition-all ${
                    currentImage === img ? 'border-primary' : 'border-border/40'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Schematic ${idx + 1}`}
                    className="h-full w-full object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          )}
        </Card>
      )}

      {isAnalyzing && (
        <Card className="glass p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-electric-blue mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">{t.analyzing}</p>
        </Card>
      )}

      <AnimatePresence>
        {analysis.map((section, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.3 }}
            onAnimationComplete={() => drawAnnotations(section, index)}
          >
            <Card className="glass p-6 border-l-4" style={{ borderLeftColor: section.color }}>
              <h3 
                className="text-xl font-bold mb-3"
                style={{ color: section.color }}
              >
                {section.title}
              </h3>
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {section.content}
              </p>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {analysis.length > 0 && (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 glass border-border/60"
              onClick={onReset}
            >
              {language === 'ar'
                ? 'رجوع لاختيار مخطط جديد'
                : language === 'fr'
                ? 'Revenir pour analyser un autre schéma'
                : 'Back to analyze another schematic'}
            </Button>

            <Button
              variant="outline"
              className="flex-1 h-12 glass border-border/60"
              onClick={clearAnnotations}
            >
              {language === 'ar'
                ? 'إخفاء التحديدات على الصورة'
                : language === 'fr'
                ? 'Effacer les surbrillances'
                : 'Clear highlights on image'}
            </Button>

            <Button 
              className="flex-1 h-12 glass border-2 border-primary/30 hover:border-primary hover:glow-gold"
              onClick={handleExportPdf}
            >
              <Download className="mr-2 h-5 w-5" />
              {t.export}
            </Button>
          </div>

          <AudioNarration sections={analysis} />
          <ChatInterface analysisContext={analysis.map(s => `${s.title}: ${s.content}`).join('\n\n')} />
        </>
      )}
    </div>
  );
};

export default AnalysisViewer;
