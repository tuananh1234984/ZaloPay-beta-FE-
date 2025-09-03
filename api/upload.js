const crypto = require('crypto');

// Helper to read JSON body safely
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

// Build a Cloudinary signature
function buildSignature(paramsToSign, apiSecret) {
  // Cloudinary requires parameters in alphabetical order and without empty values
  const entries = Object.entries(paramsToSign)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  const toSign = entries.map(([k, v]) => `${k}=${v}`).join('&');
  return crypto.createHash('sha1').update(toSign + apiSecret).digest('hex');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end('Method Not Allowed');
  }

  try {
    const { dataUrl, folder = 'zalopay-shares', publicId = '', tags = '' } = await readJson(req);
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) {
      res.status(400).json({ error: 'Invalid dataUrl' });
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      res.status(500).json({ error: 'Cloudinary env missing' });
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const params = {
      folder,
      timestamp,
    };
    if (publicId) params.public_id = publicId;
    if (tags) params.tags = tags;

    const signature = buildSignature(params, apiSecret);

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // Use global FormData available in Node 18+
    const form = new (globalThis.FormData || require('form-data'))();
    form.append('file', dataUrl);
    form.append('api_key', apiKey);
    form.append('timestamp', timestamp.toString());
    form.append('signature', signature);
    if (folder) form.append('folder', folder);
    if (publicId) form.append('public_id', publicId);
    if (tags) form.append('tags', tags);

    const resp = await fetch(url, { method: 'POST', body: form });
    const json = await resp.json();

    if (!resp.ok) {
      res.status(resp.status).json({ error: 'cloudinary_error', details: json });
      return;
    }

    res.status(200).json({
      secure_url: json.secure_url,
      public_id: json.public_id,
      width: json.width,
      height: json.height,
      bytes: json.bytes,
      format: json.format,
    });
  } catch (err) {
    res.status(500).json({ error: 'upload_failed', message: String(err && err.message || err) });
  }
};
