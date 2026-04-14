/**
 * LLM service — mock por defecto, Gemini real si hay API key.
 */

const MOCK_RESPONSES = [
  'Buena pregunta. Vamos a desglosarlo paso a paso.\n\nPrimero, es importante entender el contexto. Cuando hablamos de este tema, nos referimos a un conjunto de practicas y herramientas que facilitan el desarrollo de software.\n\nEn resumen: la clave esta en automatizar lo repetitivo y centrarse en lo que aporta valor.',
  'Aqui tienes un ejemplo practico:\n\n```javascript\nconst result = data\n  .filter(item => item.active)\n  .map(item => item.name)\n  .sort();\n```\n\nEste patron es muy comun en aplicaciones modernas. La idea es encadenar operaciones de forma legible.',
  'Basandome en la literatura reciente, hay tres enfoques principales:\n\n1. **Enfoque clasico**: fiable pero lento\n2. **Enfoque moderno**: rapido pero requiere mas recursos\n3. **Enfoque hibrido**: combina lo mejor de ambos\n\nPara tu caso, recomendaria el enfoque hibrido.',
  'El error que describes suele estar causado por una de estas razones:\n\n- Falta de inicializacion de la variable\n- Scope incorrecto (la variable no es accesible donde la usas)\n- Problema de timing (async/await mal gestionado)\n\nPrueba a anadir un `console.log` justo antes de la linea que falla para verificar el estado.',
  'Aqui tienes los datos generados:\n\n```json\n[\n  {"id": 1, "nombre": "Alpha", "estado": "activo", "valor": 42.5},\n  {"id": 2, "nombre": "Beta", "estado": "pausado", "valor": 17.3},\n  {"id": 3, "nombre": "Gamma", "estado": "activo", "valor": 89.1}\n]\n```\n\nHe variado los estados y valores para que sea mas realista.',
];

async function generateResponse(promptContent) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    return callGemini(apiKey, promptContent);
  }

  return mockResponse(promptContent);
}

async function mockResponse(promptContent) {
  // Simula latencia de LLM (300-800ms)
  const delay = 300 + Math.floor(Math.random() * 500);
  await new Promise((resolve) => setTimeout(resolve, delay));

  const idx = Math.abs(hashCode(promptContent)) % MOCK_RESPONSES.length;
  return {
    model: 'mock',
    response: MOCK_RESPONSES[idx],
    duration_ms: delay,
  };
}

async function callGemini(apiKey, promptContent) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const start = Date.now();

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptContent }] }],
    }),
  });

  const duration_ms = Date.now() - start;

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta';

  return { model, response: text, duration_ms };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

module.exports = { generateResponse };
