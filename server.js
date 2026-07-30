const express = require('express');
const app = express();
app.get('/', (req,res)=>{
res.send(`
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{font-family:sans-serif;margin:0;background:#f2f2f2}
.tabs{display:flex;background:white;position:sticky;top:0}
.tab{flex:1;padding:15px;text-align:center;border-bottom:3px solid #ccc}
.tab.active{border-color:#25D366;font-weight:bold}
.page{padding:15px;display:none}.page.active{display:block}
.card{background:white;padding:12px;border-radius:12px;margin:10px 0;box-shadow:0 2px 5px #0001}
input,select{width:100%;padding:12px;margin:5px 0;border:1px solid #ddd;border-radius:8px;box-sizing:border-box}
button{width:100%;padding:14px;border:0;border-radius:10px;font-size:16px;font-weight:bold;margin-top:8px}
.btn-green{background:#25D366;color:white}.btn-blue{background:#007bff;color:white}.btn-red{background:#ff3b30;color:white}
</style>
</head>
<body>
<div class="tabs">
<div class="tab active" onclick="show('frigo')">❄️ Frigos</div>
<div class="tab" onclick="show('stock')">📦 Stock</div>
<div class="tab" onclick="show('envoi')">📲 Envoi</div>
</div>

<div id="frigo" class="page active">
<h2>❄️ Relevé Frigos</h2>
<div class="card">
<select id="f"><option>Frigo 1 Positif</option><option>Frigo 2 Négatif</option><option>Vitrine</option><option>Chambre froide</option></select>
<input id="t" type="number" step="0.1" placeholder="Température ex: 3.2">
<button class="btn-blue" onclick="addF()">+ Ajouter relevé</button>
</div>
<div id="lf"></div>
</div>

<div id="stock" class="page">
<h2>📦 Stock / DLC</h2>
<div class="card">
<input id="n" placeholder="Produit ex: Poulet">
<input id="q" placeholder="Quantité ex: 5kg">
<input id="d" placeholder="DLC ex: 06/08/26">
<button class="btn-green" onclick="addS()">+ Ajouter produit</button>
</div>
<div id="ls"></div>
</div>

<div id="envoi" class="page">
<h2>📲 Envoyer</h2>
<div class="card">
<button class="btn-green" onclick="sendWA()">Envoyer TOUT sur WhatsApp</button>
<button class="btn-red" onclick="if(confirm('Effacer tout?')){frigos=[];stocks=[];render();}">🗑️ Tout effacer</button>
</div>
</div>

<script>
let frigos=JSON.parse(localStorage.getItem('f')||'[]');
let stocks=JSON.parse(localStorage.getItem('s')||'[]');
function show(p){
document.querySelectorAll('.page').forEach(e=>e.classList.remove('active'));
document.querySelectorAll('.tab').forEach(e=>e.classList.remove('active'));
document.getElementById(p).classList.add('active');
event.target.classList.add('active');
}
function addF(){
if(!t.value)return alert('Température?');
frigos.push({f:f.value,t:t.value,h:new Date().toLocaleString()});
localStorage.setItem('f',JSON.stringify(frigos));render();t.value='';
}
function addS(){
if(!n.value)return;
stocks.push({n:n.value,q:q.value,d:d.value});
localStorage.setItem('s',JSON.stringify(stocks));render();n.value='';q.value='';d.value='';
}
function render(){
lf.innerHTML=frigos.map((x,i)=>\`<div class="card">\${x.f} : <b>\${x.t}°C</b><br><small>\${x.h}</small> <span onclick="frigos.splice(\${i},1);localStorage.setItem('f',JSON.stringify(frigos));render()" style="float:right;color:red">X</span></div>\`).join('');
ls.innerHTML=stocks.map((x,i)=>\`<div class="card"><b>\${x.n}</b> - \${x.q} - DLC \${x.d} <span onclick="stocks.splice(\${i},1);localStorage.setItem('s',JSON.stringify(stocks));render()" style="float:right;color:red">X</span></div>\`).join('');
}
function sendWA(){
let txt="*RAPPORT HACCP -
