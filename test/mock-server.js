const express = require('express');
const path = require('path');

// If you want the server to call the real upload handler, unset MOCK_UPLOAD or set to '0'
// For a quick test we use MOCK_UPLOAD=1 to return deterministic response
const uploadHandler = require(path.join(__dirname, '..', 'api', 'upload'));
const generateHandler = require(path.join(__dirname, '..', 'api', 'generate'));

const app = express();
app.use(express.json({ limit: '20mb' }));

app.post('/api/upload', async (req, res) => {
  if (process.env.MOCK_UPLOAD === '1') {
    // Return a deterministic mocked Cloudinary response
    return res.json({
      secure_url: 'https://res.cloudinary.com/demo/image/upload/v123/placeholder.png',
      public_id: 'demo/placeholder',
      width: 1200,
      height: 1200,
      bytes: 12345,
      format: 'png'
    });
  }

  // Fallback: call real handler (note: real handler expects raw body stream)
  try {
    await uploadHandler(req, res);
  } catch (err) {
    console.error('upload handler error', err);
    res.status(500).json({ error: 'upload_handler_error', message: String(err && err.message) });
  }
});

app.get('/api/generate', (req, res) => {
  try {
    generateHandler(req, res);
  } catch (err) {
    console.error('generate handler error', err);
    res.status(500).send(String(err && err.message));
  }
});

// Serve static public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Mock server listening on http://localhost:${port} (MOCK_UPLOAD=${process.env.MOCK_UPLOAD || '0'})`));
