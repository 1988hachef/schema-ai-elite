import { useEffect, useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Download, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import AudioNarration from './AudioNarration';
import ChatInterface from './ChatInterface';
import InteractiveVoiceAnalysis from './InteractiveVoiceAnalysis';
import AnalysisCorrection from './AnalysisCorrection';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
  const [isSaving, setIsSaving] = useState(false);
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

    const img = new Image();
    img.onload = () => {
      // Set canvas to match image dimensions
      canvas.width = img.width;
      canvas.height = img.height;
      
      const sectionCount = analysis.length;
      const segmentHeight = canvas.height / sectionCount;
      const y = index * segmentHeight;
      
      // Draw colored frame around section area
      ctx.strokeStyle = section.color;
      ctx.lineWidth = 4;
      ctx.shadowColor = section.color;
      ctx.shadowBlur = 10;
      ctx.strokeRect(20, y + 20, canvas.width - 40, segmentHeight - 40);
      
      // Draw section number badge
      ctx.fillStyle = section.color;
      ctx.fillRect(30, y + 30, 40, 40);
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), 50, y + 50);
      
      // Draw arrow pointing to section
      const arrowX = canvas.width - 60;
      const arrowY = y + segmentHeight / 2;
      ctx.strokeStyle = section.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arrowX, arrowY - 30);
      ctx.lineTo(arrowX, arrowY + 30);
      ctx.lineTo(arrowX + 20, arrowY);
      ctx.closePath();
      ctx.fill();
      
      // Draw flow line for current path
      if (index < sectionCount - 1) {
        ctx.strokeStyle = section.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, y + segmentHeight - 20);
        ctx.lineTo(canvas.width / 2, y + segmentHeight + 20);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      ctx.shadowBlur = 0;
    };
    img.src = currentImage;
  };

  const saveAnalysis = async () => {
    if (!analysis.length) return;
    
    setIsSaving(true);
    try {
      const title = language === 'ar' 
        ? `تحليل مخطط كهربائي - ${new Date().toLocaleDateString('ar-SA')}`
        : language === 'fr'
        ? `Analyse de schéma - ${new Date().toLocaleDateString('fr-FR')}`
        : `Schematic Analysis - ${new Date().toLocaleDateString('en-US')}`;

      const { error } = await supabase
        .from('schematic_analyses')
        .insert([{
          title,
          image_urls: imageDataList,
          analysis_sections: analysis as any,
          language
        }]);

      if (error) throw error;

      toast.success(
        language === 'ar'
          ? 'تم حفظ التحليل بنجاح'
          : language === 'fr'
          ? 'Analyse enregistrée avec succès'
          : 'Analysis saved successfully'
      );
    } catch (error) {
      console.error('Save error:', error);
      toast.error(
        language === 'ar'
          ? 'فشل حفظ التحليل'
          : language === 'fr'
          ? 'Échec de l\'enregistrement'
          : 'Failed to save analysis'
      );
    } finally {
      setIsSaving(false);
    }
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

    const imagesHtml = imageDataList
      .map((img, idx) => `
        <div style="margin-bottom:24px;page-break-inside:avoid;">
          <h3 style="font-size:18px;font-weight:700;margin-bottom:8px;">
            ${language === 'ar' ? `المخطط ${idx + 1}` : language === 'fr' ? `Schéma ${idx + 1}` : `Schematic ${idx + 1}`}
          </h3>
          <img src="${img}" style="max-width:100%;height:auto;border:2px solid #D4AF37;border-radius:8px;" />
        </div>
      `)
      .join('');

    const sectionsHtml = safeSections
      .map(
        (section, idx) => `
        <section style="margin-bottom:24px;page-break-inside:avoid;">
          <h2 style="font-size:20px;font-weight:700;margin-bottom:8px;color:#D4AF37;">${idx + 1}. ${section.title}</h2>
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
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              padding: 32px;
              max-width: 1200px;
              margin: 0 auto;
            }
            h1 { 
              font-size: 28px; 
              font-weight: 800; 
              margin-bottom: 8px;
              color: #D4AF37;
            }
            .subtitle {
              font-size: 14px;
              color: #666;
              margin-bottom: 24px;
              font-style: italic;
            }
            .developer-brand {
              font-size: 12px;
              font-weight: 600;
              color: #D4AF37;
              text-align: center;
              margin: 24px 0;
              letter-spacing: 0.5px;
            }
          </style>
        </head>
        <body>
          <div class="developer-brand">DEVELOPED BY HACHEF OUSSAMA</div>
          <h1>${t.appName}</h1>
          <p class="subtitle">${language === 'ar' ? 'تحليل بواسطة المهندس الكهربائي HACHEF OUSSAMA' : language === 'fr' ? 'Analysé par l\'ingénieur électricien HACHEF OUSSAMA' : 'Analyzed by Electrical Engineer HACHEF OUSSAMA'}</p>
          ${imagesHtml}
          <hr style="border:none;border-top:2px solid #D4AF37;margin:32px 0;" />
          ${sectionsHtml}
          <hr style="border:none;border-top:2px solid #D4AF37;margin:32px 0;" />
          <div class="developer-brand">DEVELOPED BY HACHEF OUSSAMA</div>
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
              variant="outline"
              className="flex-1 h-12 glass border-border/60"
              onClick={saveAnalysis}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {language === 'ar'
                ? 'حفظ التحليل'
                : language === 'fr'
                ? 'Enregistrer'
                : 'Save Analysis'}
            </Button>

            <Button 
              className="flex-1 h-12 glass border-2 border-primary/30 hover:border-primary hover:glow-gold"
              onClick={handleExportPdf}
            >
              <Download className="mr-2 h-5 w-5" />
              {t.export}
            </Button>
            
            <AnalysisCorrection 
              currentAnalysis={analysis}
              onCorrected={(corrected) => setAnalysis(corrected)}
            />
          </div>

          <AudioNarration sections={analysis} />
          <InteractiveVoiceAnalysis 
            analysisContext={analysis.map(s => `${s.title}: ${s.content}`).join('\n\n')} 
          />
          <ChatInterface analysisContext={analysis.map(s => `${s.title}: ${s.content}`).join('\n\n')} />
        </>
      )}
    </div>
  );
};

export default AnalysisViewer;
