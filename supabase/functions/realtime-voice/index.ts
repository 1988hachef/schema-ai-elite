import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get session config from request
    const { language, analysisContext } = await req.json();
    
    const langCode = language === 'ar' ? 'ar' : language === 'fr' ? 'fr' : 'en';
    
    const systemPrompt = language === 'ar' 
      ? `أنت مهندس كهرباء خبير متخصص في تحليل المخططات الكهربائية. تتحدث باللغة العربية بطريقة طبيعية واحترافية.

السياق الحالي للتحليل:
${analysisContext || 'لا يوجد تحليل حالياً'}

يمكنك:
- قراءة التحليل الكامل للمستخدم
- الإجابة على أسئلة محددة عن المخطط
- إعادة شرح نقاط معينة بطرق مختلفة
- تصحيح أي معلومات خاطئة في التحليل
- شرح كل مكون وعمله بالتفصيل

استجب بطريقة طبيعية وودودة كمهندس كهرباء محترف يشرح لزميل.`
      : language === 'fr'
      ? `Vous êtes un ingénieur électricien expert spécialisé dans l'analyse de schémas électriques. Vous parlez français de manière naturelle et professionnelle.

Contexte d'analyse actuel:
${analysisContext || 'Aucune analyse actuellement'}

Vous pouvez:
- Lire l'analyse complète à l'utilisateur
- Répondre à des questions spécifiques sur le schéma
- Réexpliquer certains points de différentes manières
- Corriger toute information incorrecte dans l'analyse
- Expliquer chaque composant et son fonctionnement en détail

Répondez de manière naturelle et amicale comme un ingénieur électricien professionnel qui explique à un collègue.`
      : `You are an expert electrical engineer specialized in analyzing electrical schematics. You speak English naturally and professionally.

Current analysis context:
${analysisContext || 'No analysis currently'}

You can:
- Read the complete analysis to the user
- Answer specific questions about the schematic
- Re-explain certain points in different ways
- Correct any incorrect information in the analysis
- Explain each component and its operation in detail

Respond naturally and friendly like a professional electrical engineer explaining to a colleague.`;

    // Create ephemeral token
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: systemPrompt,
        modalities: ["text", "audio"],
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        turn_detection: {
          type: "server_vad",
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 1000
        },
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
