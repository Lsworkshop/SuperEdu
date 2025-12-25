import { hash } from "bcryptjs";

/* ---------- Member ID Generator ---------- */
function generateMemberId(prefix = "EDU") {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${prefix}-${id}`;
}

/* ---------- Password Rule ---------- */
function isValidPassword(pw) {
  return (
    pw &&
    pw.length >= 8 &&
    /[A-Za-z]/.test(pw) &&
    /[0-9]/.test(pw)
  );
}

/* ---------- Register API ---------- */
export async function onRequestPost({ request, env }) {
  try {
    const {
      action,
      first_name,
      last_name,
      email,
      password
    } = await request.json();

    if (action !== "register") {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400 }
      );
    }

    if (!first_name || !last_name || !email || !password) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400 }
      );
    }

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
    const exists = await env.DB
      .prepare("SELECT id FROM members WHERE email = ?")
      .bind(email)
      .first();

    if (exists) {
      return new Response(
        JSON.stringify({ error: "Email already registered" }),
        { status: 409 }
      );
    }

    /* ---------- Member ID ---------- */
    let member_id;
    let conflict = true;
    while (conflict) {
      member_id = generateMemberId();
      const check = await env.DB
        .prepare("SELECT id FROM members WHERE member_id = ?")
        .bind(member_id)
        .first();
      conflict = !!check;
    }

    const password_hash = await hash(password, 10);
    const now = new Date().toISOString();

    /* ---------- Weak Association (Optional) ---------- */
    const lead = await env.DB
      .prepare("SELECT id FROM leads WHERE email = ?")
      .bind(email)
      .first();

    const unlock = await env.DB
      .prepare("SELECT id FROM unlocks WHERE email = ?")
      .bind(email)
      .first();

    const apply = await env.DB
      .prepare("SELECT id FROM applies WHERE email = ?")
      .bind(email)
      .first();

    /* ---------- Insert Member ---------- */
    await env.DB.prepare(`
      INSERT INTO members (
        first_name,
        last_name,
        email,
        member_id,
        password_hash,
        role,
        source,
        status,
        is_verified,
        created_at,
        updated_at,
        lead_id,
        unlock_id,
        apply_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      first_name,
      last_name,
      email,
      member_id,
      password_hash,
      "member",
      "register",
      "active",
      0,
      now,
      now,
      lead?.id || null,
      unlock?.id || null,
      apply?.id || null
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        member_id
      }),
      { status: 200 }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}
