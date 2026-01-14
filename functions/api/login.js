/* =========================
   Helpers
========================= */

// Password hash (Web Crypto)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Cookie builder
function buildSessionCookie(token, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return [
    `session=${token}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Path=/`,
    `Max-Age=${maxAgeSeconds}`
  ].join("; ");
}

// Generate secure session token
function generateSessionToken() {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
}

// Email format check
function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

/* =========================
   Login API
========================= */
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Please provide email and password." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch member from DB
    const member = await env.DB.prepare(`
      SELECT member_id, password_hash, is_verified
      FROM members
      WHERE email = ?
    `).bind(email).first();

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Email not registered." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hash input password
    const inputHash = await hashPassword(password);

    if (inputHash !== member.password_hash) {
      return new Response(
        JSON.stringify({ error: "Incorrect password." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check email verified
    if (member.is_verified !== 1) {
      return new Response(
        JSON.stringify({ error: "Please verify your email before logging in." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generate session token
    const session_token = generateSessionToken();

    // Insert session into DB
    await env.DB.prepare(`
      INSERT INTO sessions (member_id, session_token, created_at, expires_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, datetime('now', '+7 days'))
    `).bind(member.member_id, session_token).run();

    // Success: set cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": buildSessionCookie(session_token)
        }
      }
    );

  } catch (err) {
    console.error("Login API Error:", err);
    return new Response(
      JSON.stringify({ error: "Login failed." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
