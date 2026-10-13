import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Photo upload API for pre-wedding photos
app.post('/api/upload-photos', (req, res) => {
  try {
    const { files } = req.body;
    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const saved = [];
    const photosDir = path.join(__dirname, 'photos');
    if (!fs.existsSync(photosDir)) {
      fs.mkdirSync(photosDir, { recursive: true });
    }

    for (const f of files) {
      const filename = path.basename(f.filename || f.name);
      const base64Data = (f.data || '').replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      const targetPath = path.join(photosDir, filename);
      fs.writeFileSync(targetPath, buffer);
      saved.push(filename);
    }

    return res.json({ success: true, saved });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Serve static assets from root directory
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Root route handler
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback to index.html for navigation
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(Number(PORT), HOST, () => {
  console.log(`Wedding invitation app running at http://${HOST}:${PORT}`);
});
