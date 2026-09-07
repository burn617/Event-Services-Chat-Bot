# FAQ chatbot worker

Backend for an AI-powered FAQ chatbot. Holds your Anthropic API key
server-side and answers questions grounded in the knowledge base in
`src/index.js`.

## Deploy

Replace `YOUR-USERNAME/YOUR-REPO` below with wherever you push this
folder, then click the button:

[![Deploy to Cloudflare](https://red-violet-71af.burn617.workers.dev/)](https://deploy.workers.cloudflare.com/?url=https://github.com/burn617/Event-Services-Chat-Bot)

During setup, Cloudflare will ask you to paste in your
`ANTHROPIC_API_KEY` (get one at
[console.anthropic.com](https://console.anthropic.com/settings/keys)).
Everything else deploys automatically.

## After deploying

1. Copy your Worker's URL from the Cloudflare dashboard (looks like
   `https://faq-chatbot-worker.YOUR-SUBDOMAIN.workers.dev`).
2. Paste it into `WORKER_URL` in the widget HTML file.
3. Edit `FAQ_KNOWLEDGE_BASE` in `src/index.js` with your real Q&As,
   then push the change — Cloudflare redeploys automatically.
