import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisCorrectionProps {
  currentAnalysis: { title: string; content: string; color: string }[];
  onCorrected: (correctedAnalysis: { title: string; content: string; color: string }[]) => void;
}

const AnalysisCorrection = ({ currentAnalysis, onCorrected }: AnalysisCorrectionProps) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [userNotes, setUserNotes] = useState('');
  const [isCorrecting, setIsCorrecting] = useState(false);

  const getMessage = (key: string) => {
    const messages = {
      ar: {
        title: 'تصحيح التحليل',
        button: 'تصحيح الأخطاء',
        placeholder: 'اكتب الأخطاء التي وجدتها أو المعلومات التي تحتاج تصحيح...',
        submit: 'تصحيح',
        cancel: 'إلغاء',
        correcting: 'جاري التصحيح...',
        success: 'تم تصحيح التحليل بنجاح',
        error: 'خطأ في التصحيح',
      },
      fr: {
        title: 'Corriger l\'analyse',
        button: 'Corriger les erreurs',
        placeholder: 'Écrivez les erreurs que vous avez trouvées ou les informations qui nécessitent une correction...',
        submit: 'Corriger',
        cancel: 'Annuler',
        correcting: 'Correction en cours...',
        success: 'Analyse corrigée avec succès',
        error: 'Erreur de correction',
      },
      en: {
        title: 'Correct Analysis',
        button: 'Correct Errors',
        placeholder: 'Write the errors you found or information that needs correction...',
        submit: 'Correct',
        cancel: 'Cancel',
        correcting: 'Correcting...',
        success: 'Analysis corrected successfully',
        error: 'Correction error',
      }
    };
    return messages[language][key] || messages.en[key];
  };

  const handleCorrection = async () => {
    if (!userNotes.trim()) {
      toast.error(language === 'ar' ? 'يرجى كتابة الملاحظات' : language === 'fr' ? 'Veuillez écrire des notes' : 'Please write notes');
      return;
    }

    setIsCorrecting(true);
    try {
      const analysisText = currentAnalysis.map(s => `${s.title}\n${s.content}`).join('\n\n');
      
      const { data, error } = await supabase.functions.invoke('chat-schematic', {
        body: {
          message: `تصحيح التحليل التالي بناءً على هذه الملاحظات: ${userNotes}\n\nالتحليل الحالي:\n${analysisText}`,
          language,
          context: analysisText,
          history: []
        }
      });

      if (error) throw error;

      // Parse corrected analysis
      const correctedText = data.response;
      const sections = correctedText.split('\n\n').filter(s => s.trim());
      const correctedAnalysis = sections.map((section, index) => {
        const lines = section.split('\n');
        const colors = ['#D4AF37', '#00D4FF', '#FF6B6B', '#4ECDC4', '#FFD93D'];
        return {
          title: lines[0].replace(/[#*]/g, '').trim(),
          content: lines.slice(1).join('\n').trim(),
          color: colors[index % colors.length]
        };
      });

      onCorrected(correctedAnalysis);
      toast.success(getMessage('success'));
      setIsOpen(false);
      setUserNotes('');
    } catch (error) {
      console.error('Correction error:', error);
      toast.error(getMessage('error'));
    } finally {
      setIsCorrecting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="glass border-gold/30 hover:border-gold/50 hover:glow-gold"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        {getMessage('button')}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass border-gold/30 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gold mb-4">{getMessage('title')}</h2>
            
            <Textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={getMessage('placeholder')}
              className="min-h-[200px] mb-4 glass border-border/50"
              disabled={isCorrecting}
            />

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isCorrecting}
              >
                {getMessage('cancel')}
              </Button>
              <Button
                onClick={handleCorrection}
                disabled={isCorrecting}
                className="gradient-gold"
              >
                {isCorrecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {getMessage('correcting')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {getMessage('submit')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalysisCorrection;
