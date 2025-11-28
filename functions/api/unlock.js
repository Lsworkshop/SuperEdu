// unlock.js
import { ensureSheetAndHeader, appendRow } from '../lib_google.js';
import { sendNotificationEmail } from '../lib_email.js';

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const firstName = (body.firstName || '').trim();
    const lastName = (body.lastName || '').trim();
    const email = (body.email || '').trim();
    const source = body.source || 'quick_unlock';

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const sheetTitle = 'SuperEdu_Users';
    const headers = ['Timestamp','First Name','Last Name','Email','UnlockTime','Source'];
    await ensureSheetAndHeader(sheetTitle, headers);

    const ts = new Date().toISOString();
    const row = [ts, firstName, lastName, email, ts, source];
    await appendRow(sheetTitle, row);

    // notify admin (optional)
    try {
      const adminTo = process.env.TO_EMAIL;
      if (adminTo && (process.env.EMAIL_MODE || 'none') !== 'none') {
        const subject = `Content Unlocked by ${firstName} ${lastName}`;
        const html = `<p>${firstName} ${lastName} (${email}) unlocked content at ${ts}.</p>`;
        await sendNotificationEmail({ to: adminTo, subject, html, text: `${firstName} unlocked content` });
      }
    } catch(e) { console.error('Email send error (unlock):', e); }

    // message for front-end
    const msg = (process.env.LANG === 'zh') ? '内容已解锁！提交姓名与邮箱还可以获得免费咨询。' : 'Unlocked! Submit name & email to receive a free consultation.';
    return new Response(JSON.stringify({ success: true, message: msg }), { status: 200 });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}
