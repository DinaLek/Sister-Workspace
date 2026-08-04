const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'images');
const IDEAS_FILE = path.join(DATA_DIR, 'ideas.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CLIENTS_FILE = path.join(DATA_DIR, 'clients.json');
const HOLIDAYS_FILE = path.join(DATA_DIR, 'holidays.json');

fs.mkdirSync(IMAGES_DIR, { recursive: true });

function readJSON(file) {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeJSON(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tmp, file);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(IMAGES_DIR));

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, IMAGES_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '';
      cb(null, `${Date.now()}-${crypto.randomUUID()}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('רק קבצי תמונה מותרים'));
    }
    cb(null, true);
  }
});

app.post('/api/upload', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'לא התקבל קובץ' });
    res.json({ path: `/images/${req.file.filename}` });
  });
});

function makeCollectionRoutes(routeName, file, { requireField = 'name' } = {}) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(readJSON(file));
  });

  router.post('/', (req, res) => {
    const body = req.body || {};
    if (!body[requireField] || !String(body[requireField]).trim()) {
      return res.status(400).json({ error: `שדה ${requireField} חובה` });
    }
    const items = readJSON(file);
    const now = new Date().toISOString();
    const item = { id: crypto.randomUUID(), ...body, createdAt: now, updatedAt: now };
    items.push(item);
    writeJSON(file, items);
    res.status(201).json(item);
  });

  router.put('/:id', (req, res) => {
    const items = readJSON(file);
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'לא נמצא' });
    items[idx] = { ...items[idx], ...req.body, id: items[idx].id, updatedAt: new Date().toISOString() };
    writeJSON(file, items);
    res.json(items[idx]);
  });

  router.delete('/:id', (req, res) => {
    const items = readJSON(file);
    const idx = items.findIndex((i) => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'לא נמצא' });
    const [removed] = items.splice(idx, 1);
    writeJSON(file, items);
    res.json(removed);
  });

  app.use(`/api/${routeName}`, router);
}

makeCollectionRoutes('ideas', IDEAS_FILE, { requireField: 'title' });
makeCollectionRoutes('products', PRODUCTS_FILE, { requireField: 'name' });
makeCollectionRoutes('clients', CLIENTS_FILE, { requireField: 'name' });

app.get('/api/holidays', (req, res) => {
  res.json(readJSON(HOLIDAYS_FILE));
});

app.listen(PORT, () => {
  console.log(`לוח התוכן רץ על http://localhost:${PORT}`);
});
