export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response("Invalid verification link.", { status: 400 });
    }

    // 查 token
    const record = await env.DB.prepare(`
      SELECT id, member_id, expires_at, used
      FROM email_verifications
      WHERE token = ?
    `).bind(token).first();

    if (!record) {
      return new Response("Verification link not found.", { status: 404 });
    }

    // 已使用 → 直接跳
    if (record.used === 1) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/welcome.html"
        }
      });
    }

    // 过期
    if (new Date(record.expires_at) < new Date()) {
      return new Response("Verification link has expired.", { status: 410 });
    }

    // 标记 member 已验证
    await env.DB.prepare(`
      UPDATE members
      SET is_verified = 1
      WHERE member_id = ?
    `).bind(record.member_id).run();

    // 标记 token 已使用
    await env.DB.prepare(`
      UPDATE email_verifications
      SET used = 1,
          verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(record.id).run();

    // ✅ 成功跳转（稳定写法）
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/welcome.html?verified=1"
      }
    });

  } catch (err) {
    console.error("Verify Email Error:", err);
    return new Response("Verification failed.", { status: 500 });
  }
}
