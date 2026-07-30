const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static('public'));

let stocks = [];

app.get('/', (req,res)=>{
  res.send(`
  <html><head><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>body{font-family:sans-serif;padding:20px}button{padding:12px;background:#25D366;color:white;border:0;border-radius:8px;width:100%;margin-top:10px;font-size:18px}input{width:100%;padding:10px;margin:5px 0;border:1px solid #ccc;border-radius:8px}div{background:#f5f5f5;padding:10px;margin:10px 0;border-radius:8px}</style>
  </head><body>
  <h2>📦 STOCK HACCP</h2>
  <input id="n" placeholder="Nom produit">
  <input id="q" placeholder="Quantité" type="number">
  <input id="d" placeholder="DLC (ex: 05/08/26)">
  <button onclick="add()">+ Ajouter</button>
  <div id="list"></div>
  <button onclick="sendWA()">📲 Envoyer sur WhatsApp</button>
  <script>
  function add(){
    stocks.push({n:document.getElementById('n').value,q:document.getElementById('q').value,d:document.getElementById('d').value});
    render();
    document.getElementById('n').value='';document.getElementById('q').value='';document.getElementById('d').value='';
  }
  function render(){
    document.getElementById('list').innerHTML=stocks.map(s=>\`<div><b>\${s.n}</b> - \${s.q} - DLC \${s.d}</div>\`).join('');
  }
  function sendWA(){
    let txt="📦 *STOCK DU JOUR*%0A%0A"+stocks.map(s=>\`- \${s.n} : \${s.q} (DLC \${s.d})\`).join('%0A');
    window.open('https://wa.me/?text='+txt,'_blank');
  }
  </script></body></html>
  `)
});

app.listen(process.env.PORT||10000,()=>console.log('OK'));
