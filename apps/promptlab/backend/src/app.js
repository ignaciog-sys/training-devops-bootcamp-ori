const express = require('express');
const cors = require('cors');
const { getDb } = require('./database');
const { generateResponse } = require('./llm');

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Prometheus metrics ----------
const prom = require('prom-client');
const httpRequests = new prom.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
});
const httpDuration = new prom.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});
const promptsTotal = new prom.Gauge({
  name: 'promptlab_prompts_total',
  help: 'Total prompts stored',
});
const responsesTotal = new prom.Gauge({
  name: 'promptlab_responses_total',
  help: 'Total LLM responses stored',
});

app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, path: req.path });
  res.on('finish', () => {
    end();
    httpRequests.inc({ method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});

// ---------- Health ----------
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'promptlab-api' });
});

// ---------- Metrics ----------
app.get('/metrics', async (_req, res) => {
  try {
    const db = getDb();
    promptsTotal.set(db.prepare('SELECT COUNT(*) as n FROM prompts').get().n);
    responsesTotal.set(db.prepare('SELECT COUNT(*) as n FROM responses').get().n);
    res.set('Content-Type', prom.register.contentType);
    res.end(await prom.register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// ---------- GET /api/prompts ----------
app.get('/api/prompts', (req, res) => {
  const db = getDb();
  const { category, search } = req.query;

  let sql = 'SELECT * FROM prompts';
  const conditions = [];
  const params = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(title LIKE ? OR content LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY updated_at DESC';

  res.json(db.prepare(sql).all(...params));
});

// ---------- GET /api/prompts/:id ----------
app.get('/api/prompts/:id', (req, res) => {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' });
  res.json(prompt);
});

// ---------- POST /api/prompts ----------
app.post('/api/prompts', (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO prompts (title, content, category) VALUES (?, ?, ?)'
  ).run(title, content, category || 'general');

  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(prompt);
});

// ---------- PUT /api/prompts/:id ----------
app.put('/api/prompts/:id', (req, res) => {
  const { title, content, category, rating } = req.body;
  const db = getDb();

  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Prompt not found' });

  db.prepare(`
    UPDATE prompts SET
      title = COALESCE(?, title),
      content = COALESCE(?, content),
      category = COALESCE(?, category),
      rating = COALESCE(?, rating),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title || null, content || null, category || null, rating ?? null, req.params.id);

  const updated = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ---------- DELETE /api/prompts/:id ----------
app.delete('/api/prompts/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Prompt not found' });

  db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
  res.json({ deleted: true, id: Number(req.params.id) });
});

// ---------- POST /api/prompts/:id/run ----------
app.post('/api/prompts/:id/run', async (req, res) => {
  const db = getDb();
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(req.params.id);
  if (!prompt) return res.status(404).json({ error: 'Prompt not found' });

  try {
    const { model, response, duration_ms } = await generateResponse(prompt.content);

    const result = db.prepare(
      'INSERT INTO responses (prompt_id, model, response, duration_ms) VALUES (?, ?, ?, ?)'
    ).run(prompt.id, model, response, duration_ms);

    const saved = db.prepare('SELECT * FROM responses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(saved);
  } catch (err) {
    res.status(502).json({ error: `LLM error: ${err.message}` });
  }
});

// ---------- GET /api/prompts/:id/responses ----------
app.get('/api/prompts/:id/responses', (req, res) => {
  const db = getDb();
  const responses = db.prepare(
    'SELECT * FROM responses WHERE prompt_id = ? ORDER BY created_at DESC'
  ).all(req.params.id);
  res.json(responses);
});

// ---------- GET /api/categories ----------
app.get('/api/categories', (_req, res) => {
  const db = getDb();
  const rows = db.prepare(
    'SELECT category, COUNT(*) as count FROM prompts GROUP BY category ORDER BY count DESC'
  ).all();
  res.json(rows);
});

module.exports = app;
