export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone = "",
      gradYear = "",
      message = "",
      source = "homepage"
    } = body;

    // ===== 基础校验 =====
    if (!firstName || !lastName || !email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ===== 写入 D1 =====
    const stmt = env.DB.prepare(`
      INSERT INTO consultations
      (first_name, last_name, email, phone, grad_year, message, source)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    await stmt.run(
      firstName,
      lastName,
      email,
      phone,
      gradYear,
      message,
      source
    );

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        detail: err.message
      }),
      { status: 500 }
    );
  }
}
