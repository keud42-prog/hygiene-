const express = require('express');
const app = express();
app.use(express.json({limit:'20mb'}));
let db={livraisons:[],temperatures:[],nettoyages:[],manques:[],stocks:[{id:1,name:"Liquide vaisselle",qty:3,seuil:1},{id:2,name:"Eponges",qty:5,seuil:2},{id:3,name:"Gants jetables",qty:10,seuil:3},{id:4,name:"Papier essuie-mains",qty:4,seuil:1},{id:5,name:"Produit sol",qty:2,seuil:1},{id:6,name:"Sacs poubelle",qty:15,seuil:5}]};
app.get('/api/data',(req,res)=>res.json(db));
app.post('/api/data',(req,res)=>{db=req.body;res.json({ok:true})});
app.get('/',(req,res)=>{
res.send(`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>HACCP</title><style>body{font-family:sans-serif;background:#f5f5f7;margin:0}.header{background:#fff;padding:20px;border-bottom:1px solid #ddd;position:sticky;top:0}#alert{display:none;background:#ff3b30;color:#fff;padding:12px;margin:12px;border-radius:12px}.tabs{display:flex;background:#e8e8ed;margin:12px;border-radius:12px;padding:3px}.tabs button{flex:1;border:none;padding:10px;border-radius:8px;font-weight:600}.tabs button.active{background:#fff}.card{background:#fff;margin:12px;border-radius:16px;padding:16px}input,textarea,select{width:100%;padding:12px;border-radius:10px;border:none;background:#f5f5f7;margin-top:8px;box-sizing:border-box;font-size:16px}textarea{height:80px}.btn{width:100%;padding:14px;border-radius:12px;border:none;font-weight:700;margin-top:12px}.btn-blue{background:#0071e3;color:#fff}.btn-green{background:#25D366;color:#fff}.btn-red{background:#ff3b30;color:#fff;border:none;padding:6px 10px;border-radius:20px;font-size:12px}.item{padding:10px 0;border-bottom:1px solid #eee;display:flex;justify-content:space-between}</style></head><body>
<div class="header"><h1>HACCP Resto</h1><small>06 95 12 13 31 - Stock WhatsApp</small></div>
<div id="alert"></div>
<div class="tabs"><button id="b1" class="active" onclick="show('liv')">Livraisons</button><button id="b2" onclick="show('temp')">Frigos</button><button id="b3" onclick="show('net')">Nettoyage</button><button id="b4" onclick="show('stock')">STOCK</button></div>
<div class="card" id="liv"><h3>Livraison</h3><input id="lf" placeholder="Fournisseur"><input id="lp" placeholder="Produit"><button class="btn btn-blue" onclick="addL()">Enregistrer</button><div id="ll"></div></div>
<div class="card" id="temp" style="display:none"><h3>Frigo</h3><select id="te"><option>Frigo Positif</option><option>Frigo Negatif</option></select><input id="tv" type="number" placeholder="T°"><button class="btn btn-blue" onclick="addT()">Valider</button><div id="lt"></div></div>
<div class="card" id="net" style="display:none"><h3>Nettoyage</h3><input id="nz" placeholder="Zone nettoyee"><button class="btn btn-blue" onclick="addN()">Valider</button><div id="ln"></div></div>
<div class="card" id="stock" style="display:none">
<h3>Signaler un manque (ta salariee ecrit ici)</h3>
<div style="background:#f5f5f7;padding:12px;border-radius:12px">
<textarea id="mtxt" placeholder="Ex: Il manque javel, sopalin, gants taille M..."></textarea>
<button class="btn btn-green" onclick="sendManque()">📲 Envoyer sur WhatsApp a Abdelkader</button>
</div>
<h3 style="margin-top:20px">Stock actuel</h3><div id="ls"></div>
<h3>Historique manques</h3><div id="lm"></div>
</div>
<script>
let data={livraisons:[],temperatures:[],nettoyages:[],stocks:[],manques:[]};
let PHONE="33695121331";
