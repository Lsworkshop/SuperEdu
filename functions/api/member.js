export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return jsonError("Invalid JSON body");
    }

    const { action } = data;

    if (action === "register") {
      return handleRegister(data, env);
    }

    if (action === "login") {
      return jsonError("Login not implemented yet", 501);
    }

    return jsonError("Unknown action");
  }
};

/* =========================
   Register Logic
========================= */
async function handleRegister(data, env) {
  const {
    first_name,
    last_name,
    email,
    password,
    source = "register-page",
    lead_id = null,
    unlock_id = null,
    apply_id = null
  } = data;

  /* ---- 基础校验 ---- */
  if (!first_name || !last_name || !email || !password) {
    return jsonError("Missing required fields");
  }

  if (!isValidEmail(email)) {
    return jsonError("Invalid email format");
  }

  if (password.length < 6) {
    return jsonError("Password must be at least 6 characters");
  }

  /* ---- Email 唯一性校验 ---- */
  const exists = await env.DB
    .prepare("SELECT id FROM members WHERE email = ?")
    .bind(email)
    .first();

  if (exists) {
    return jsonError("This email is already registered");
  }

  /* ---- 生成 Member ID ---- */
  const member_id = generateMemberId();

  /* ---- 密码 Hash（Workers 方式） ---- */
  const password_hash = await hashPassword(password);

  /* ---- 写入数据库 ---- */
  try {
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
        lead_id,
        unlock_id,
        apply_id
      )
      VALUES (?, ?, ?, ?, ?, 'member', ?, 'active', 0, ?, ?, ?)
    `).bind(
      first_name,
      last_name,
      email,
      member_id,
      password_hash,
      source,
      lead_id,
      unlock_id,
      apply_id
    ).run();
  } catch (err) {
    return jsonError("Database error");
  }

  /* ---- 返回成功 ---- */
  return jsonSuccess({
    message: "Account created successfully",
    member_id
  });
}

/* =========================
   Utilities
========================= */

/* Email 校验（与你前端一致） */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/* 生成简短好记的 Member ID */
function generateMemberId() {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const time = Date.now().toString().slice(-4);
  return `SN-${rand}${time}`; // 例：SN-A9F31234
}

/* Password Hash（SHA-256） */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

/* JSON helpers */
function jsonError(message, status = 400) {
  return new Response(
    JSON.stringify({ success: false, message }),
    { status, headers: { "Content-Type": "application/json" } }
  );
}

function jsonSuccess(data) {
  return new Response(
    JSON.stringify({ success: true, ...data }),
    { headers: { "Content-Type": "application/json" } }
  );
}
