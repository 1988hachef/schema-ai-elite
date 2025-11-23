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
    const { message, language, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const offTopicResponses = {
      ar: 'أنا متخصص فقط في المخططات الكهربائية. من فضلك اسألني عن المخططات والدوائر الكهربائية.',
      fr: 'Je suis spécialisé uniquement dans les schémas électriques. Veuillez me poser des questions sur les schémas et circuits électriques.',
      en: 'I only specialize in electrical schematics. Please ask me about electrical schematics and circuits.'
    };

    const creatorResponse = {
      ar: 'تم تطوير هذا التطبيق بواسطة المهندس HACHEF OUSSAMA',
      fr: 'Cette application a été développée par l\'ingénieur HACHEF OUSSAMA',
      en: 'This application was developed by engineer HACHEF OUSSAMA'
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

    const systemPrompt = {
      ar: 'أنت مساعد ذكاء اصطناعي متخصص فقط في المخططات الكهربائية. أجب فقط على الأسئلة المتعلقة بالمخططات الكهربائية والدوائر والمكونات الكهربائية. لأي سؤال آخر، اذكر أنك متخصص فقط في المخططات الكهربائية.',
      fr: 'Vous êtes un assistant IA spécialisé uniquement dans les schémas électriques. Répondez uniquement aux questions liées aux schémas électriques, circuits et composants électriques. Pour toute autre question, mentionnez que vous êtes spécialisé uniquement dans les schémas électriques.',
      en: 'You are an AI assistant specialized ONLY in electrical schematics. Only answer questions related to electrical schematics, circuits, and electrical components. For any other question, mention that you only specialize in electrical schematics.'
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
