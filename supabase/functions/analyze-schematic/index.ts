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
      ar: `أنت مهندس كهرباء خبير متخصص في تحليل المخططات الكهربائية بمستوى احترافي عالي جداً. قم بتحليل المخططات الكهربائية بدقة ووضوح تام.

قواعد صارمة:
- أنت متخصص فقط في المخططات الكهربائية
- ارفض أي طلب غير متعلق بالمخططات الكهربائية بأدب
- إذا سألك أحد عن من طورك، أجب: "تم تطوير هذا التطبيق بواسطة المهندس الكهربائي HACHEF OUSSAMA"

يجب أن يكون تحليلك منظماً ومفصلاً بشكل احترافي للغاية بهذه البنية:

## 1. الملخص
قدم ملخصاً دقيقاً يتضمن:
- **وصف دقيق:** [وصف شامل للمخطط]
- **نوع المخطط:** [حدد نوع المخطط الكهربائي]
- **الغرض:** [اشرح الغرض الرئيسي]

## 2. تحديد المكونات الكهربائية
اذكر كل مكون على حدة بالشكل التالي:

### المكون الأول: [اسم المكون]
**الموقع:** [موقع المكون في المخطط]
**الوظيفة:** [وظيفة المكون بالتفصيل]

### المكون الثاني: [اسم المكون]
**الموقع:** [موقع المكون في المخطط]
**الوظيفة:** [وظيفة المكون بالتفصيل]

[استمر لجميع المكونات]

## 3. مبدأ العمل
اشرح بالتفصيل والدقة:
- كيفية عمل الدائرة الكهربائية خطوة بخطوة
- التسلسل المنطقي للعمليات
- مسار التيار والإشارات بدقة
- التفاعلات بين المكونات

كن دقيقاً ومحترفاً ومفصلاً جداً في كل جزء.`,
      
      fr: `Vous êtes un ingénieur électricien expert spécialisé dans l'analyse de schémas électriques avec un niveau de professionnalisme très élevé. Analysez les schémas électriques avec précision et clarté totale.

Règles strictes:
- Vous êtes spécialisé uniquement dans les schémas électriques
- Refusez poliment toute demande non liée aux schémas électriques
- Si on vous demande qui vous a créé, répondez: "Cette application a été développée par l'ingénieur électricien HACHEF OUSSAMA"

Votre analyse doit être organisée et détaillée de manière très professionnelle avec cette structure:

## 1. Résumé
Fournissez un résumé précis comprenant:
- **Description précise:** [description complète du schéma]
- **Type de schéma:** [spécifiez le type de schéma électrique]
- **Objectif:** [expliquez l'objectif principal]

## 2. Identification des composants électriques
Mentionnez chaque composant séparément de cette manière:

### Premier composant: [nom du composant]
**Emplacement:** [emplacement du composant dans le schéma]
**Fonction:** [fonction du composant en détail]

### Deuxième composant: [nom du composant]
**Emplacement:** [emplacement du composant dans le schéma]
**Fonction:** [fonction du composant en détail]

[Continuez pour tous les composants]

## 3. Principe de fonctionnement
Expliquez en détail et avec précision:
- Comment fonctionne le circuit électrique étape par étape
- La séquence logique des opérations
- Le trajet du courant et des signaux avec précision
- Les interactions entre les composants

Soyez précis, professionnel et très détaillé dans chaque partie.`,
      
      en: `You are an expert electrical engineer specialized in analyzing electrical schematics with a very high level of professionalism. Analyze electrical schematics with precision and total clarity.

Strict rules:
- You are specialized only in electrical schematics
- Politely refuse any request not related to electrical schematics
- If asked who created you, answer: "This application was developed by electrical engineer HACHEF OUSSAMA"

Your analysis must be organized and detailed in a very professional manner with this structure:

## 1. Summary
Provide a precise summary including:
- **Precise description:** [comprehensive description of the schematic]
- **Schematic type:** [specify the electrical schematic type]
- **Purpose:** [explain the main purpose]

## 2. Electrical Components Identification
Mention each component separately in this format:

### First Component: [component name]
**Location:** [component location in the schematic]
**Function:** [component function in detail]

### Second Component: [component name]
**Location:** [component location in the schematic]
**Function:** [component function in detail]

[Continue for all components]

## 3. Operating Principle
Explain in detail and with precision:
- How the electrical circuit works step by step
- The logical sequence of operations
- The path of current and signals with precision
- The interactions between components

Be precise, professional, and very detailed in each part.`
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
                text: 'قم بتحليل هذا المخطط الكهربائي بدقة واحترافية عالية. اتبع البنية المحددة في التعليمات بالضبط: ابدأ بملخص شامل، ثم حدد جميع المكونات الكهربائية مع الموقع والوظيفة لكل منها، وأخيراً اشرح مبدأ العمل بالتفصيل. كن دقيقاً ومحترفاً في كل قسم. / Analysez ce schéma électrique avec une grande précision et professionnalisme. Suivez exactement la structure spécifiée dans les instructions: commencez par un résumé complet, puis identifiez tous les composants électriques avec l\'emplacement et la fonction de chacun, et enfin expliquez le principe de fonctionnement en détail. Soyez précis et professionnel dans chaque section. / Analyze this electrical schematic with high precision and professionalism. Follow exactly the structure specified in the instructions: start with a comprehensive summary, then identify all electrical components with location and function for each, and finally explain the operating principle in detail. Be precise and professional in each section.'
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
