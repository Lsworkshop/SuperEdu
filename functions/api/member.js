// functions/api/member.js
import { hash } from "bcryptjs";

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
      password
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
        JSON.stringify({ error: "This email is already registered." }),
        { status: 409 }
      );
    }

    /* ---------- Generate Unique Member ID ---------- */
    let member_id;
    let idExists;

    do {
      member_id = generateMemberId();
      idExists = await env.DB
        .prepare("SELECT 1 FROM members WHERE member_id = ?")
        .bind(member_id)
        .first();
    } while (idExists);

    /* ---------- Password Hash ---------- */
    const password_hash = await hash(password, 10);
    const now = new Date().toISOString();

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
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        first_name,
        last_name,
        email,
        member_id,
        password_hash,
        "member",        // role
        "register",      // source
        "active",        // status
        0,               // is_verified
        now,
        now
      )
      .run();

    /* ---------- Success ---------- */
    return new Response(
      JSON.stringify({
        success: true,
        member_id
      }),
      { status: 200 }
    );

  } catch (err) {
  if (err.message && err.message.includes("UNIQUE")) {
    return new Response(
      JSON.stringify({
        error: "This email is already registered. Please log in instead."
      }),
      { status: 409 }
    );
  }

  return new Response(
    JSON.stringify({ error: "Registration failed." }),
    { status: 500 }
  );
}

}
