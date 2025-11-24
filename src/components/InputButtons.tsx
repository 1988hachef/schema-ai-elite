import { useRef } from 'react';
import { Button } from './ui/button';
import { Camera, Image, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface InputButtonsProps {
  onImageCapture: (files: File[]) => void;
}

const InputButtons = ({ onImageCapture }: InputButtonsProps) => {
  const { t } = useLanguage();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleCamera = () => {
    cameraInputRef.current?.click();
  };

  const handleImages = () => {
    imageInputRef.current?.click();
  };

  const handlePDF = () => {
    pdfInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      onImageCapture(files);
      toast.success(t.analyzing);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      <Button 
        onClick={handleCamera}
        className="h-16 md:h-20 glass border-2 border-electric-blue/30 hover:border-electric-blue hover:glow-blue transition-all duration-300 group active:scale-95"
      >
        <Camera className="mr-3 h-7 w-7 text-electric-blue group-hover:scale-110 transition-transform" />
        <span className="text-xl font-semibold">{t.camera}</span>
      </Button>

      <Button 
        onClick={handleImages}
        className="h-16 md:h-20 glass border-2 border-primary/30 hover:border-primary hover:glow-gold transition-all duration-300 group active:scale-95"
      >
        <Image className="mr-3 h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xl font-semibold">{t.uploadImages}</span>
      </Button>

      <Button 
        onClick={handlePDF}
        className="h-16 md:h-20 glass border-2 border-accent/30 hover:border-accent hover:glow-blue transition-all duration-300 group active:scale-95"
      >
        <FileText className="mr-3 h-7 w-7 text-accent group-hover:scale-110 transition-transform" />
        <span className="text-xl font-semibold">{t.uploadPDF}</span>
      </Button>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
      
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default InputButtons;
