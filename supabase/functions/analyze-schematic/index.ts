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
      ar: 'أنت مهندس كهربائي خبير متخصص فقط في تحليل المخططات الكهربائية بدقة واحترافية عالية. قدم تحليلاً شاملاً ومفصلاً ومنظماً لكل جزء من المخطط، مع شرح وافٍ لكل مكون ووظيفته وعلاقته بباقي المكونات. اجعل التحليل منطقياً ومتسلسلاً وسهل الفهم. رفض أي طلبات غير متعلقة بالمخططات الكهربائية.',
      fr: 'Vous êtes un ingénieur électricien expert spécialisé uniquement dans l\'analyse précise et professionnelle de schémas électriques. Fournissez une analyse complète, détaillée et organisée de chaque partie du schéma, avec une explication approfondie de chaque composant, sa fonction et sa relation avec les autres composants. Rendez l\'analyse logique, séquentielle et facile à comprendre. Refusez toute demande non liée aux schémas électriques.',
      en: 'You are an expert electrical engineer specialized ONLY in precise and professional analysis of electrical schematics. Provide a comprehensive, detailed, and organized analysis of each part of the schematic, with thorough explanation of each component, its function, and its relationship with other components. Make the analysis logical, sequential, and easy to understand. Refuse any requests not related to electrical schematics.'
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
                text: 'Provide a highly detailed, engineering-level electrical schematic analysis. Organize the response into clear, numbered sections with strong titles. For each section: (1) identify precisely which component or zone of the schematic is being discussed, (2) explain its role and how current/signal flows through it, (3) describe how it connects to previous and next stages, (4) follow the power/control/signal paths step by step from source to load, and (5) highlight all protection and safety aspects. The style must be professional, structured, and suitable for electrical engineers.'
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

    // Return single comprehensive analysis without colored sections
    const sections = [
      {
        title: language === 'ar' ? 'التحليل الكامل' : language === 'fr' ? 'Analyse Complète' : 'Complete Analysis',
        content: content,
        color: '#D4AF37'
      }
    ];

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
