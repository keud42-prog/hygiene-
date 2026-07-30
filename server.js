const express = require('express');
const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Hygiene - LIVE OK ✅');
});

app.get('/api/test', (req, res) => {
  res.json({ status: "ok", message: "Serveur hygiene en ligne" });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur demarre sur le port ${PORT}`);
});
