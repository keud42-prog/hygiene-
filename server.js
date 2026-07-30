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
.card{background:white;padding:12px;border-radius:12px;margin:10px 0}
input,select{width:100%;padding:12px;margin:5px 0;border-radius:8px;border:1px solid #ddd}
button{width:100%;padding:14px;border:0;border-radius:10px;font-size:16px;font-weight:bold;margin-top:8px}
.btn-green{background:#25D366;color:white}.btn-blue{background:#007bff;color:white}.btn-red{background:#ff3b30;color:white}
</style></head><body>
<div class="tabs">
<div class="tab active" id="t1" onclick="show('frigo','t1')">❄️ Frigos</div>
<div class="tab" id="t2" onclick="show('stock','t2')">📦 Stock</div>
<div class="tab" id="t3" onclick="show('envoi','t3')">📲 Envoi</div>
</div>

<div id="frigo" class="page active">
<h2>❄️ Frigos</h2>
<div class="card">
<select id="f"><option>Frigo 1 Positif</option><option>Frigo 2 Negatif</option><option>Vitrine</option><option>Chambre froide</option></select>
<input id="temp" type="number" step="0.1" placeholder="Temperature ex: 3.2">
<button class="btn-blue" onclick="addF()">+ Ajouter releve</button>
</div><div id="lf"></div>
</div>

<div id="stock" class="page">
<h2>📦 Stock / DLC</h2>
<div class="card">
<input id="n" placeholder="Produit ex: Poulet">
<input id="q" placeholder="Quantite ex: 5kg">
<input id="d" placeholder="DLC ex: 06/08/26">
<button class="btn-green" onclick="addS()">+ Ajouter produit</button>
</div><div id="ls"></div>
</div>

<div id="envoi" class="page">
<h2>📲 Envoyer</h2>
<div class="card">
<button class="btn-green" onclick="sendWA()">Envoyer TOUT sur WhatsApp</button>
<button class="btn-red" onclick="if(confirm('Effacer?')){frigos=[];stocks=[];save();render();}">Effacer tout</button>
</div>
</div>

<script>
let frigos=JSON.parse(localStorage.getItem('f')||'[]');
let stocks=JSON.parse(localStorage.getItem('s')||'[]');
function show(p,t){
