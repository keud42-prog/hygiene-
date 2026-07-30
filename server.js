const express = require('express');
const app = express();
app.use(express.json());

let db = { livraisons: [], temperatures: [], nettoyages: [] };

// MANIFEST POUR VRAIE APPLI
app.get('/manifest.json', (req,res) => {
  res.json({
    name: "HACCP Resto",
    short_name: "HACCP",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16a34a",
    start_url: "/",
    icons: [{src: "https://cdn-icons-png.flaticon.com/512/1046/1046784.png", sizes: "512x512", type: "image/png"}]
  });
});

app.get('/api/data', (req,res) => res.json(db));
app.post('/api/data', (req,res) => { db = req.body; res.json({ok:true}); });

app.get('/', (req,res) => {
res.send(`
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HACCP Resto</title>
<link rel="manifest" href="/manifest.json">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="HACCP">
<link rel="apple-touch-icon" href="https://cdn-icons-png.flaticon.com/512/1046/1046784.png">
<style>
body{font-family:sans-serif;background:#f0fdf4;margin:0;padding:15px}
.card{background:white;padding:15px;border-radius:12px;margin-bottom:15px;box-shadow:0 2px 8px #0001}
h1{color:#16a34a;text-align:center}
button{background:#16a34a;color:white;border:none;padding:12px;border-radius:8px;width:100%;font-weight:bold;font-size:16px}
input,select{width:100%;padding:10px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box}
.tab{display:flex;gap:5px;margin-bottom:15px}
.tab button{background:#e5e7eb;color:#333;flex:1}
.tab button.active{background:#16a34a;color:white}
</style>
</head>
<body>
<h1>✅ HACCP LIVE</h1>
<div class="tab">
<button onclick="show('liv')" id="b-liv" class="active">Livraison</button>
<button onclick="show('temp')" id="b-temp">Températures</button>
<button onclick="show('net')" id="b-net">Nettoyage</button>
</div>

<div id="liv" class="card">
<h3>🚚 Livraison</h3>
<input id="l-four" placeholder="Fournisseur">
<input id="l-prod" placeholder="Produit">
<input id="l-temp" type="number" placeholder="Température °C">
<select id="l-conf"><option>Conforme</option><option>Non Conforme</option></select>
<button onclick="addLiv()">Ajouter Livraison</button>
<div id="list-liv"></div>
</div>

<div id="temp" class="card" style="display:none">
<h3>🌡️ Température Frigo</h3>
<select id="t-equip"><option>Frigo Positif</option><option>Frigo Négatif</option><option>Vitrine</option></select>
<input id="t-val" type="number" placeholder="Température °C">
<button onclick="addTemp()">Ajouter Température</button>
<div id="list-temp"></div>
</div>

<div id="net" class="card" style="display:none">
<h3>🧹 Nettoyage</h3>
<input id="n-zone" placeholder="Zone / Matériel">
<select id="n-prod"><option>Détergent</option><option>Désinfectant</option></select>
<button onclick="addNet()">Valider Nettoyage</button>
<div id="list-net"></div>
</div>

<script>
let data={livraisons:[],temperatures:[],nettoyages:[]};
async function load(){ let r=await fetch('/api/data'); data=await r.json(); render(); }
function show(id){ document.getElementById('liv').style.display=id=='liv'?'block':'none'; document.getElementById('temp').style.display=id=='temp'?'block':'none'; document.getElementById('net').style.display=id=='net'?'block':'none'; document.querySelectorAll('.tab button').forEach(b=>b.classList.remove('active')); document.getElementById('b-'+id).classList.add('active'); }
async function save(){ await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}); render(); }
function addLiv(){ data.livraisons.unshift({date:new Date().toLocaleString(),four:document.getElementById('l-four').value,prod:document.getElementById('l-prod').value,temp:document.getElementById('l-temp').value,conf:document.getElementById('l-conf').value}); save(); }
function addTemp(){ data.temperatures.unshift({date:new Date().toLocaleString(),equip:document.getElementById('t-equip').value,val:document.getElementById('t-val').value}); save(); }
function addNet(){ data.nettoyages.unshift({date:new Date().toLocaleString(),zone:document.getElementById('n-zone').value,prod:document.getElementById('n-prod').value}); save(); }
function render(){ document.getElementById('list-liv').innerHTML=data.livraisons.map(x=>\`<p>📅 \${x.date} - \${x.four} - \${x.prod} (\${x.temp}°C) - <b>\${x.conf}</b></p>\`).join(''); document.getElementById('list-temp').innerHTML=data.temperatures.map(x=>\`<p>📅 \${x.date} - \${x.equip}: <b>\${x.val}°C</b></p>\`).join(''); document.getElementById('list-net').innerHTML=data.nettoyages.map(x=>\`<p>📅 \${x.date} - \${x.zone} - \${x.prod}</p>\`).join(''); }
load();
</script>
</body>
</html>
`);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('OK '+PORT));
