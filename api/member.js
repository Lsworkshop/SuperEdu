/* ========================= 
   Password Hash (Web Crypto)
========================= */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* =========================
   Helpers
========================= */
function isValidPassword(pw) {
  return typeof pw === "string" && pw.length >= 8 && /[A-Za-z]/.test(pw) && /[0-9]/.test(pw);
}

function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function generateMemberId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EDU-${l1}${l2}${num}`;
}

function generateToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) token += chars[Math.floor(Math.random() * chars.length)];
  return token;
}

/* =========================
   Mailgun Send Email
   Uses API Key from environment variable
========================= */
async function sendConfirmationEmail(toEmail, token, env) {
  const MAILGUN_DOMAIN = env.MAILGUN_DOMAIN; // 从 Worker Secret / 环境变量获取
  const MAILGUN_API_KEY = env.MAILGUN_API_KEY;

  const confirmLink = `https://edu.lsfinova.com/verify.html?token=${token}`;

  const body = new URLSearchParams();
  body.append("from", "team@edunovafdn.org");
  body.append("to", toEmail);
  body.append("subject", "Confirm your email / 请验证邮箱");
  body.append("text", `
您好！

请点击以下链接完成注册验证（24小时有效）：
${confirmLink}

Hello!
Please confirm your email by clicking the link below (valid for 24 hours):
${confirmLink}

如果不是您本人操作，请忽略此邮件。
`);

  const res = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa("api:" + MAILGUN_API_KEY),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!res.ok) {
    console.error("Mailgun error:", await res.text());
    throw new Error("Failed to send confirmation email.");
  }
}

/* =========================
   Enhanced Register API
========================= */
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { first_name, last_name, email, password, referral_code } = body;

    // ---------- Required fields ----------
    if (!first_name || !last_name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
    }

    // ---------- Email format ----------
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format." }), { status: 400 });
    }

    // ---------- Password rule ----------
    if (!isValidPassword(password)) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters and include letters and numbers." }), { status: 400 });
    }

    // ---------- Email uniqueness ----------
    const emailExists = await env.DB.prepare("SELECT 1 FROM members WHERE email = ?").bind(email).first();
    if (emailExists) {
      return new Response(JSON.stringify({ error: "This email is already registered. Please log in instead." }), { status: 409 });
    }

    // ---------- Password Hash ----------
    const password_hash = await hashPassword(password);

    // ---------- Generate Unique Member ID ----------
    let member_id, idExists;
    do {
      member_id = generateMemberId();
      idExists = await env.DB.prepare("SELECT 1 FROM members WHERE member_id = ?").bind(member_id).first();
    } while (idExists);

    const now = new Date().toISOString();

    // ---------- Insert Member ----------
    const insertResult = await env.DB.prepare(`
      INSERT INTO members (
        first_name,
        last_name,
        email,
        member_id,
        password_hash,
        referral_code,
        role,
        source,
        status,
        is_verified,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      first_name,
      last_name,
      email,
      member_id,
      password_hash,
      referral_code || null,
      "member",
      "register",
      "active",
      0,
      now,
      now
    ).run();

    const memberDbId = insertResult.lastInsertRowid;

    // ---------- Create verification token ----------
    const token = generateToken(32);
    const expires_at = new Date(Date.now() + 24*60*60*1000).toISOString(); // 24h valid

    await env.DB.prepare(`
      INSERT INTO email_verifications (member_id, token, expires_at)
      VALUES (?, ?, ?)
    `).bind(memberDbId, token, expires_at).run();

    // ---------- Send confirmation email ----------
    await sendConfirmationEmail(email, token, env);

    return new Response(JSON.stringify({
      success: true,
      member_id,
      message: "Confirmation email sent."
    }), { status: 200 });

  } catch (err) {
    console.error("Register API Error:", err);
    return new Response(JSON.stringify({ error: "Registration failed." }), { status: 500 });
  }
}
