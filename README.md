# Framer Proxy

A simple Cloudflare Pages proxy that removes the "Made in Framer" badge from Framer websites.

## Setup

1. Set your Framer website URL in `config.json`:
```json
{
  "framerUrl": "https://your-framer-website.com"
}
```

2. Install dependencies:
```bash
npm install
```

3. Run locally:
```bash
npm run dev
```

4. Deploy to Cloudflare Pages:
```bash
npm run deploy
```

## How It Works

This proxy removes the Framer badge by targeting the `__framer-badge-container` and `__framer-badge` classes through server-side HTML rewriting and client-side JavaScript. 