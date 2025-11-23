import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from './ui/card';

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
    if (language === 'ar') {
      return voices.find(v => v.lang.startsWith('ar')) || voices[0];
    } else if (language === 'fr') {
      return voices.find(v => v.lang.startsWith('fr')) || voices[0];
    } else {
      return voices.find(v => v.lang.startsWith('en')) || voices[0];
    }
  };

  const speak = () => {
    if ('speechSynthesis' in window) {
      const text = sections.map(s => `${s.title}. ${s.content}`).join('. ');
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = speed[0];
      utterance.voice = getVoice();
      
      utterance.onend = () => setIsPlaying(false);
      
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
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
    <Card className="glass p-6 sticky bottom-4 left-0 right-0 z-40">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-electric-blue">
            {t.audioNarration}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t.speed}:</span>
            <span className="text-sm font-medium text-primary">{speed[0]}x</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="icon"
            variant="outline"
            onClick={skipBackward}
            className="glass border-border/50"
          >
            <SkipBack className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            onClick={() => (isPlaying ? pause() : (window.speechSynthesis.paused ? resume() : speak()))}
            className="h-14 w-14 rounded-full gradient-blue glow-blue"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 ml-1" />
            )}
          </Button>

          <Button
            size="icon"
            variant="outline"
            onClick={skipForward}
            className="glass border-border/50"
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-2">
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={0.75}
            max={1.5}
            step={0.25}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.75x</span>
            <span>1.0x</span>
            <span>1.5x</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AudioNarration;
