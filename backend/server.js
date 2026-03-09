// ─────────────────────────────────────────────────────────────
// DIYA Backend Server — Express + WebSocket + Google Gemini
// ─────────────────────────────────────────────────────────────
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Gemini Config ──
const GEMINI_MODEL      = 'gemini-2.5-flash';
const GEMINI_MODEL_FAST = 'gemini-2.5-flash';
const GEMINI_API_URL    = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_KEY           = process.env.key;

// ─────────────────────────────────────────
// Helper — build Gemini contents array
// ─────────────────────────────────────────
function buildContents(messages) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: Array.isArray(m.content)
      ? m.content.map(c => {
          if (c.type === 'image') {
            return { inline_data: { mime_type: c.source.media_type, data: c.source.data } };
          }
          return { text: c.text || String(c) };
        })
      : [{ text: m.content }],
  }));
}

// ─────────────────────────────────────────
// Helper — regular Gemini call
// ─────────────────────────────────────────
async function callGemini({ model, system, messages, maxTokens = 2000, temperature = 0.3 }) {
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: buildContents(messages),
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    }),
  });

  if (!res.ok) throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return { content: [{ text }] };
}

// ─────────────────────────────────────────
// Helper — streaming Gemini call
// ─────────────────────────────────────────
async function callGeminiStream({ model, system, messages, maxTokens = 1500, temperature = 0.5 }) {
  const url = `${GEMINI_API_URL}/${model}:streamGenerateContent?alt=sse&key=${API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: buildContents(messages),
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    }),
  });

  if (!res.ok) throw new Error(`Gemini stream error ${res.status}: ${await res.text()}`);
  return res;
}

// ─────────────────────────────────────────
// Helper — parse base64 image from string
// ─────────────────────────────────────────
function parseBase64(imageBase64) {
  const match = imageBase64?.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) return null;
  return { type: 'base64', media_type: match[1], data: match[2] };
}

// ─────────────────────────────────────────
// SYSTEM PROMPT — DIYA's persona
// ─────────────────────────────────────────
const DIYA_SYSTEM = `You are DIYA — an expert AI-powered DIY repair assistant.
Your capabilities:
- Analyze device images to identify devices, components, and damage
- Generate step-by-step repair instructions tailored to what you see
- Detect safety hazards (exposed capacitors, live wires, heat risks, wrong tools)
- Track repair progress and update guidance in real time
- Answer follow-up questions in a friendly, precise manner

Output format for /api/analyze:
Always respond with valid JSON only (no markdown, no explanation outside JSON):
{
  "device": "Device name and model",
  "confidence": 0-100,
  "diagnosis": "What issue you see",
  "complexity": "Beginner|Intermediate|Advanced",
  "estimatedTime": "e.g. 30-45 min",
  "toolsRequired": ["tool1", "tool2"],
  "safetyAlerts": [
    { "level": "critical|warning|info", "message": "Alert message" }
  ],
  "steps": [
    { "id": 1, "title": "Step title", "description": "Detailed instruction", "completed": false }
  ],
  "currentFocus": "What the user should do right now",
  "progressDetected": "Any progress from previous state"
}`;

// ─────────────────────────────────────────
// POST /api/analyze — Gemini Vision
// ─────────────────────────────────────────
app.post('/api/analyze', upload.single('frame'), async (req, res) => {
  try {
    const { previousSteps, sessionContext, userQuestion, imageBase64 } = req.body;

    const content = [];

    // Image from multipart upload
    if (req.file) {
      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: req.file.mimetype,
          data: req.file.buffer.toString('base64'),
        },
      });
    }
    // Image from base64 JSON
    else if (imageBase64) {
      const src = parseBase64(imageBase64);
      if (src) content.push({ type: 'image', source: src });
    }

    content.push({
      type: 'text',
      text: [
        userQuestion || 'Analyze this image for device repair guidance.',
        previousSteps ? `Previously completed steps: ${previousSteps}` : '',
        sessionContext ? `Session context: ${sessionContext}` : '',
      ].filter(Boolean).join('\n'),
    });

    const response = await callGemini({
      model: GEMINI_MODEL,
      system: DIYA_SYSTEM,
      messages: [{ role: 'user', content }],
      maxTokens: 2000,
      temperature: 0.3,
    });

    const text = response.content?.[0]?.text || '{}';
    const clean = text.replace(/```json|```/g, '').trim();

    let analysis;
    try { analysis = JSON.parse(clean); }
    catch { analysis = { error: 'Parse error', raw: text }; }

    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// POST /api/chat/stream — Streaming chat
// ─────────────────────────────────────────
app.post('/api/chat/stream', async (req, res) => {
  const { messages, deviceContext } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const systemPrompt = `${DIYA_SYSTEM}\n\nCurrent repair context: ${deviceContext || 'General DIY assistance'}`;

    const streamRes = await callGeminiStream({
      model: GEMINI_MODEL_FAST,
      system: systemPrompt,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
        } catch {}
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// ─────────────────────────────────────────
// POST /api/safety-check
// ─────────────────────────────────────────
app.post('/api/safety-check', upload.single('frame'), async (req, res) => {
  try {
    const content = [];

    if (req.body.imageBase64) {
      const src = parseBase64(req.body.imageBase64);
      if (src) content.push({ type: 'image', source: src });
    }

    content.push({
      type: 'text',
      text: `Perform a SAFETY ONLY analysis. Look for: exposed wires, capacitors, incorrect tools, thermal risks, sharp edges, or any hazard.
Respond ONLY with JSON: { "safe": true|false, "alerts": [{"level":"critical|warning|info","message":"..."}], "immediateAction": "what to do right now if unsafe" }`,
    });

    const response = await callGemini({
      model: GEMINI_MODEL_FAST,
      system: 'You are a device repair safety expert. Only output JSON. Be very sensitive to electrical and physical hazards.',
      messages: [{ role: 'user', content }],
      maxTokens: 500,
      temperature: 0.1,
    });

    const text = response.content?.[0]?.text || '{}';
    let safety;
    try { safety = JSON.parse(text.replace(/```json|```/g, '').trim()); }
    catch { safety = { safe: true, alerts: [], immediateAction: '' }; }

    res.json({ success: true, safety });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─────────────────────────────────────────
// GET /api/health
// ─────────────────────────────────────────
app.get('/api/health', (_, res) => {
  res.json({
    status: 'ok',
    provider: 'Google Gemini',
    model: GEMINI_MODEL,
    time: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────
// WebSocket — Real-time frame analysis
// ─────────────────────────────────────────
wss.on('connection', (ws) => {
  console.log('📡 WebSocket client connected');
  let sessionContext = {};

  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'frame' && msg.imageBase64) {
        const src = parseBase64(msg.imageBase64);
        if (!src) return;

        const response = await callGemini({
          model: GEMINI_MODEL_FAST,
          system: 'You are DIYA safety monitor. Be concise. Only output JSON.',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: src },
              {
                type: 'text',
                text: `Quick analysis of repair state. Context: ${JSON.stringify(sessionContext)}
Respond with JSON: { "status": "ok|warning|critical", "observation": "brief", "nextAction": "brief instruction", "safetyAlert": null|"alert message" }`,
              },
            ],
          }],
          maxTokens: 300,
          temperature: 0.1,
        });

        const text = response.content?.[0]?.text || '{}';
        let analysis;
        try { analysis = JSON.parse(text.replace(/```json|```/g, '').trim()); }
        catch { analysis = { status: 'ok', observation: text, nextAction: '', safetyAlert: null }; }

        ws.send(JSON.stringify({ type: 'frame_analysis', analysis }));
      }

      if (msg.type === 'set_context') {
        sessionContext = msg.context;
        ws.send(JSON.stringify({ type: 'context_set', ok: true }));
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', message: err.message }));
    }
  });

  ws.on('close', () => console.log('📡 Client disconnected'));
});

// ─────────────────────────────────────────
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🔧 DIYA Backend  → http://localhost:${PORT}`);
  console.log(`📡 WebSocket     → ws://localhost:${PORT}/ws`);
  console.log(`🤖 Provider      → Google Gemini`);
  console.log(`🧠 Main model    → ${GEMINI_MODEL}`);
  console.log(`⚡ Fast model    → ${GEMINI_MODEL_FAST}\n`);
});