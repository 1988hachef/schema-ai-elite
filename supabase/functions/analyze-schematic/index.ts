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
      ar: 'أنت مهندس كهربائي خبير متخصص فقط في تحليل المخططات الكهربائية بدقة واحترافية عالية. قدم تحليلاً منظماً في أقسام منفصلة، كل قسم يركز على جزء محدد من المخطط. لكل قسم: (1) حدد بدقة المكون أو المنطقة التي يتم مناقشتها، (2) اشرح دوره وكيف يتدفق التيار/الإشارة خلاله، (3) صف كيف يتصل بالمراحل السابقة واللاحقة، (4) تتبع مسارات الطاقة/التحكم/الإشارة خطوة بخطوة من المصدر إلى الحمل، (5) سلط الضوء على جميع جوانب الحماية والأمان. رفض أي طلبات غير متعلقة بالمخططات الكهربائية.',
      fr: 'Vous êtes un ingénieur électricien expert spécialisé uniquement dans l\'analyse précise et professionnelle de schémas électriques. Fournissez une analyse organisée en sections distinctes, chaque section se concentrant sur une partie spécifique du schéma. Pour chaque section: (1) identifiez précisément le composant ou la zone discutée, (2) expliquez son rôle et comment le courant/signal circule à travers, (3) décrivez comment il se connecte aux étapes précédentes et suivantes, (4) suivez les chemins de puissance/contrôle/signal étape par étape de la source à la charge, (5) mettez en évidence tous les aspects de protection et de sécurité. Refusez toute demande non liée aux schémas électriques.',
      en: 'You are an expert electrical engineer specialized ONLY in precise and professional analysis of electrical schematics. Provide an organized analysis in distinct sections, each section focusing on a specific part of the schematic. For each section: (1) precisely identify which component or zone is being discussed, (2) explain its role and how current/signal flows through it, (3) describe how it connects to previous and next stages, (4) follow power/control/signal paths step by step from source to load, (5) highlight all protection and safety aspects. Refuse any requests not related to electrical schematics.'
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
                text: 'Analyze this electrical schematic in 5-7 distinct sections. Each section must focus on one specific component, circuit stage, or functional block. Start each section with a clear, bold title indicating the component/stage being analyzed (e.g., "## 1. Power Supply Input Stage", "## 2. Protection Circuit - Circuit Breaker"). Then provide detailed engineering analysis: identify exact components, explain current flow, describe connections to other stages, trace power/control/signal paths, and highlight safety features. Make each section self-contained but show how it connects to the overall system. Be extremely detailed and professional.'
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

    // Split content into sections based on markdown headers
    const sectionRegex = /##\s+\d+\.\s+(.+?)\n([\s\S]*?)(?=##\s+\d+\.|$)/g;
    const sections = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DFE6E9', '#74B9FF'];
    
    let match;
    let index = 0;
    while ((match = sectionRegex.exec(content)) !== null) {
      sections.push({
        title: match[1].trim(),
        content: match[2].trim(),
        color: colors[index % colors.length]
      });
      index++;
    }

    // If no sections found, return full content as single section
    if (sections.length === 0) {
      sections.push({
        title: language === 'ar' ? 'التحليل الكامل' : language === 'fr' ? 'Analyse Complète' : 'Complete Analysis',
        content: content,
        color: '#D4AF37'
      });
    }

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
