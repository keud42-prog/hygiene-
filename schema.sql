-- =========================================================
--  Schema HACCP - KSA Alimentation
--  Horodatages en TIMESTAMPTZ (heure serveur fiable)
-- =========================================================

-- Equipements froids (frigos, congelateur...) avec seuils de conformite
CREATE TABLE IF NOT EXISTS equipements (
  id        SERIAL PRIMARY KEY,
  nom       TEXT NOT NULL,
  type      TEXT NOT NULL DEFAULT 'frigo',      -- 'frigo', 'congelateur', 'vitrine'...
  temp_min  NUMERIC(4,1) NOT NULL,              -- borne basse conforme
  temp_max  NUMERIC(4,1) NOT NULL,              -- borne haute conforme
  actif     BOOLEAN NOT NULL DEFAULT true
);

-- Module 1 : Releves de temperature
CREATE TABLE IF NOT EXISTS temperatures (
  id            SERIAL PRIMARY KEY,
  equipement_id INTEGER NOT NULL REFERENCES equipements(id),
  valeur        NUMERIC(4,1) NOT NULL,          -- ex: -18.5
  source        TEXT NOT NULL DEFAULT 'manuel', -- 'ocr' ou 'manuel'
  conforme      BOOLEAN NOT NULL,               -- calcule au serveur
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Module 2 : Tracabilite (photos d'etiquettes) - rempli a l'Etape 4
CREATE TABLE IF NOT EXISTS tracabilite (
  id          SERIAL PRIMARY KEY,
  produit     TEXT,
  photo_url   TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Modules 3 & 4 : taches de nettoyage - remplis aux Etapes 5 & 6
CREATE TABLE IF NOT EXISTS taches (
  id              SERIAL PRIMARY KEY,
  libelle         TEXT NOT NULL,
  categorie       TEXT NOT NULL,                -- 'quotidien' ou 'periodique'
  frequence_jours INTEGER,
  photo_requise   BOOLEAN NOT NULL DEFAULT false,
  actif           BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS validations (
  id         SERIAL PRIMARY KEY,
  tache_id   INTEGER NOT NULL REFERENCES taches(id) ON DELETE CASCADE,
  photo_url  TEXT,
  valide_le  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_temperatures_date ON temperatures (created_at);
CREATE INDEX IF NOT EXISTS idx_tracabilite_date  ON tracabilite (created_at);
CREATE INDEX IF NOT EXISTS idx_validations_date  ON validations (valide_le);

-- Equipements d'exemple (modifiables ensuite)
INSERT INTO equipements (nom, type, temp_min, temp_max)
SELECT * FROM (VALUES
  ('Frigo 1',     'frigo',       0.0,  4.0),
  ('Frigo 2',     'frigo',       0.0,  4.0),
  ('Congelateur', 'congelateur', -30.0, -18.0),
  ('Vitrine',     'vitrine',     0.0,  4.0)
) AS v(nom, type, temp_min, temp_max)
WHERE NOT EXISTS (SELECT 1 FROM equipements);

-- Taches d'exemple
INSERT INTO taches (libelle, categorie, frequence_jours, photo_requise)
SELECT * FROM (VALUES
  ('Nettoyage plan de travail', 'quotidien', NULL, false),
  ('Nettoyage sol cuisine',     'quotidien', NULL, false),
  ('Desinfection poignees',     'quotidien', NULL, false),
  ('Nettoyage hotte',           'periodique', 7,   true),
  ('Detartrage lave-vaisselle', 'periodique', 30,  true)
) AS v(libelle, categorie, frequence_jours, photo_requise)
WHERE NOT EXISTS (SELECT 1 FROM taches);
