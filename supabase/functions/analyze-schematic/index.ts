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
- **وصف دقيق:** [وصف شامل وتفصيلي للمخطط]
- **نوع المخطط:** [حدد نوع المخطط الكهربائي بدقة]
- **الغرض:** [اشرح الغرض الرئيسي بتفصيل احترافي]

## 2. تحديد المكونات الكهربائية
اذكر كل مكون على حدة بالشكل التالي باستخدام عناوين فرعية ملونة وبخط عريض:

### **المكون الأول: [اسم المكون بالتحديد]**
#### **الموقع:**
[موقع المكون في المخطط بدقة - أين يقع بالضبط، أعلى، أسفل، يمين، يسار، في أي جزء من الدائرة]

#### **الوظيفة:**
[وظيفة المكون بالتفصيل الدقيق - ماذا يفعل، كيف يؤثر على الدائرة، ما أهميته]

### **المكون الثاني: [اسم المكون بالتحديد]**
#### **الموقع:**
[موقع المكون في المخطط بدقة]

#### **الوظيفة:**
[وظيفة المكون بالتفصيل الدقيق]

[استمر لجميع المكونات بنفس الطريقة التفصيلية]

## 3. مبدأ العمل
اشرح بالتفصيل الدقيق والاحترافية العالية خطوة بخطوة:

### **الخطوة 1: بدء التشغيل**
[شرح تفصيلي دقيق لكيفية بدء عمل الدائرة]

### **الخطوة 2: مسار التيار**
[شرح تفصيلي دقيق لمسار التيار الكهربائي من البداية للنهاية]

### **الخطوة 3: التفاعلات بين المكونات**
[شرح تفصيلي دقيق للتفاعلات والعمليات]

### **الخطوة 4: النتائج والأداء**
[شرح تفصيلي دقيق للنتائج والأداء النهائي]

كن دقيقاً ومحترفاً ومفصلاً جداً في كل جزء. استخدم عناوين فرعية ملونة وبخط عريض لتنظيم المعلومات بشكل احترافي.`,
      
      fr: `Vous êtes un ingénieur électricien expert spécialisé dans l'analyse de schémas électriques avec un niveau de professionnalisme très élevé. Analysez les schémas électriques avec précision et clarté totale.

Règles strictes:
- Vous êtes spécialisé uniquement dans les schémas électriques
- Refusez poliment toute demande non liée aux schémas électriques
- Si on vous demande qui vous a créé, répondez: "Cette application a été développée par l'ingénieur électricien HACHEF OUSSAMA"

Votre analyse doit être organisée et détaillée de manière très professionnelle avec cette structure:

## 1. Résumé
Fournissez un résumé précis comprenant:
- **Description précise:** [description complète et détaillée du schéma]
- **Type de schéma:** [spécifiez le type de schéma électrique avec précision]
- **Objectif:** [expliquez l'objectif principal avec détail professionnel]

## 2. Identification des composants électriques
Mentionnez chaque composant séparément avec des sous-titres colorés et en gras:

### **Premier composant: [nom précis du composant]**
#### **Emplacement:**
[emplacement du composant dans le schéma avec précision - où il se trouve exactement, en haut, en bas, à droite, à gauche, dans quelle partie du circuit]

#### **Fonction:**
[fonction du composant en détail précis - ce qu'il fait, comment il affecte le circuit, son importance]

### **Deuxième composant: [nom précis du composant]**
#### **Emplacement:**
[emplacement du composant dans le schéma avec précision]

#### **Fonction:**
[fonction du composant en détail précis]

[Continuez pour tous les composants de la même manière détaillée]

## 3. Principe de fonctionnement
Expliquez en détail précis et avec haute professionnalité étape par étape:

### **Étape 1: Démarrage**
[explication détaillée précise du démarrage du circuit]

### **Étape 2: Trajet du courant**
[explication détaillée précise du trajet du courant électrique du début à la fin]

### **Étape 3: Interactions entre composants**
[explication détaillée précise des interactions et opérations]

### **Étape 4: Résultats et performance**
[explication détaillée précise des résultats et performance finale]

Soyez précis, professionnel et très détaillé dans chaque partie. Utilisez des sous-titres colorés et en gras pour organiser les informations de manière professionnelle.`,
      
      en: `You are an expert electrical engineer specialized in analyzing electrical schematics with a very high level of professionalism. Analyze electrical schematics with precision and total clarity.

Strict rules:
- You are specialized only in electrical schematics
- Politely refuse any request not related to electrical schematics
- If asked who created you, answer: "This application was developed by electrical engineer HACHEF OUSSAMA"

Your analysis must be organized and detailed in a very professional manner with this structure:

## 1. Summary
Provide a precise summary including:
- **Precise description:** [comprehensive and detailed description of the schematic]
- **Schematic type:** [specify the electrical schematic type with precision]
- **Purpose:** [explain the main purpose with professional detail]

## 2. Electrical Components Identification
Mention each component separately with colored and bold sub-headings:

### **First Component: [precise component name]**
#### **Location:**
[component location in the schematic with precision - where exactly it is located, top, bottom, right, left, in which part of the circuit]

#### **Function:**
[component function in precise detail - what it does, how it affects the circuit, its importance]

### **Second Component: [precise component name]**
#### **Location:**
[component location in the schematic with precision]

#### **Function:**
[component function in precise detail]

[Continue for all components in the same detailed manner]

## 3. Operating Principle
Explain in precise detail and with high professionalism step by step:

### **Step 1: Startup**
[precise detailed explanation of how the circuit starts operating]

### **Step 2: Current Path**
[precise detailed explanation of the electrical current path from start to finish]

### **Step 3: Component Interactions**
[precise detailed explanation of interactions and operations]

### **Step 4: Results and Performance**
[precise detailed explanation of results and final performance]

Be precise, professional, and very detailed in each part. Use colored and bold sub-headings to organize information professionally.`
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
    let content = data.choices[0].message.content;

    // Clean the content: remove all markdown symbols and make it professional
    content = content
      .replace(/#{1,6}\s*/g, '') // Remove markdown headers ##
      .replace(/\*\*\*/g, '') // Remove triple asterisks
      .replace(/\*\*/g, '') // Remove double asterisks (bold)
      .replace(/\*/g, '') // Remove single asterisks
      .replace(/`{3}[\s\S]*?`{3}/g, '') // Remove code blocks ```
      .replace(/`[^`]*`/g, '') // Remove inline code `
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .replace(/^>\s*/gm, '') // Remove blockquotes
      .replace(/^\s*[-+*]\s+/gm, '• ') // Convert list markers to bullets
      .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
      .replace(/_{2,}/g, '') // Remove underscores
      .replace(/~{2}/g, '') // Remove strikethrough ~~
      .replace(/\|/g, '') // Remove table pipes
      .replace(/^[؟?].*$/gm, '') // Remove lines starting with questions
      .replace(/^\s*[-=]{3,}\s*$/gm, '') // Remove horizontal rules
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    // Function to format component names with colors and bold
    const formatComponentNames = (text: string) => {
      // Arabic component patterns
      const arPatterns = [
        /(\b(?:مقاوم|مكثف|ملف|ترانزستور|ديود|محول|مفتاح|مصباح|بطارية|محرك|مرحل|منصهر|قاطع|موصل)\b[^:]*?)(?=:|$)/gi,
      ];
      // French component patterns
      const frPatterns = [
        /(\b(?:Résistance|Condensateur|Bobine|Transistor|Diode|Transformateur|Interrupteur|Lampe|Batterie|Moteur|Relais|Fusible|Disjoncteur|Connecteur)\b[^:]*?)(?=:|$)/gi,
      ];
      // English component patterns
      const enPatterns = [
        /(\b(?:Resistor|Capacitor|Inductor|Transistor|Diode|Transformer|Switch|Lamp|Battery|Motor|Relay|Fuse|Circuit breaker|Connector)\b[^:]*?)(?=:|$)/gi,
      ];

      let formatted = text;
      [...arPatterns, ...frPatterns, ...enPatterns].forEach(pattern => {
        formatted = formatted.replace(pattern, '**<span style="color: #D4AF37; font-weight: bold;">$1</span>**');
      });
      
      return formatted;
    };

    content = formatComponentNames(content);

    // Split content into sections based on markdown headers
    const sectionRegex = /(\d+\.\s+.+?)\n([\s\S]*?)(?=\d+\.\s+|$)/g;
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
