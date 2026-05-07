const express = require('express');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SAVE_FILE    = path.join(__dirname, 'data', 'progress.json');
const MARKERS_FILE = path.resolve(__dirname, 'data', 'markers.js');

function loadProgress() {
  try {
    if (fs.existsSync(SAVE_FILE)) return JSON.parse(fs.readFileSync(SAVE_FILE, 'utf8'));
  } catch {}
  return {};
}
function saveProgress(data) {
  fs.writeFileSync(SAVE_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/markers', (_req, res) => {
  delete require.cache[MARKERS_FILE];
  res.json(require(MARKERS_FILE));
});

app.get('/api/progress', (_req, res) => res.json(loadProgress()));

app.post('/api/progress', (req, res) => { saveProgress(req.body); res.json({ ok: true }); });
app.delete('/api/progress', (_req, res) => { saveProgress({}); res.json({ ok: true }); });

app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`\n🗺  Silksong Map → http://localhost:${PORT}\n`));