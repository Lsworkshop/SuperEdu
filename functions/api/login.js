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
   Cookie Builder
========================= */
function buildSessionCookie(token, maxAgeSeconds = 60 * 60 * 24 * 7) {
  return [
    `session=${token}`,
    `HttpOnly`,
    `Secure`,
    `SameSite=Lax`,
    `Path=/`,
    `Domain=edu.lsfinova.com`,  // ✅ 确保跨子域可用
    `Max-Age=${maxAgeSeconds}`
  ].join("; ");
}

/* =========================
   Login API
========================= */
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Please enter email and password." }),
        { status: 400 }
      );
    }

    // 查找成员
    const member = await env.DB
      .prepare("SELECT member_id, password_hash, is_verified FROM members WHERE email = ?")
      .bind(email)
      .first();

    if (!member) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password." }),
        { status: 401 }
      );
    }

    // 校验密码
    const password_hash = await hashPassword(password);
    if (password_hash !== member.password_hash) {
      return new Response(
        JSON.stringify({ error: "Invalid email or password." }),
        { status: 401 }
      );
    }

    // 校验邮箱是否验证
    if (member.is_verified === 0) {
      return new Response(
        JSON.stringify({ error: "Please verify your email before logging in." }),
        { status: 403 }
      );
    }

    // 生成 session token
    const session_token = crypto.randomUUID();

    // 插入到 sessions 表
    await env.DB.prepare(`
      INSERT INTO sessions (
        session_token,
        member_id,
        created_at,
        expires_at
      ) VALUES (?, ?, CURRENT_TIMESTAMP, datetime('now', '+7 day'))
    `).bind(session_token, member.member_id).run();

    // 返回成功并设置 cookie
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Set-Cookie": buildSessionCookie(session_token),
          "Content-Type": "application/json"
        }
      }
    );

  } catch (err) {
    console.error("Login API Error:", err);
    return new Response(
      JSON.stringify({ error: "Login failed." }),
      { status: 500 }
    );
  }
}

