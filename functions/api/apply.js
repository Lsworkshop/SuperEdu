import { GoogleSheet } from './lib_google.js';

export async function onRequestPost(context) {
  const { request } = context;
  const data = await request.json();
  const { firstName, lastName, email, service } = data;

  if (!firstName || !lastName || !email || !service) {
    return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const sheet = new GoogleSheet('SuperEdu_Applications');
    await sheet.appendRow([firstName, lastName, email, service, new Date().toISOString()]);
    return new Response(JSON.stringify({ success: true, message: 'Application submitted' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
