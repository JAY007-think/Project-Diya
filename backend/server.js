// ═══════════════════════════════════════════════════════════════
// DIYA Backend — Express + WebSocket + Google Gemini
// ═══════════════════════════════════════════════════════════════
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app    = express();
const server = createServer(app);
const wss    = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const GEMINI_MODEL      = 'gemini-2.5-flash';
const GEMINI_MODEL_FAST = 'gemini-2.0-flash-001';
const GEMINI_BASE       = 'https://generativelanguage.googleapis.com/v1beta/models';
const API_KEY           = process.env.GEMINI_API_KEY;

if (!API_KEY) { console.error('\n❌  GEMINI_API_KEY not set in .env!\n'); process.exit(1); }

const DIYA_SYSTEM = `You are DIYA — a friendly, expert AI-powered DIY repair assistant with a warm, witty personality.

REPAIR CAPABILITIES:
- Identify devices from images with high accuracy
- Generate clear step-by-step repair instructions
- Detect safety hazards: capacitors, live wires, heat risks, sharp edges
- Track repair progress and adapt guidance in real time

PERSONALITY:
- Warm, encouraging, and occasionally funny
- Respond naturally to greetings like "hi", "hello", "how are you"
- Chat casually about tech, gadgets, general topics
- Always guide conversations back to repairs when appropriate
- Never be robotic — be genuinely helpful and human

OUTPUT FORMAT for /api/analyze — return ONLY valid JSON, no markdown, no extra text:
{
  "device": "exact device name and model",
  "confidence": 85,
  "diagnosis": "clear description of the issue",
  "complexity": "Beginner|Intermediate|Advanced",
  "estimatedTime": "30-45 min",
  "toolsRequired": ["tool1", "tool2"],
  "safetyAlerts": [{ "level": "critical|warning|info", "message": "..." }],
  "steps": [{ "id": 1, "title": "Step title", "description": "Detailed instruction", "completed": false }],
  "currentFocus": "What the user should do right now",
  "progressDetected": "Any visible progress"
}`;

function toContents(messages) {
  return messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: Array.isArray(m.content)
      ? m.content.map(c => c.type === 'image'
          ? { inline_data: { mime_type: c.source.media_type, data: c.source.data } }
          : { text: c.text || String(c) })
      : [{ text: m.content }],
  }));
}

async function gemini({ model, system, messages, maxTokens = 2000, temperature = 0.3 }) {
  const res = await fetch(`${GEMINI_BASE}/${model}:generateContent?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: toContents(messages),
      generationConfig: { maxOutputTokens: maxTokens, temperature },
    }),
  });
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseBase64(str) {
  const m = str?.match(/^data:(image\/\w+);base64,(.+)$/);
  return m ? { type: 'base64', media_type: m[1], data: m[2] } : null;
}

function parseJSON(text) {
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return null; }
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', provider: 'Google Gemini', model: GEMINI_MODEL, time: new Date().toISOString() });
});

app.post('/api/analyze', upload.single('frame'), async (req, res) => {
  try {
    const { previousSteps, sessionContext, userQuestion, imageBase64 } = req.body;
    const content = [];
    if (req.file) {
      content.push({ type: 'image', source: { type: 'base64', media_type: req.file.mimetype, data: req.file.buffer.toString('base64') } });
    } else if (imageBase64) {
      const src = parseBase64(imageBase64);
      if (src) content.push({ type: 'image', source: src });
    }
    if (!content.length) return res.status(400).json({ success: false, error: 'No image provided' });
    content.push({ type: 'text', text: [
      userQuestion || 'Analyze this image for device repair guidance.',
      previousSteps ? `Previously completed: ${previousSteps}` : '',
      sessionContext ? `Context: ${sessionContext}` : '',
    ].filter(Boolean).join('\n') });
    const raw = await gemini({ model: GEMINI_MODEL, system: DIYA_SYSTEM, messages: [{ role: 'user', content }] });
    const analysis = parseJSON(raw) || { error: 'Parse error', raw };
    res.json({ success: true, analysis });
  } catch (err) {
    console.error('Analyze error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/chat/stream', async (req, res) => {
  const { messages, deviceContext } = req.body;
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  try {
    const text = await gemini({
      model: GEMINI_MODEL_FAST,
      system: `${DIYA_SYSTEM}\n\nContext: ${deviceContext || 'General DIY and tech help'}`,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      maxTokens: 1500, temperature: 0.7,
    });
    if (!text) throw new Error('Empty response');
    const words = text.split(' ');
    for (let i = 0; i < words.length; i += 4) {
      const chunk = words.slice(i, i + 4).join(' ') + (i + 4 < words.length ? ' ' : '');
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      await new Promise(r => setTimeout(r, 12));
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Chat error:', err.message);
    res.write(`data: ${JSON.stringify({ text: `Oops! ${err.message} — try again 🙂` })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.post('/api/safety-check', upload.single('frame'), async (req, res) => {
  try {
    const content = [];
    if (req.body.imageBase64) {
      const src = parseBase64(req.body.imageBase64);
      if (src) content.push({ type: 'image', source: src });
    }
    content.push({ type: 'text', text: `SAFETY ONLY. Check: wires, capacitors, tools, heat.\nJSON: { "safe":true|false, "alerts":[{"level":"critical|warning|info","message":"..."}], "immediateAction":"..." }` });
    const raw = await gemini({ model: GEMINI_MODEL_FAST, system: 'Repair safety expert. JSON only.', messages: [{ role: 'user', content }], maxTokens: 500, temperature: 0.1 });
    const safety = parseJSON(raw) || { safe: true, alerts: [], immediateAction: '' };
    res.json({ success: true, safety });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

wss.on('connection', (ws) => {
  let ctx = {};
  ws.on('message', async (data) => {
    try {
      const msg = JSON.parse(data);
      if (msg.type === 'frame' && msg.imageBase64) {
        const src = parseBase64(msg.imageBase64);
        if (!src) return;
        const raw = await gemini({
          model: GEMINI_MODEL_FAST, system: 'DIYA safety monitor. JSON only.',
          messages: [{ role: 'user', content: [
            { type: 'image', source: src },
            { type: 'text', text: `State: ${JSON.stringify(ctx)}\nJSON: {"status":"ok|warning|critical","observation":"","nextAction":"","safetyAlert":null}` },
          ]}], maxTokens: 200, temperature: 0.1,
        });
        ws.send(JSON.stringify({ type: 'frame_analysis', analysis: parseJSON(raw) || { status: 'ok' } }));
      }
      if (msg.type === 'set_context') { ctx = msg.context; ws.send(JSON.stringify({ type: 'context_set', ok: true })); }
    } catch (err) { ws.send(JSON.stringify({ type: 'error', message: err.message })); }
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`\n🔧 DIYA → http://localhost:${PORT} | 🤖 ${GEMINI_MODEL}\n`);
});