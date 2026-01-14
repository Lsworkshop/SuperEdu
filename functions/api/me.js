export async function onRequestGet({ request, env }) {
  try {
    // 1️⃣ 读取 cookie
    const cookieHeader = request.headers.get("Cookie") || "";
    const match = cookieHeader.match(/session=([^;]+)/);
    const sessionToken = match ? match[1] : null;

    if (!sessionToken) {
      return new Response(
        JSON.stringify({ loggedIn: false }),
        { status: 401 }
      );
    }

    // 2️⃣ 查询 session
    const session = await env.DB.prepare(`
      SELECT s.member_id, s.expires_at, m.email, m.name
      FROM sessions s
      JOIN members m ON m.member_id = s.member_id
      WHERE s.session_token = ?
    `).bind(sessionToken).first();

    if (!session) {
      return new Response(
        JSON.stringify({ loggedIn: false }),
        { status: 401 }
      );
    }

    // 3️⃣ 判断是否过期
    if (new Date(session.expires_at) < new Date()) {
      // 清理过期 session
      await env.DB.prepare(`
        DELETE FROM sessions WHERE session_token = ?
      `).bind(sessionToken).run();

      return new Response(
        JSON.stringify({ loggedIn: false }),
        { status: 401 }
      );
    }

    // 4️⃣ 登录有效，返回用户信息
    return new Response(
      JSON.stringify({
        loggedIn: true,
        member: {
          email: session.email,
          name: session.name
        }
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("API /me error:", err);
    return new Response(
      JSON.stringify({ loggedIn: false }),
      { status: 500 }
    );
  }
}
