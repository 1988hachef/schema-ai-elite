import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeVoice';

interface InteractiveVoiceAnalysisProps {
  analysisContext: string;
}

const InteractiveVoiceAnalysis = ({ analysisContext }: InteractiveVoiceAnalysisProps) => {
  const { language } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getMessage = (key: string) => {
    const messages = {
      ar: {
        start: 'ابدأ التحليل الصوتي',
        stop: 'أوقف التحليل الصوتي',
        connecting: 'جاري الاتصال...',
        connected: 'متصل - يمكنك التحدث الآن',
        disconnected: 'تم قطع الاتصال',
        error: 'خطأ في الاتصال',
        listening: 'أستمع...',
        speaking: 'يتحدث...',
      },
      fr: {
        start: 'Démarrer l\'analyse vocale',
        stop: 'Arrêter l\'analyse vocale',
        connecting: 'Connexion...',
        connected: 'Connecté - Vous pouvez parler maintenant',
        disconnected: 'Déconnecté',
        error: 'Erreur de connexion',
        listening: 'J\'écoute...',
        speaking: 'Parle...',
      },
      en: {
        start: 'Start Voice Analysis',
        stop: 'Stop Voice Analysis',
        connecting: 'Connecting...',
        connected: 'Connected - You can speak now',
        disconnected: 'Disconnected',
        error: 'Connection error',
        listening: 'Listening...',
        speaking: 'Speaking...',
      }
    };
    return messages[language][key] || messages.en[key];
  };

  const startVoiceAnalysis = async () => {
    try {
      toast.info(getMessage('connecting'));

      // Get ephemeral token
      const { data, error } = await supabase.functions.invoke('realtime-voice', {
        body: { language, analysisContext }
      });

      if (error) throw error;
      if (!data.client_secret?.value) throw new Error('Failed to get token');

      const EPHEMERAL_KEY = data.client_secret.value;

      // Create WebSocket connection
      const ws = new WebSocket(
        `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`,
        ['realtime', `openai-insecure-api-key.${EPHEMERAL_KEY}`, 'openai-beta.realtime-v1']
      );

      ws.onopen = async () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        toast.success(getMessage('connected'));

        // Start audio recording
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
        recorderRef.current = new AudioRecorder((audioData) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: encodeAudioForAPI(audioData)
            }));
          }
        });
        await recorderRef.current.start();
        setIsListening(true);
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('Received:', data.type);

        if (data.type === 'session.created') {
          // Session is ready
          console.log('Session created successfully');
        } else if (data.type === 'response.audio.delta') {
          const binaryString = atob(data.delta);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          if (audioContextRef.current) {
            await playAudioData(audioContextRef.current, bytes);
          }
          setIsSpeaking(true);
        } else if (data.type === 'response.audio.done') {
          setIsSpeaking(false);
        } else if (data.type === 'input_audio_buffer.speech_started') {
          setIsListening(true);
          console.log('User started speaking');
        } else if (data.type === 'input_audio_buffer.speech_stopped') {
          setIsListening(false);
          console.log('User stopped speaking');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error(getMessage('error'));
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsListening(false);
        setIsSpeaking(false);
        toast.info(getMessage('disconnected'));
        cleanup();
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Error starting voice analysis:', error);
      toast.error(getMessage('error'));
    }
  };

  const stopVoiceAnalysis = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    cleanup();
  };

  const cleanup = () => {
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    clearAudioQueue();
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {!isConnected ? (
        <Button
          onClick={startVoiceAnalysis}
          size="lg"
          className="gradient-blue text-white shadow-lg hover:shadow-xl transition-all"
        >
          <Mic className="h-5 w-5 mr-2" />
          {getMessage('start')}
        </Button>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="glass p-3 rounded-lg border border-gold/20 flex items-center gap-3">
            {isListening && (
              <div className="flex items-center gap-2 text-electric-blue">
                <Mic className="h-5 w-5 animate-pulse" />
                <span className="text-sm">{getMessage('listening')}</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-gold">
                <Volume2 className="h-5 w-5 animate-pulse" />
                <span className="text-sm">{getMessage('speaking')}</span>
              </div>
            )}
          </div>
          <Button
            onClick={stopVoiceAnalysis}
            variant="destructive"
            size="lg"
            className="shadow-lg"
          >
            <MicOff className="h-5 w-5 mr-2" />
            {getMessage('stop')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default InteractiveVoiceAnalysis;
