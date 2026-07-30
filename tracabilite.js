const router = require('express').Router();
const multer = require('multer');
const pool = require('../db');
const { uploadBuffer } = require('../lib/upload');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// GET /api/tracabilite -> 60 dernieres etiquettes
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, produit, photo_url, created_at
       FROM tracabilite ORDER BY created_at DESC LIMIT 60`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/tracabilite (multipart: photo + produit optionnel)
router.post('/', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Photo obligatoire' });
  try {
    const result = await uploadBuffer(req.file.buffer, 'ksa/tracabilite');
    const produit = (req.body.produit || '').trim() || null;
    const { rows } = await pool.query(
      `INSERT INTO tracabilite (produit, photo_url) VALUES ($1, $2)
       RETURNING id, produit, photo_url, created_at`,
      [produit, result.secure_url]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Echec de l'envoi de la photo" });
  }
});

module.exports = router;
