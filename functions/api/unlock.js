export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const { firstName, lastName, email } = data;

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), {
        status: 400
      });
    }

    // 写入 D1
    await env.DB.prepare(
      `INSERT INTO unlocks (first_Name, last_Name, email, created_At)
       VALUES (?, ?, ?, datetime('now'))`
    )
      .bind(firstName, lastName, email)
      .run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500
    });
  }
}
