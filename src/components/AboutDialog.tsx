import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const AboutDialog = () => {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="glass border-border/50 hover:glow-gold">
          <Info className="h-5 w-5 text-primary" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-2 border-primary/30 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary text-center mb-4">
            {t.appName}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">العربية</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t.description.ar}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Français</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t.description.fr}
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">English</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t.description.en}
            </p>
          </div>

          <div className="pt-4 border-t border-border/50 text-center">
            <p className="text-primary font-bold text-lg">
              Developer: {t.developer}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AboutDialog;
