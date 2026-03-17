require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const membersRouter = require('./routes/members');
const stepsRouter = require('./routes/steps');

// Initialize DB (runs schema + seed)
require('./db');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// In dev, allow Vite's dev server; in prod, same origin so no CORS needed
if (!isProd) {
  app.use(cors({ origin: 'http://localhost:5173' }));
}

app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/steps', stepsRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Serve React build in production
if (isProd) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  // All non-API routes return the React app (client-side routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
