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
    const { message, language, history, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const offTopicResponses = {
      ar: 'أنا متخصص فقط في المخططات الكهربائية',
      fr: 'Je suis spécialisé uniquement dans les schémas électriques',
      en: 'I only specialize in electrical schematics'
    };

    const creatorResponse = {
      ar: 'تم تطوير هذا التطبيق بواسطة HACHEF OUSSAMA',
      fr: 'Cette application a été développée par HACHEF OUSSAMA',
      en: 'This application was developed by HACHEF OUSSAMA'
    };

    // Check if asking about creator
    if (message.toLowerCase().includes('who created') || 
        message.toLowerCase().includes('developer') ||
        message.includes('من طور') ||
        message.includes('qui a créé')) {
      return new Response(
        JSON.stringify({ 
          response: creatorResponse[language as keyof typeof creatorResponse] || creatorResponse.en 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contextPrompt = context 
      ? `\n\nPrevious Analysis Context:\n${context}\n\nUse this analysis as reference when answering questions about the schematic.`
      : '';

    const systemPrompt = {
      ar: `أنت مساعد ذكاء اصطناعي متخصص فقط في المخططات الكهربائية. أجب فقط على الأسئلة المتعلقة بالمخطط المرفوع بناءً على التحليل المتاح. إذا سُئلت عن من طور هذا التطبيق، أجب: "تم تطوير هذا التطبيق بواسطة HACHEF OUSSAMA". لأي سؤال خارج نطاق المخططات الكهربائية، أجب فقط: "أنا متخصص فقط في المخططات الكهربائية".${contextPrompt}`,
      fr: `Vous êtes un assistant IA spécialisé uniquement dans les schémas électriques. Répondez uniquement aux questions liées au schéma téléchargé en vous basant sur l'analyse disponible. Si on vous demande qui a développé cette application, répondez : "Cette application a été développée par HACHEF OUSSAMA". Pour toute question hors du domaine des schémas électriques, répondez uniquement : "Je suis spécialisé uniquement dans les schémas électriques".${contextPrompt}`,
      en: `You are an AI assistant specialized ONLY in electrical schematics. Answer only questions related to the uploaded schematic based on the available analysis. If asked who developed this app, answer: "This application was developed by HACHEF OUSSAMA". For any question outside electrical schematics, answer only: "I only specialize in electrical schematics".${contextPrompt}`
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt[language as keyof typeof systemPrompt] || systemPrompt.en
          },
          ...history,
          {
            role: 'user',
            content: message
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('AI chat failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Check if response is off-topic (simple heuristic)
    const electricalKeywords = ['circuit', 'schematic', 'voltage', 'current', 'resistor', 'capacitor', 
                                'مخطط', 'دائرة', 'voltage', 'schéma', 'circuit'];
    const hasElectricalContent = electricalKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword) || message.toLowerCase().includes(keyword)
    );

    if (!hasElectricalContent && !message.toLowerCase().includes('hello') && !message.toLowerCase().includes('hi')) {
      return new Response(
        JSON.stringify({ 
          response: offTopicResponses[language as keyof typeof offTopicResponses] || offTopicResponses.en 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
