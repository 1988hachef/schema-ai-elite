import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedAnalysis {
  id: string;
  title: string;
  image_urls: string[];
  analysis_sections: any;
  language: string;
  created_at: string;
}

interface SavedAnalysesProps {
  onView: (analysis: SavedAnalysis) => void;
}

const SavedAnalyses = ({ onView }: SavedAnalysesProps) => {
  const { language } = useLanguage();
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('schematic_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analyses:', error);
      toast.error(
        language === 'ar'
          ? 'فشل تحميل التحليلات'
          : language === 'fr'
          ? 'Échec du chargement des analyses'
          : 'Failed to load analyses'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schematic_analyses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(analyses.filter(a => a.id !== id));
      toast.success(
        language === 'ar'
          ? 'تم حذف التحليل بنجاح'
          : language === 'fr'
          ? 'Analyse supprimée avec succès'
          : 'Analysis deleted successfully'
      );
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error(
        language === 'ar'
          ? 'فشل حذف التحليل'
          : language === 'fr'
          ? 'Échec de la suppression de l\'analyse'
          : 'Failed to delete analysis'
      );
    }
  };

  if (isLoading) {
    return (
      <Card className="glass p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : language === 'fr' ? 'Chargement...' : 'Loading...'}
        </p>
      </Card>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="glass p-8 text-center">
        <p className="text-muted-foreground text-lg">
          {language === 'ar'
            ? 'لا توجد تحليلات محفوظة'
            : language === 'fr'
            ? 'Aucune analyse enregistrée'
            : 'No saved analyses'}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <Card key={analysis.id} className="glass p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 flex-shrink-0">
              <img
                src={analysis.image_urls[0]}
                alt={analysis.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-2 truncate">
                {analysis.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {new Date(analysis.created_at).toLocaleDateString(
                  language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
                  { year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass"
                  onClick={() => onView(analysis)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'عرض' : language === 'fr' ? 'Voir' : 'View'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="glass text-destructive hover:text-destructive"
                  onClick={() => deleteAnalysis(analysis.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'حذف' : language === 'fr' ? 'Supprimer' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SavedAnalyses;