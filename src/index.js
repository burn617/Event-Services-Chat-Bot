/**
 * FAQ chatbot backend — Cloudflare Worker
 * Holds your Anthropic API key server-side and answers questions
 * grounded ONLY in the FAQ_KNOWLEDGE_BASE below.
 */

// ---- EDIT THIS: your knowledge base ----
const FAQ_KNOWLEDGE_BASE = `
Q: What are your hours?
A: We're open Monday-Friday, 9am-5pm. Closed on university holidays.

Q: How do I book a space?
A: Submit a request through 25Live at least 10 business days before your event. We confirm availability within 2 business days.

Q: What equipment can I request?
A: Tables, chairs, AV equipment, and staging, all through your 25Live request. Availability depends on date and location.

Q: Who do I contact?
A: events@example.edu (replace with your real address), or through the campus events portal.

Q: What is the cancellation policy?
A: Cancellations should be submitted at least 5 business days before the event to avoid fees. Contact us directly for late cancellations.
`;
// ---- end edit zone ----

const SYSTEM_PROMPT = `You are a helpful FAQ assistant. Answer ONLY using the knowledge base below.
If the answer isn't in the knowledge base, say you don't have that information and suggest contacting the team directly. Keep answers short (2-4 sentences), friendly, and factual. Never make up policies or details not present below.

KNOWLEDGE BASE:
${FAQ_KNOWLEDGE_BASE}`;

export default {
  async fetch(request, env) {
    const allowedOrigin = env.ALLOWED_ORIGIN || '*';
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { message, history } = await request.json();
      if (!message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: 'Missing message' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const messages = [
        ...(Array.isArray(history) ? history : []),
        { role: 'user', content: message },
      ];

      const apiResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: SYSTEM_PROMPT,
          messages,
        }),
      });

      if (!apiResponse.ok) {
        const errText = await apiResponse.text();
        return new Response(JSON.stringify({ error: 'Upstream error', detail: errText }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await apiResponse.json();
      const reply = data.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Server error', detail: String(err) }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
