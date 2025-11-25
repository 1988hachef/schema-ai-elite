import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from './ui/card';
import { toast } from 'sonner';

interface AudioNarrationProps {
  sections: { title: string; content: string }[];
}

const AudioNarration = ({ sections }: AudioNarrationProps) => {
  const { t, language } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState([1.0]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const getVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    
    const langCode = language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en';
    
    // Try to find high-quality voices (prefer Microsoft, Google, or natural-sounding voices)
    const highQualityVoices = voices.filter(v => 
      v.lang.startsWith(langCode) && 
      (v.name.includes('Microsoft') || 
       v.name.includes('Google') || 
       v.name.includes('Natural') ||
       v.name.includes('Enhanced') ||
       v.localService === false) // Online voices are often better quality
    );
    
    if (highQualityVoices.length > 0) {
      return highQualityVoices[0];
    }
    
    // Fallback to any voice matching the language
    const matchingVoice = voices.find(v => v.lang.startsWith(langCode));
    return matchingVoice || voices[0];
  };

  const speak = () => {
    if (!('speechSynthesis' in window)) {
      const message =
        language === 'ar'
          ? 'الشرح الصوتي غير مدعوم على هذا الجهاز.'
          : language === 'fr'
          ? "La synthèse vocale n'est pas prise en charge sur cet appareil."
          : 'Audio narration is not supported on this device.';
      toast.error(message);
      return;
    }

    window.speechSynthesis.cancel();

    const text = sections.map(s => `${s.title}. ${s.content}`).join('. ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
    utterance.rate = speed[0];
    utterance.voice = getVoice();
    
    utterance.onend = () => setIsPlaying(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setIsPlaying(false);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setIsPlaying(true);
  };

  const skipBackward = () => {
    // Simple implementation: restart
    window.speechSynthesis.cancel();
    speak();
  };

  const skipForward = () => {
    // Simple implementation: stop
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  useEffect(() => {
    // Load voices
    window.speechSynthesis.getVoices();
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-40 glass p-3 rounded-xl border border-gold/20">
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={() => (isPlaying ? pause() : (window.speechSynthesis.paused ? resume() : speak()))}
          className="h-10 w-10 rounded-full gradient-blue"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" />
          )}
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={skipBackward}
          className="h-8 w-8"
        >
          <SkipBack className="h-3 w-3" />
        </Button>

        <Button
          size="icon"
          variant="ghost"
          onClick={skipForward}
          className="h-8 w-8"
        >
          <SkipForward className="h-3 w-3" />
        </Button>

        <div className="w-24">
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={0.75}
            max={1.5}
            step={0.25}
          />
        </div>
        <span className="text-xs text-muted-foreground min-w-[2.5rem]">{speed[0]}x</span>
      </div>
    </div>
  );
};

export default AudioNarration;
