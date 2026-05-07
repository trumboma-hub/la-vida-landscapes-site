// Vercel serverless function. Receives contact-form submissions and emails
// them via Resend (https://resend.com). Configure these env vars in Vercel:
//   RESEND_API_KEY  — required
//   RESEND_FROM     — optional, defaults to "La Vida Website <noreply@lavidalandscapes.com>"
//                     The sending domain must be verified in Resend.
//   CONTACT_TO      — optional, defaults to livinlavida@lavidalandscapes.com

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const trim = (s, max) => String(s == null ? '' : s).trim().slice(0, max);
  const name = trim(body.name, 200);
  const email = trim(body.email, 200);
  const property = trim(body.property, 500);
  const services = trim(body.services, 500);
  const message = trim(body.message, 5000);
  const honeypot = trim(body.company, 200); // bot trap; real users never fill this

  if (honeypot) {
    return res.status(200).json({ ok: true });
  }
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please include your name and a valid email.' });
  }

  const escape = (s) => s.replace(/[<>&"']/g, (c) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[c]));

  const subject = `New consultation request — ${name}`;
  const text = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Property: ${property || '(not provided)'}`,
    `Services of interest: ${services || '(not selected)'}`,
    '',
    'Message:',
    message || '(none)',
    '',
    '— Sent from lavidalandscapes.com',
  ].join('\n');

  const html = [
    '<div style="font-family:Inter,system-ui,sans-serif;color:#1a1f1b;line-height:1.55;max-width:560px">',
    '<h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-weight:500">New consultation request</h2>',
    `<p style="margin:6px 0"><strong>Name:</strong> ${escape(name)}</p>`,
    `<p style="margin:6px 0"><strong>Email:</strong> <a href="mailto:${escape(email)}">${escape(email)}</a></p>`,
    `<p style="margin:6px 0"><strong>Property:</strong> ${escape(property) || '&mdash;'}</p>`,
    `<p style="margin:6px 0"><strong>Services of interest:</strong> ${escape(services) || '&mdash;'}</p>`,
    '<p style="margin:18px 0 6px 0"><strong>Message:</strong></p>',
    `<p style="margin:0;white-space:pre-wrap">${escape(message) || '<em style="color:#888">(none)</em>'}</p>`,
    '<hr style="margin:24px 0;border:none;border-top:1px solid #e5e1d4" />',
    '<p style="font-size:12px;color:#888;margin:0">Sent from lavidalandscapes.com contact form</p>',
    '</div>',
  ].join('');

  const to = process.env.CONTACT_TO || 'livinlavida@lavidalandscapes.com';
  const from = process.env.RESEND_FROM || 'La Vida Website <noreply@lavidalandscapes.com>';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        text,
        html,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ error: 'We could not send your message right now. Please email us directly.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler error', err);
    return res.status(500).json({ error: 'Server error. Please email us directly.' });
  }
};
