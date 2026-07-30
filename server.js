const express = require('express');
const app = express();
app.use(express.json({limit:'20mb'}));
const OWNER_PHONE = "33695121331";
let db = { 
  livraisons: [], temperatures: [], nettoyages: [],
  manques: [],
  stocks: [
    {id:1, name:"Liquide vaisselle", qty:3, seuil:1},
    {id:2, name:"Eponges", qty:5, seuil:2},
    {id:3, name:"Gants jetables", qty:10, seuil:3},
    {id:4, name:"Papier essuie-mains", qty:4, seuil:1},
    {id:5, name:"Produit sol", qty:2, seuil:1},
    {id:6, name:"Sacs poubelle", qty:15, seuil:5}
  ]
};
app.get('/manifest.json', (req,res) => res.json({name:"HACCP Resto",short_name:"HACCP",display:"standalone",background_color:"#f5f5f7",theme_color:"#ffffff",start_url:"/"}));
app.get('/api/data', (req,res) => res.json(db));
app.post('/api/data', (req,res) => { db = req.body; res.json({ok:true}); });
app.get('/', (req,res) => {
res.send(`
<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>HACCP Resto</title>
<style>body{font-family:sans-serif;background:#f5f5f7;margin:0;color:#1d1d1f}.header{position:sticky;top:0;background:rgba(255,255,255,0.9);padding:20px;border-bottom:1px solid #e5e5e5;z-index:10}#alertBox{display:none;background:#ff3b30;color:white;padding:14px;border-radius:14px;margin:12px;font-weight:600}.segmented{display:flex;background:#e8e8ed;border-radius:12px;padding:3px;margin:12px}.segmented button{flex:1;border:none;background:transparent;padding:10px;border-radius:8px;font-size:12px;font-weight:600}.segmented button.active{background:white;box-shadow:0 2px 8px rgba(0,0,0,0.08)}.container{padding:0 16px 100px}.card{background:white;border-radius:20px;padding:20px;margin-bottom:16px}input,select,textarea{width:100%;background:#f5f5f7;border:none;border-radius:12px;padding:14px;font-size:16px;box-sizing:border-box;outline:none;margin-top:6px}textarea{min-height:80px}.btn-main{background:#0071e3;color:white;border:none;padding:16px;border-radius:14px;width:100%;font-weight:700;font-size:17px;margin-top:16px}.btn-whatsapp{background:#25D366;color:white;border:none;padding:16px;border-radius:14px;width:100%;font-weight:700;font-size:16px;margin-top:10px}.item{padding:12px 0;border-bottom:1px solid #f0f0f0}.stock-item{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f0f0f0}.qty{font-size:20px;font-weight:800}.badge{padding:4px 10px;border-radius:20px;font-size:11px;font-weight:700}.badge-ok{background:#e7f9ed;color:#1d8127}.badge-ko{background:#ffeaea;color:#d70015}.btn-qty{background:#f5f5f7;border:none;width:36px;height:36px;border-radius:18px;font-size:18px}.btn-rupture{background:#ff3b30;color:white;border:none;padding:8px 12px;border-radius:20px;font-weight:700;font-size:12px}</style>
</head><body>
<div class="header"><h1>HACCP</h1><p>Stock WhatsApp: 06 95 12 13 31</p></div>
<div id="alertBox"></div>
<div class="segmented"><button onclick="show('liv')" id="b-liv" class="active">Livraisons</button><button onclick="show('temp')" id="b-temp">Frigos</button><button onclick="show('net')" id="b-net">Nettoyage</button><button onclick="show('stock')" id="b-stock">Stock</button></div>
<div class="container">
<div id="liv" class="card"><h3>Livraison</h3><input id="l-four" placeholder="Fournisseur"><input id="l-prod" placeholder="Produit" style="margin-top:10px"><button class="btn-main" onclick="addLiv()">Enregistrer</button><div id="list-liv" style="margin-top:20px"></div></div>
<div id="temp" class="card" style="display:none"><h3>Frigo</h3><select id="t-equip"><option>Frigo Positif</option><option>Frigo Negatif</option><option>Vitrine</option></select><input id="t-val" type="number" placeholder="Temperature" style="margin-top:10px"><button class="btn-main" onclick="addTemp()">Valider</button><div id="list-temp" style="margin-top:20px"></div></div>
<div id="net" class="card" style="display:none"><h3>Nettoyage</h3><input id="n-zone" placeholder="Zone nettoyee"><button class="btn-main" onclick="addNet()">Valider</button><div id="list-net" style="margin-top:20px"></div></div>
<div id="stock" class="card" style="display:none">
<h3>Signaler un manque</h3>
<div style="background:#f5f5f7;border-radius:16px;padding:16px">
<textarea id="manque-txt" placeholder="Ex: Il manque javel, sopalin..."></textarea>
<button class="btn-whatsapp" onclick="signalerManque()">Envoyer sur WhatsApp</button>
</div>
<div style="margin-top:20px"><h3>Stock actuel</h3><div id="list-stock"></div></div>
<div style="margin-top:20px"><h3>Historique manques</h3><div id="list-manques"></div></div>
</div>
</div>
<script>
let data={livraisons:[],temperatures:[],nettoyages:[],stocks:[],manques:[]};
const PHONE="33695121331";
async function load(){try{let r=await fetch('/api/data');data=await r.json();}catch(e){}checkAlert();render();}
function show(id){['liv','temp','net','stock'].forEach(function(k){document.getElementById(k).style.display=k==id?'block':'none'});document.querySelectorAll('.segmented button').forEach(function(b){b.classList.remove('active')});document.getElementById('b-'+id).classList.add('active');}
async function save(){await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});checkAlert();render();}
function addLiv(){if(!document.getElementById('l-four').value)return alert('Fournisseur ?');data.livraisons.unshift({date:new Date().toLocaleString('fr-FR'),four:document.getElementById('l-four').value,prod:document.getElementById('l-prod').value});document.getElementById('l-four').value='';document.getElementById('l-prod').value='';save();}
function addTemp(){data.temperatures.unshift({date:new Date().toLocaleString('fr-FR'),equip:document.getElementById('t-equip').value,val:document.getElementById('t-val').value});document.getElementById('t-val').value='';save();}
function addNet(){data.nettoyages.unshift({date:new Date().toLocaleString('fr-FR'),zone:document.getElementById('n-zone').value});document.getElementById('n-zone').value='';save();}
function updateQty(id,delta){let p=data.stocks.find(function(s){return s.id==id});p.qty=Math.max(0,p.qty+delta);save();if(p.qty<=p.seuil){let txt='STOCK FAIBLE: '+p.name+' bientot vide.';window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(txt),'_blank');}}
function rupture(id){let p=data.stocks.find(function(s){return s.id==id});p.qty=0;save();let txt='RUPTURE TOTALE: '+p.name+' au resto ! A commander d urgence !';window.open('https://
