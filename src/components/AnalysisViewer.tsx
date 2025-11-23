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
}

interface AnalysisSection {
  title: string;
  content: string;
  color: string;
}

const AnalysisViewer = ({ images }: AnalysisViewerProps) => {
  const { t, language } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisSection[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
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
          <AudioNarration sections={analysis} />
          <ChatInterface analysisContext={analysis.map(s => `${s.title}: ${s.content}`).join('\n\n')} />
          
          <Button 
            className="w-full h-12 glass border-2 border-primary/30 hover:border-primary hover:glow-gold"
          >
            <Download className="mr-2 h-5 w-5" />
            {t.export}
          </Button>
        </>
      )}
    </div>
  );
};

export default AnalysisViewer;
