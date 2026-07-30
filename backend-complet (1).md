# Restaurant HACCP — Backend complet (vue en un seul fichier)

Ce document regroupe tous les fichiers du backend pour relecture.
Pour l'utiliser, chaque bloc doit etre remis dans son propre fichier
(le chemin est indique en titre de chaque section).

Arborescence :
```
backend/
├─ server.js
├─ db.js
├─ schema.sql
├─ cron.js
├─ package.json
├─ .env.example
├─ README.md
├─ config/cloudinary.js
├─ scripts/init-db.js
└─ routes/
   ├─ temperatures.js
   ├─ tracabilite.js
   ├─ nettoyage-quotidien.js
   └─ nettoyage-periodique.js
```


---

## `backend/package.json`

```json
{
  "name": "restaurant-haccp-backend",
  "version": "1.0.0",
  "description": "Backend HACCP restaurant (temperatures, tracabilite, nettoyage)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "init-db": "node scripts/init-db.js"
  },
  "dependencies": {
    "cloudinary": "^2.5.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.1",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "pg": "^8.13.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.7"
  }
}
```

---

## `backend/.env.example`

```bash
# === Serveur ===
PORT=3000
TZ=Europe/Paris

# === PostgreSQL ===
# En local : postgresql://postgres:motdepasse@localhost:5432/restaurant_haccp
# En ligne (Neon, Render, Railway...) : colle l'URL fournie par l'hebergeur
DATABASE_URL=postgresql://utilisateur:motdepasse@localhost:5432/restaurant_haccp
# Mettre "true" si l'hebergeur exige une connexion SSL (souvent le cas en ligne)
DATABASE_SSL=false

# === Cloudinary (a remplir plus tard avec tes cles) ===
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## `backend/server.js`

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- Routes des modules ---
// (Les fichiers sont pour l'instant des squelettes ; on les remplira etape par etape)
app.use('/api/temperatures', require('./routes/temperatures'));
app.use('/api/tracabilite', require('./routes/tracabilite'));
app.use('/api/nettoyage-quotidien', require('./routes/nettoyage-quotidien'));
app.use('/api/nettoyage-periodique', require('./routes/nettoyage-periodique'));

// Verification de sante
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Demarrage
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur demarre sur http://localhost:${PORT}`);
});
```

---

## `backend/db.js`

```javascript
const { Pool } = require('pg');
require('dotenv').config();

// Pool de connexions PostgreSQL, partage par toute l'application.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Beaucoup d'hebergeurs (Neon, Render, Railway...) exigent SSL.
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log('✅ Connecte a PostgreSQL'));
pool.on('error', (err) => console.error('❌ Erreur PostgreSQL:', err.message));

module.exports = pool;
```

---

## `backend/schema.sql`

```sql
-- =========================================================
--  Schema HACCP restaurant
--  Tous les horodatages sont en TIMESTAMPTZ (heure serveur fiable)
-- =========================================================

-- Module 1 : Temperatures des frigos
CREATE TABLE IF NOT EXISTS temperatures (
  id          SERIAL PRIMARY KEY,
  equipement  TEXT NOT NULL,                     -- nom du frigo / chambre froide
  valeur      NUMERIC(4,1) NOT NULL,             -- ex: -18.5
  source      TEXT NOT NULL DEFAULT 'manuel',    -- 'ocr' ou 'manuel'
  photo_url   TEXT,                              -- optionnel (photo du thermometre)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Module 2 : Tracabilite (photos d'etiquettes produits)
CREATE TABLE IF NOT EXISTS tracabilite (
  id          SERIAL PRIMARY KEY,
  produit     TEXT,                              -- libelle optionnel
  photo_url   TEXT NOT NULL,                     -- URL Cloudinary
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modules 3 & 4 : Definition des taches de nettoyage
CREATE TABLE IF NOT EXISTS taches (
  id              SERIAL PRIMARY KEY,
  libelle         TEXT NOT NULL,
  categorie       TEXT NOT NULL,                 -- 'quotidien' ou 'periodique'
  frequence_jours INTEGER,                       -- pour le periodique (ex: 7, 30)
  photo_requise   BOOLEAN NOT NULL DEFAULT false,
  actif           BOOLEAN NOT NULL DEFAULT true
);

-- Historique des validations : on ne supprime JAMAIS (preuve en cas de controle).
-- Une tache est "faite aujourd'hui" s'il existe une validation depuis le dernier 04h00.
CREATE TABLE IF NOT EXISTS validations (
  id         SERIAL PRIMARY KEY,
  tache_id   INTEGER NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
  photo_url  TEXT,                               -- obligatoire pour les taches photo_requise
  valide_le  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour des recherches rapides par date
CREATE INDEX IF NOT EXISTS idx_temperatures_date ON temperatures (created_at);
CREATE INDEX IF NOT EXISTS idx_tracabilite_date  ON tracabilite (created_at);
CREATE INDEX IF NOT EXISTS idx_validations_date  ON validations (valide_le);
CREATE INDEX IF NOT EXISTS idx_validations_tache ON validations (tache_id);

-- Taches d'exemple (inserees une seule fois, tu pourras les modifier ensuite)
INSERT INTO taches (libelle, categorie, frequence_jours, photo_requise)
SELECT * FROM (VALUES
  ('Nettoyage plan de travail', 'quotidien', NULL, false),
  ('Nettoyage sol cuisine',     'quotidien', NULL, false),
  ('Desinfection poignees',     'quotidien', NULL, false),
  ('Nettoyage hotte',           'periodique', 7,   true),
  ('Detartrage lave-vaisselle', 'periodique', 30,  true)
) AS v(libelle, categorie, frequence_jours, photo_requise)
WHERE NOT EXISTS (SELECT 1 FROM taches);
```

---

## `backend/config/cloudinary.js`

```javascript
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configuration Cloudinary (les cles viennent du fichier .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
```

---

## `backend/scripts/init-db.js`

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Lit schema.sql et cree les tables. A lancer une fois : npm run init-db
(async () => {
  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Base de donnees initialisee (tables + taches d\'exemple).');
  } catch (err) {
    console.error('❌ Echec de l\'initialisation:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
```

---

## `backend/cron.js`

```javascript
const cron = require('node-cron');

// La logique liee au reset quotidien de 04h00 sera ajoutee a l'Etape 5 (Module 3).
// Note : on ne "decoche" pas en supprimant des donnees. L'etat "fait aujourd'hui"
// est calcule a partir des validations depuis le dernier 04h00, ce qui reinitialise
// naturellement l'affichage a 04h00 tout en gardant l'historique (preuve HACCP).
function demarrerTaches() {
  // Exemple a venir :
  // cron.schedule('0 4 * * *', () => { /* ... */ }, { timezone: 'Europe/Paris' });
}

module.exports = { demarrerTaches };
```

---

## `backend/routes/temperatures.js`

```javascript
const router = require('express').Router();

// Module 1 (Temperatures) : les routes seront ajoutees a l'Etape 3.

module.exports = router;
```

---

## `backend/routes/tracabilite.js`

```javascript
const router = require('express').Router();

// Module 2 (Tracabilite) : les routes seront ajoutees a l'Etape 4.

module.exports = router;
```

---

## `backend/routes/nettoyage-quotidien.js`

```javascript
const router = require('express').Router();

// Module 3 (Nettoyage quotidien) : les routes seront ajoutees a l'Etape 5.

module.exports = router;
```

---

## `backend/routes/nettoyage-periodique.js`

```javascript
const router = require('express').Router();

// Module 4 (Nettoyage periodique) : les routes seront ajoutees a l'Etape 6.

module.exports = router;
```

---

## `backend/README.md`

```markdown
# Restaurant HACCP — Backend

API Node.js/Express + PostgreSQL pour la gestion HACCP (temperatures, tracabilite, nettoyage).

## Prerequis
- Node.js 18 ou plus
- PostgreSQL (en local, ou heberge : Neon / Render / Railway...)

## Installation (dans le dossier `backend/`)
1. Copier le fichier d'exemple et le remplir :
   ```
   cp .env.example .env
   ```
   Renseigne au minimum `DATABASE_URL`. Les cles Cloudinary pourront etre ajoutees plus tard.

2. Installer les dependances :
   ```
   npm install
   ```

3. Creer les tables :
   ```
   npm run init-db
   ```

4. Lancer le serveur :
   ```
   npm run dev     # avec rechargement auto (developpement)
   # ou
   npm start
   ```

## Verifier que ca marche
Ouvre http://localhost:3000/api/health — tu dois voir `{"status":"ok", ...}`.

## Structure
```
backend/
├─ server.js            serveur Express
├─ db.js                connexion PostgreSQL
├─ schema.sql           tables des 4 modules
├─ cron.js              tache planifiee 04h00 (Etape 5)
├─ config/cloudinary.js config Cloudinary (Etapes 4 & 6)
├─ scripts/init-db.js   creation des tables
└─ routes/              une route par module (a completer)
```
```

