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
    const { images, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const systemPrompt = {
      ar: 'أنت مهندس كهربائي خبير متخصص فقط في تحليل المخططات الكهربائية. قم بتحليل المخطط خطوة بخطوة مع شرح كل مكون ووظيفته. استخدم عناوين ملونة واضحة. رفض أي طلبات غير متعلقة بالمخططات الكهربائية.',
      fr: 'Vous êtes un ingénieur électricien expert spécialisé uniquement dans l\'analyse de schémas électriques. Analysez le schéma étape par étape en expliquant chaque composant et sa fonction. Utilisez des titres colorés clairs. Refusez toute demande non liée aux schémas électriques.',
      en: 'You are an expert electrical engineer specialized ONLY in analyzing electrical schematics. Analyze the schematic step-by-step explaining each component and its function. Use clear colored titles. Refuse any requests not related to electrical schematics.'
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
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this electrical schematic in detail. Break it down into sections with colored titles: 1) Power Supply (red), 2) Control Circuit (blue), 3) Signal Path (green), 4) Protection Devices (yellow). For each section, explain components and connections.'
              },
              ...images.map((img: string) => ({
                type: 'image_url',
                image_url: { url: img }
              }))
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('AI API Error:', error);
      throw new Error('AI analysis failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the response into colored sections
    const sections = [
      {
        title: language === 'ar' ? 'إمداد الطاقة' : language === 'fr' ? 'Alimentation' : 'Power Supply',
        content: content.split('\n\n')[0] || content,
        color: '#ef4444'
      },
      {
        title: language === 'ar' ? 'دائرة التحكم' : language === 'fr' ? 'Circuit de contrôle' : 'Control Circuit',
        content: content.split('\n\n')[1] || '',
        color: '#3b82f6'
      },
      {
        title: language === 'ar' ? 'مسار الإشارة' : language === 'fr' ? 'Chemin du signal' : 'Signal Path',
        content: content.split('\n\n')[2] || '',
        color: '#22c55e'
      },
      {
        title: language === 'ar' ? 'أجهزة الحماية' : language === 'fr' ? 'Dispositifs de protection' : 'Protection Devices',
        content: content.split('\n\n')[3] || '',
        color: '#eab308'
      }
    ].filter(section => section.content);

    return new Response(
      JSON.stringify({ sections }),
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
