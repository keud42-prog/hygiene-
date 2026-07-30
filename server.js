require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

let pool;
try {
  pool = require('./db');
  console.log("✅ Neon branché");
} catch(e) { console.log("❌ DB erreur", e.message); }

// Créer les tables auto
async function initDB() {
  if(!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracabilite (id SERIAL PRIMARY KEY, produit TEXT, lot TEXT, date DATE, temperature TEXT, action TEXT, created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS temperatures (id SERIAL PRIMARY KEY, equipement TEXT, temp FLOAT, conforme BOOLEAN, date TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS dlc (id SERIAL PRIMARY KEY, produit TEXT, dlc DATE, lot TEXT, created_at TIMESTAMP DEFAULT NOW());
    CREATE TABLE IF NOT EXISTS nettoyage (id SERIAL PRIMARY KEY, zone TEXT, produit TEXT, fait_par TEXT, date TIMESTAMP DEFAULT NOW());
  `);
  console.log("✅ Tables HACCP prêtes");
}
initDB();

// API ROUTES
app.get('/api/tracabilite', async (req,res) => {
  const r = await pool.query('SELECT * FROM tracabilite ORDER BY id DESC');
  res.json(r.rows);
});
app.post('/api/tracabilite', async (req,res) => {
  const {produit, lot, date, temperature, action} = req.body;
  const r = await pool.query('INSERT INTO tracabilite (produit, lot, date, temperature, action) VALUES ($1,$2,$3,$4,$5) RETURNING *', [produit, lot, date, temperature, action]);
  res.json(r.rows[0]);
});

app.get('/api/temperatures', async (req,res) => {
  const r = await pool.query('SELECT * FROM temperatures ORDER BY id DESC');
  res.json(r.rows);
});
app.post('/api/temperatures', async (req,res) => {
  const {equipement, temp} = req.body;
  const conforme = parseFloat(temp) <= 4;
  const r = await pool.query('INSERT INTO temperatures (equipement, temp, conforme) VALUES ($1,$2,$3) RETURNING *', [equipement, temp, conforme]);
  res.json(r.rows[0]);
});

app.get('/api/dlc', async (req,res) => {
  const r = await pool.query('SELECT * FROM dlc ORDER BY dlc ASC');
  res.json(r.rows);
});
app.post('/api/dlc', async (req,res) => {
  const {produit, dlc, lot} = req.body;
  const r = await pool.query('INSERT INTO dlc (produit, dlc, lot) VALUES ($1,$2,$3) RETURNING *', [produit, dlc, lot]);
  res.json(r.rows[0]);
});

app.get('/api/nettoyage', async (req,res) => {
  const r = await pool.query('SELECT * FROM nettoyage ORDER BY id DESC');
  res.json(r.rows);
});
app.post('/api/nettoyage', async (req,res) => {
  const {zone, produit, fait_par} = req.body;
  const r = await pool.query('INSERT INTO nettoyage (zone, produit, fait_par) VALUES ($1,$2,$3) RETURNING *', [zone, produit, fait_par]);
  res.json(r.rows[0]);
});

// PAGE PRINCIPALE HACCP
app.get('/', (req,res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HACCP - Mon Resto</title>
<style>
body{font-family:Arial;background:#f4f6f8;margin:0;padding:10px}
.card{background:white;padding:15px;border-radius:10px;margin-bottom:15px;box-shadow:0 2px 5px #0001}
h1{background:#16a34a;color:white;padding:15px;border-radius:10px;text-align:center}
h2{color:#16a34a;border-bottom:2px solid #16a34a;padding-bottom:5px}
input,select,button{width:100%;padding:10px;margin:5px 0;border-radius:5px;border:1px solid #ccc;box-sizing:border-box}
button{background:#16a34a;color:white;font-weight:bold;border:none;cursor:pointer}
button:active{background:#15803d}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border:1px solid #ddd;padding:6px;text-align:left}
th{background:#16a34a;color:white}
.badge{padding:3px 8px;border-radius:10px;color:white;font-size:11px}
.ok{background:#16a34a}.ko{background:#dc2626}
.tabs{display:flex;gap:5px;margin-bottom:10px;overflow:auto}
.tab{padding:10px 15px;background:#ddd;border-radius:20px;cursor:pointer;white-space:nowrap}
.tab.active{background:#16a34a;color:white}
.section{display:none}.section.active{display:block}
</style>
</head>
<body>
<h1>✅ HACCP LIVE - ${new Date().toLocaleDateString('fr-FR')}</h1>

<div class="tabs">
<div class="tab active" onclick="showTab('traca')">📦 Traçabilité</div>
<div class="tab" onclick="showTab('temp')">🌡️ Frigos</div>
<div class="tab" onclick="showTab('dlc')">📅 DLC</div>
<div class="tab" onclick="showTab('net')">🧹 Nettoyage</div>
</div>

<div id="traca" class="section active card">
<h2>Traçabilité Réception</h2>
<input id="t_produit" placeholder="Produit (ex: Poulet)">
<input id="t_lot" placeholder="N° Lot">
<input id="t_date" type="date">
<input id="t_temp" placeholder="T° à réception (ex: 2°C)">
<input id="t_action" placeholder="Action (Conforme / Refusé)">
<button onclick="addTraca()">Enregistrer Réception</button>
<table><thead><tr><th>Date</th><th>Produit</th><th>Lot</th><th>T°</th><th>Action</th></tr></thead><tbody id="list_traca"></tbody></table>
</div>

<div id="temp" class="section card">
<h2>Relevé Températures</h2>
<select id="temp_equip"><option>Frigo Positif 1</option><option>Frigo Positif 2</option><option>Frigo Négatif</option><option>Vitrine</option></select>
<input id="temp_val" type="number" step="0.1" placeholder="Température ex: 3.2">
<button onclick="addTemp()">Enregistrer T°</button>
<table><thead><tr><th>Date</th><th>Equipement</th><th>T°</th><th>Etat</th></tr></thead><tbody id="list_temp"></tbody></table>
</div>

<div id="dlc" class="section card">
<h2>Gestion DLC</h2>
<input id="dlc_produit" placeholder="Produit">
<input id="dlc_lot" placeholder="Lot">
<input id="dlc_date" type="date">
<button onclick="addDlc()">Ajouter DLC</button>
<table><thead><tr><th>Produit</th><th>Lot</th><th>DLC</th></tr></thead><tbody id="list_dlc"></tbody></table>
</div>

<div id="net" class="section card">
<h2>Plan Nettoyage</h2>
<input id="n_zone" placeholder="Zone (ex: Plan de travail, Sol)">
<input id="n_produit" placeholder="Produit utilisé">
<input id="n_par" placeholder="Fait par">
<button onclick="addNet()">Valider Nettoyage</button>
<table><thead><tr><th>Date</th><th>Zone</th><th>Produit</th><th>Par</th></tr></thead><tbody id="list_net"></tbody></table>
</div>

<script>
function showTab(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  event.target.classList.add('active');
}
async function addTraca(){
  await fetch('/api/tracabilite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produit:t_produit.value, lot:t_lot.value, date:t_date.value, temperature:t_temp.value, action:t_action.value})});
  load();
}
async function addTemp(){
  await fetch('/api/temperatures',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({equipement:temp_equip.value, temp:temp_val.value})});
  load();
}
async function addDlc(){
  await fetch('/api/dlc',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({produit:dlc_produit.value, lot:dlc_lot.value, dlc:dlc_date.value})});
  load();
}
async function addNet(){
  await fetch('/api/nettoyage',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({zone:n_zone.value, produit:n_produit.value, fait_par:n_par.value})});
  load();
}
async function load(){
  let r = await fetch('/api/tracabilite'); let d = await r.json();
  list_traca.innerHTML = d.map(x=>`<tr><td>${new Date(x.created_at).toLocaleString()}</td><td>${x.produit}</td><td>${x.lot}</td><td>${x.temperature}</td><td>${x.action}</td></tr>`).join('');
  r = await fetch('/api/temperatures'); d = await r.json();
  list_temp.innerHTML = d.map(x=>`<tr><td>${new Date(x.date).toLocaleString()}</td><td>${x.equipement}</td><td>${x.temp}°C</td><td><span class="badge ${x.conforme?'ok':'ko'}">${x.conforme?'OK':'NON CONFORME'}</span></td></tr>`).join('');
  r = await fetch('/api/dlc'); d = await r.json();
  list_dlc.innerHTML = d.map(x=>`<tr><td>${x.produit}</td><td>${x.lot}</td><td>${new Date(x.dlc).toLocaleDateString()}</td></tr>`).join('');
  r = await fetch('/api/nettoyage'); d = await r.json();
  list_net.innerHTML = d.map(x=>`<tr><td>${new Date(x.date).toLocaleString()}</td><td>${x.zone}</td><td>${x.produit}</td><td>${x.fait_par}</td></tr>`).join('');
}
load();
</script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("HACCP en ligne sur "+PORT));
