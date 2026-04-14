const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'promptlab.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initTables();
    seedIfEmpty();
  }
  return db;
}

function initTables() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      rating INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt_id INTEGER NOT NULL,
      model TEXT NOT NULL DEFAULT 'mock',
      response TEXT NOT NULL,
      duration_ms INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (prompt_id) REFERENCES prompts(id) ON DELETE CASCADE
    );
  `);
}

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as n FROM prompts').get().n;
  if (count > 0) return;

  const insert = db.prepare(
    'INSERT INTO prompts (title, content, category, rating) VALUES (?, ?, ?, ?)'
  );

  const seeds = [
    ['Explica como a un nino', 'Explicame {concepto} como si tuviera 10 anos. Usa analogias simples y ejemplos cotidianos.', 'educacion', 4],
    ['Refactoriza este codigo', 'Refactoriza el siguiente codigo para mejorar legibilidad y rendimiento. Explica cada cambio.\n\n```\n{codigo}\n```', 'codigo', 5],
    ['Resumen de paper', 'Resume el siguiente paper academico en 3 parrafos: contexto, metodologia y conclusiones.\n\n{texto}', 'investigacion', 3],
    ['Debug paso a paso', 'Tengo este error: {error}. El codigo relevante es:\n\n```\n{codigo}\n```\n\nGuiame paso a paso para encontrar y solucionar el bug.', 'codigo', 4],
    ['Genera datos de prueba', 'Genera un JSON con {n} registros de ejemplo para una API de {dominio}. Incluye campos realistas y variados.', 'datos', 3],
    ['Prompt de sistema', 'Escribe un system prompt para un asistente de IA especializado en {tema}. Debe ser conciso, claro y definir el tono y los limites.', 'ia', 5],
    ['Traduce codigo', 'Traduce el siguiente codigo de {lenguaje_origen} a {lenguaje_destino}. Mantén la misma logica y anade comentarios explicando diferencias.\n\n```\n{codigo}\n```', 'codigo', 2],
    ['Plan de estudio', 'Crea un plan de estudio de {duracion} para aprender {tema} desde cero. Incluye recursos, ejercicios practicos y checkpoints.', 'educacion', 4],
  ];

  const insertMany = db.transaction((items) => {
    for (const [title, content, category, rating] of items) {
      insert.run(title, content, category, rating);
    }
  });

  insertMany(seeds);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, closeDb };
