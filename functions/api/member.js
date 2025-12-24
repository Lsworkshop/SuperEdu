export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { first_name, last_name, email, password } = data;

    // ---------------- Email 格式校验 ----------------
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), { status: 400 });
    }

    // ---------------- 必填字段校验 ----------------
    if (!first_name || !last_name || !email || !password) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), { status: 400 });
    }

    // ---------------- 生成 Member ID ----------------
    const memberId = "M" + Date.now().toString().slice(-6);

    const now = new Date().toISOString();

    // ---------------- 写入 members 表 ----------------
    await env.DB.prepare(`
      INSERT INTO members 
      (first_name, last_name, email, member_id, password_hash, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(first_name, last_name, email, memberId, password, "active", now, now)
    .run();

    return new Response(JSON.stringify({ success: true, member_id: memberId }), { status: 200 });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
