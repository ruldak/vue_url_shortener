export default async function handler(req, res) {
  res.setHeader('X-Proxy-Debug', 'true');
  const DJANGO_API_URL = process.env.VITE_DJANGO_API_URL;
  const API_KEY = process.env.DJANGO_API_KEY;

  if (!DJANGO_API_URL || !API_KEY) {
    return res.status(500).json({ error: 'Server configuration error.' });
  }

  let requestPath = req.url;
  if (requestPath === '/api/auth/register/') {
    requestPath = '/api/register/';
  }

  const headers = { ...req.headers };
  delete headers.host;

  try {
    const response = await fetch(`${DJANGO_API_URL}${requestPath}`, {
      method: req.method,
      headers: {
        ...headers,
        'X-API-Key': API_KEY,
      },
      body: req.body ? JSON.stringify(req.body) : null,
    });

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    res.status(response.status).send(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'An error occurred while proxying the request.' });
  }
}
