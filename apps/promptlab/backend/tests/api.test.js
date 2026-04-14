const request = require('supertest');
const app = require('../src/app');
const { closeDb } = require('../src/database');

afterAll(() => closeDb());

describe('Health', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('promptlab-api');
  });
});

describe('Prompts CRUD', () => {
  let promptId;

  test('GET /api/prompts returns seeded prompts', async () => {
    const res = await request(app).get('/api/prompts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('POST /api/prompts creates a new prompt', async () => {
    const res = await request(app)
      .post('/api/prompts')
      .send({ title: 'Test prompt', content: 'Hola {nombre}', category: 'test' });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Test prompt');
    expect(res.body.category).toBe('test');
    expect(res.body.id).toBeDefined();
    promptId = res.body.id;
  });

  test('POST /api/prompts returns 400 without title', async () => {
    const res = await request(app)
      .post('/api/prompts')
      .send({ content: 'sin titulo' });
    expect(res.status).toBe(400);
  });

  test('GET /api/prompts/:id returns the created prompt', async () => {
    const res = await request(app).get(`/api/prompts/${promptId}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test prompt');
  });

  test('GET /api/prompts/:id returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/prompts/99999');
    expect(res.status).toBe(404);
  });

  test('PUT /api/prompts/:id updates the prompt', async () => {
    const res = await request(app)
      .put(`/api/prompts/${promptId}`)
      .send({ title: 'Updated', rating: 5 });
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.rating).toBe(5);
  });

  test('DELETE /api/prompts/:id deletes the prompt', async () => {
    const res = await request(app).delete(`/api/prompts/${promptId}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted).toBe(true);
  });

  test('DELETE /api/prompts/:id returns 404 for unknown id', async () => {
    const res = await request(app).delete('/api/prompts/99999');
    expect(res.status).toBe(404);
  });
});

describe('Filters', () => {
  test('GET /api/prompts?category=codigo filters by category', async () => {
    const res = await request(app).get('/api/prompts?category=codigo');
    expect(res.status).toBe(200);
    res.body.forEach((p) => expect(p.category).toBe('codigo'));
  });

  test('GET /api/prompts?search=refactoriza searches content', async () => {
    const res = await request(app).get('/api/prompts?search=refactoriza');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('Categories', () => {
  test('GET /api/categories returns category counts', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('category');
    expect(res.body[0]).toHaveProperty('count');
  });
});

describe('Run prompt (mock LLM)', () => {
  test('POST /api/prompts/:id/run returns a mock response', async () => {
    const prompts = await request(app).get('/api/prompts');
    const id = prompts.body[0].id;

    const res = await request(app).post(`/api/prompts/${id}/run`);
    expect(res.status).toBe(201);
    expect(res.body.model).toBe('mock');
    expect(res.body.response).toBeDefined();
    expect(res.body.duration_ms).toBeGreaterThan(0);
  });

  test('GET /api/prompts/:id/responses returns responses', async () => {
    const prompts = await request(app).get('/api/prompts');
    const id = prompts.body[0].id;

    const res = await request(app).get(`/api/prompts/${id}/responses`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
