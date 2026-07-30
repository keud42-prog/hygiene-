const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(
'<!DOCTYPE html>\n' +
'<html lang="fr">\n' +
'<head>\n' +
'  <meta charset="UTF-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'  <title>French HACCP LUXE - Caméra</title>\n' +
'  <style>\n' +
'    body {\n' +
'      font-family: Arial, sans-serif;\n' +
'      background: #f5f7fa;\n' +
'      color: #1a2b44;\n' +
'      margin: 0;\n' +
'      padding: 20px;\n' +
'    }\n' +
'    .container {\n' +
'      max-width: 900px;\n' +
'      margin: 0 auto;\n' +
'      background: #ffffff;\n' +
'      border-radius: 12px;\n' +
'      box-shadow: 0 4px 12px rgba(0,0,0,0.1);\n' +
'      padding: 24px;\n' +
'    }\n' +
'    h1 {\n' +
'      color: #0b3d66;\n' +
'      margin-bottom: 8px;\n' +
'    }\n' +
'    .subtitle {\n' +
'      color: #4a5a6b;\n' +
'      margin-bottom: 20px;\n' +
'    }\n' +
'    .camera-section {\n' +
'      margin-top: 20px;\n' +
'    }\n' +
'    #video {\n' +
'      width: 100%;\n' +
'      max-width: 640px;\n' +
'      border: 2px solid #0b3d66;\n' +
'      border-radius: 8px;\n' +
'      background: #000;\n' +
'    }\n' +
'    button {\n' +
'      background: #0b3d66;\n' +
'      color: white;\n' +
'      border: none;\n' +
'      padding: 10px 16px;\n' +
'      border-radius: 6px;\n' +
'      cursor: pointer;\n' +
'      margin-top: 12px;\n' +
'      font-size: 14px;\n' +
'    }\n' +
'    button:hover {\n' +
'      background: #09507a;\n' +
'    }\n' +
'    .info {\n' +
'      background: #e8f4ff;\n' +
'      border-left: 4px solid #0b3d66;\n' +
'      padding: 12px;\n' +
'      margin-top: 20px;\n' +
'      border-radius: 4px;\n' +
'    }\n' +
'  </style>\n' +
'</head>\n' +
'<body>\n' +
'  <div class="container">\n' +
'    <h1>French HACCP LUXE</h1>\n' +
'    <p class="subtitle">Système de Contrôle HACCP - Surveillance par Caméra</p>\n' +
'    \n' +
'    <div class="info">\n' +
'      <strong>Conformité HACCP LUXE FR</strong><br>\n' +
'      Surveillance en temps réel pour la sécurité alimentaire. Utilisez la caméra pour inspection des zones critiques.\n' +
'    </div>\n' +
'\n' +
'    <div class="camera-section">\n' +
'      <h2>Caméra de Surveillance</h2>\n' +
'      <video id="video" autoplay playsinline></video>\n' +
'      <br>\n' +
'      <button id="startCamera">Activer la Caméra</button>\n' +
'      <button id="stopCamera">Arrêter la Caméra</button>\n' +
'    </div>\n' +
'  </div>\n' +
'\n' +
'  <script>\n' +
'    const video = document.getElementById(\'video\');\n' +
'    const startBtn = document.getElementById(\'startCamera\');\n' +
'    const stopBtn = document.getElementById(\'stopCamera\');\n' +
'    let stream = null;\n' +
'\n' +
'    startBtn.addEventListener(\'click\', async () => {\n' +
'      try {\n' +
'        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });\n' +
'        video.srcObject = stream;\n' +
'      } catch (err) {\n' +
'        console.error(\'Erreur accès caméra:\', err);\n' +
'        alert(\'Impossible d\\\'accéder à la caméra: \' + err.message);\n' +
'      }\n' +
'    });\n' +
'\n' +
'    stopBtn.addEventListener(\'click\', () => {\n' +
'      if (stream) {\n' +
'        stream.getTracks().forEach(track => track.stop());\n' +
'        video.srcObject = null;\n' +
'        stream = null;\n' +
'      }\n' +
'    });\n' +
'  </script>\n' +
'</body>\n' +
'</html>'
  );
});

app.listen(PORT, function() {
  console.log('French HACCP LUXE server listening on port ' + PORT);
});

module.exports = app;
