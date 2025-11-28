// register.js
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
    const grade = (body.grade || '').trim();
    const ref = (body.ref || '').trim();
    const notes = (body.notes || '').trim();
    const source = body.source || 'site_register';

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const sheetTitle = 'SuperEdu_Users';
    const headers = ['Timestamp','First Name','Last Name','Email','Phone','Country','Grade','Referral','Notes','Source'];
    await ensureSheetAndHeader(sheetTitle, headers);

    const timestamp = (new Date()).toISOString();
    const row = [timestamp, firstName, lastName, email, phone, country, grade, ref, notes, source];
    await appendRow(sheetTitle, row);

    // send notification to admin
    try {
      const adminTo = process.env.TO_EMAIL;
      if (adminTo && (process.env.EMAIL_MODE || 'none') !== 'none') {
        const subject = `New Registration — ${firstName} ${lastName}`;
        const html = `<p>New user registered:</p><ul><li>Name: ${firstName} ${lastName}</li><li>Email: ${email}</li><li>Time: ${timestamp}</li></ul>`;
        await sendNotificationEmail({ to: adminTo, subject, html, text: `New registration by ${firstName} ${lastName} (${email})` });
      }
    } catch (e) {
      console.error('Email send error (register):', e);
    }

    return new Response(JSON.stringify({ success: true, message: 'Registered' }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
