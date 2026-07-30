require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { demarrerTaches } = require('./cron');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- API des modules ---
app.use('/api/temperatures', require('./routes/temperatures'));
app.use('/api/tracabilite', require('./routes/tracabilite'));
app.use('/api/nettoyage-quotidien', require('./routes/nettoyage-quotidien'));
app.use('/api/nettoyage-periodique', require('./routes/nettoyage-periodique'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// --- Frontend React compile (present apres "npm run build" dans /frontend) ---
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- Tache planifiee 04h00 ---
demarrerTaches();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Serveur demarre sur http://localhost:${PORT}`));
