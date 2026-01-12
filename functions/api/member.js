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

// Password: at least 8 chars, letters + numbers
function isValidPassword(pw) {
  return (
    typeof pw === "string" &&
    pw.length >= 8 &&
    /[A-Za-z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
}

// Email format check
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// Generate EDU-XX1234 style Member ID
function generateMemberId() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * 26)];
  const l2 = letters[Math.floor(Math.random() * 26)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `EDU-${l1}${l2}${num}`;
}

// Generate secure verification token
function generateVerificationToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

/* =========================
   Send Verification Email
========================= */
async function sendVerificationEmail({ env, email, token }) {
  
  const verifyLink =
  `https://edu.lsfinova.com/api/verify-email?token=${token}`;


  const body = new URLSearchParams();
  body.append("from", "Edunova Education <team@edunovafdn.org>");
  body.append("to", email);
  body.append("subject", "Please verify your email | 请验证您的邮箱");
  body.append(
    "html",
    `
      <p>Hello,</p>

      <p>Thank you for registering with <strong>Edunova Education</strong>.</p>

      <p>Please click the link below to verify your email address:</p>

      <p>
        <a href="${verifyUrl}" target="_blank">
          Verify My Email
        </a>
      </p>

      <p>This link will expire in 24 hours.</p>

      <hr>

      <p>您好，</p>
      <p>感谢您注册超能教育平台，请点击下方链接完成邮箱验证：</p>

      <p>
        <a href="${verifyUrl}" target="_blank">
          点击验证邮箱
        </a>
      </p>

      <p>该链接 24 小时内有效。</p>
    `
  );

  const res = await fetch(
    `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`,
    {
      method: "POST",
      headers: {
        Authorization:
          "Basic " + btoa("api:" + env.MAILGUN_API_KEY),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Mailgun error: " + text);
  }
}

/* =========================
   Register API
========================= */
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      password,
      referral_code
    } = body;

    /* ---------- Required Fields ---------- */
    if (!first_name || !last_name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        { status: 400 }
      );
    }

    /* ---------- Email Format ---------- */
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format." }),
        { status: 400 }
      );
    }

    /* ---------- Password Rule ---------- */
    if (!isValidPassword(password)) {
      return new Response(
        JSON.stringify({
          error:
            "Password must be at least 8 characters and include letters and numbers."
        }),
        { status: 400 }
      );
    }

    /* ---------- Email Uniqueness ---------- */
    const emailExists = await env.DB
      .prepare("SELECT 1 FROM members WHERE email = ?")
      .bind(email)
      .first();

    if (emailExists) {
      return new Response(
        JSON.stringify({
          error: "This email is already registered. Please log in instead."
        }),
        { status: 409 }
      );
    }

    /* ---------- Password Hash ---------- */
    const password_hash = await hashPassword(password);

    /* ---------- Generate Member ID ---------- */
    let member_id;
    let idExists;
    do {
      member_id = generateMemberId();
      idExists = await env.DB
        .prepare("SELECT 1 FROM members WHERE member_id = ?")
        .bind(member_id)
        .first();
    } while (idExists);

    /* ---------- Insert Member ---------- */
    await env.DB.prepare(`
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
        is_verified
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      0
    ).run();

    /* ---------- Email Verification ---------- */
    const token = generateVerificationToken();
    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ).toISOString();

    await env.DB.prepare(`
      INSERT INTO email_verifications (
        member_id,
        email,
        token,
        expires_at
      ) VALUES (?, ?, ?, ?)
    `).bind(
      member_id,
      email,
      token,
      expiresAt
    ).run();

    await sendVerificationEmail({
      env,
      email,
      token
    });

    /* ---------- Success ---------- */
    return new Response(
      JSON.stringify({
        success: true,
        verification_required: true,
        message:
          "Registration successful. Please check your email to verify your account."
      }),
      { status: 200 }
    );

  } catch (err) {
    console.error("Register API Error:", err);

    return new Response(
      JSON.stringify({ error: "Registration failed." }),
      { status: 500 }
    );
  }
}
