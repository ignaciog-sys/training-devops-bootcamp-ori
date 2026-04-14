# PromptLab

Guarda, organiza y prueba prompts de IA. App del Bootcamp DevOps 2026.

## Stack

| Componente | Tecnologia |
|------------|------------|
| Backend    | Node.js 20 + Express + SQLite |
| Frontend   | HTML/CSS/JS vanilla + Nginx |
| LLM        | Mock (por defecto) o Google Gemini (con API key) |

## Arrancar en local

```bash
cd backend
npm install
npm start
# http://localhost:3001

# En otra terminal:
cd frontend
npx serve public
# http://localhost:5173
```

## Tests y lint

```bash
cd backend
npm test
npm run lint
```

## Docker

```bash
docker compose up -d --build
# Frontend: http://localhost:8080
# Backend:  http://localhost:3001
```

## Conectar Gemini (opcional)

Crea un archivo `.env` en la raiz:

```
GEMINI_API_KEY=tu_api_key_aqui
GEMINI_MODEL=gemini-2.0-flash
```

Sin API key, el backend devuelve respuestas simuladas.

## API

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | /health | Health check |
| GET | /metrics | Prometheus metrics |
| GET | /api/prompts | Listar prompts (filtros: ?category=, ?search=) |
| GET | /api/prompts/:id | Detalle de un prompt |
| POST | /api/prompts | Crear prompt |
| PUT | /api/prompts/:id | Actualizar prompt |
| DELETE | /api/prompts/:id | Borrar prompt |
| POST | /api/prompts/:id/run | Ejecutar prompt contra LLM |
| GET | /api/prompts/:id/responses | Historial de respuestas |
| GET | /api/categories | Categorias con conteo |
