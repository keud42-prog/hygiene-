const express = require('express');
const app = express();
app.get('/', (req,res)=>res.send('OK CA MARCHE'));
app.listen(process.env.PORT||10000);
