# Intégration API IA pour Génération de Script

## Vue d'ensemble

Le composant `RecordTab` inclut une fonctionnalité d'amélioration de script par IA. Actuellement, il utilise une version simulée. Voici comment intégrer une vraie API.

## Structure du Prompt

Le prompt est construit automatiquement avec toutes les données de la campagne :

```javascript
const prompt = buildAIPrompt();
// Contient :
// - Campaign Objective
// - Sender Name & Title
// - Company Info
// - Target Persona
// - Language
// - Video Structure (segments avec durées)
// - Requirements détaillés
```

## Format de Réponse Attendu

L'API doit retourner un JSON avec cette structure :

```json
{
  "sections": [
    {
      "name": "Problem",
      "content": "Hi {prénom}, I know that companies like {company} often face..."
    },
    {
      "name": "Solution",
      "content": "At CompanyName, we've developed a proven approach..."
    }
  ],
  "full": "Hello {prénom},\n\n[All sections combined]\n\nBest regards,\n{SenderName}"
}
```

## Options d'Intégration

### Option 1: API Route Next.js (Recommandé)

Créer `/pages/api/generate-script.js` :

```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context } = req.body;

  try {
    // Exemple avec OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional video script writer. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const scriptContent = JSON.parse(data.choices[0].message.content);
    
    return res.status(200).json({ script: scriptContent });
  } catch (error) {
    console.error('Error generating script:', error);
    return res.status(500).json({ error: 'Failed to generate script' });
  }
}
```

### Option 2: Claude API (Anthropic)

```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  }),
});
```

### Option 3: Backend Dédié

Si vous avez déjà un backend, créer un endpoint :

```
POST /api/v1/campaigns/generate-script
Body: { prompt, context }
Response: { script: { sections, full } }
```

## Mise à Jour du Composant

Dans `RecordTab/index.js`, remplacer la section TODO (ligne ~191) :

```javascript
const improveScriptWithAI = async () => {
  setIsGeneratingScript(true);
  
  try {
    const prompt = buildAIPrompt();
    
    // Appel API réel
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt, 
        context: {
          campaignObjective: values.campaignObjective,
          senderName: values.senderName,
          companyInfo: values.companyInfo,
          targetPersona: values.targetPersona,
          language: values.language,
          videoStructure: values.videoStructureData,
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate script');
    }
    
    const data = await response.json();
    const improvedScript = data.script;
    
    setScript(improvedScript);
    setScriptHistory((prev) => [...prev, improvedScript]);
    setFieldValue("videoScript", improvedScript);
    
  } catch (error) {
    console.error("Error generating script:", error);
    alert("Error generating script. Please try again.");
  } finally {
    setIsGeneratingScript(false);
  }
};
```

## Variables d'Environnement

Ajouter dans `.env.local` :

```env
OPENAI_API_KEY=sk-...
# ou
ANTHROPIC_API_KEY=sk-ant-...
```

## Amélioration du Prompt

Le prompt peut être amélioré en ajoutant :

1. **Exemples de scripts réussis** : Inclure des exemples dans le prompt
2. **Ton et style** : Spécifier le ton souhaité (professionnel, décontracté, etc.)
3. **Longueur cible** : Basé sur les durées des segments
4. **Contexte industriel** : Si disponible dans les données de la campagne

## Test

Pour tester sans API réelle, la fonction `generateImprovedScript()` simule une amélioration basique.


