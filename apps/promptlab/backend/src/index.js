const app = require('./app');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PromptLab API running on http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Metrics: http://localhost:${PORT}/metrics`);
  console.log(`Mode: ${process.env.GEMINI_API_KEY ? 'Gemini real' : 'Mock LLM'}`);
});
