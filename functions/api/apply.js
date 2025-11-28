// apply.js
import { ensureSheetAndHeader, appendRow } from '../lib_google.js';
import { sendNotificationEmail } from '../lib_email.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const firstName = (body.firstName || '').trim();
    const lastName = (body.lastName || '').trim();
    const email = (body.email || '').trim();
    const phone = (body.phone || '').trim();
    const country = (body.country || '').trim();
    const services = Array.isArray(body.services) ? body.services : (body.services ? [body.services] : []);
    const notes = (body.notes || '').trim();
    const source = body.source || 'service_apply';

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }
    if (services.length === 0) {
      // allow empty but warn
      console.warn('No services selected');
    }

    const sheetTitle = 'SuperEdu_Applications';
    const headers = ['Timestamp','First Name','Last Name','Email','Phone','Country','Services','Notes','Source'];
    await ensureSheetAndHeader(sheetTitle, headers);

    const ts = new Date().toISOString();
    const row = [ts, firstName, lastName, email, phone, country, services.join(' | '), notes, source];
    await appendRow(sheetTitle, row);

    // notify admin
    try {
      const adminTo = process.env.TO_EMAIL;
      if (adminTo && (process.env.EMAIL_MODE || 'none') !== 'none') {
        const subject = `New Service Application — ${firstName} ${lastName}`;
        const html = `<p>New application:</p><ul><li>Name: ${firstName} ${lastName}</li><li>Email: ${email}</li><li>Services: ${services.join(', ')}</li><li>Time: ${ts}</li></ul>`;
        await sendNotificationEmail({ to: adminTo, subject, html, text: `New application by ${firstName} ${lastName}` });
      }
    } catch(e) { console.error('Email send error (apply):', e); }

    // send confirmation to user (optional)
    try {
      const sendUser = process.env.SEND_CONFIRM_TO_USER === 'true';
      if (sendUser) {
        const subject = `SuperEdu — Application Received`;
        const html = `<p>Hi ${firstName},</p><p>We received your application. We'll contact you shortly.</p>`;
        await sendNotificationEmail({ to: email, subject, html, text: 'Application received' });
      }
    } catch(e) { console.error('Email to user failed:', e); }

    return new Response(JSON.stringify({ success: true, message: 'Application received' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
