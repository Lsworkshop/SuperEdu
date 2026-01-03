export async function onRequestPost({ request, env }) {

  /* ===============================
     0. Content-Type 校验
  =============================== */
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return jsonError("Invalid content type", 400);
  }

  /* ===============================
     1. 解析 JSON
  =============================== */
  let data;
  try {
    data = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  /* ===============================
     2. 字段解构 + 清洗
  =============================== */
  const firstName = (data.firstName || "").trim();
  const lastName  = (data.lastName  || "").trim();
  const email     = (data.email     || "").trim();
  const phone     = (data.phone     || "").trim();
  const gradYear  = (data.gradYear  || "").trim();
  const message   = (data.message   || "").trim();
  const source    = (data.source    || "homepage").trim();

  /* ===============================
     3. 必填字段校验
  =============================== */
  if (!firstName || !lastName || !email) {
    return jsonError("Missing required fields", 400);
  }

  /* ===============================
     4. Email 全格式校验（严格）
  =============================== */
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    return jsonError("Invalid email format", 400);
  }

  /* ===============================
     5. 写入 D1 数据库
  =============================== */
  try {
    await env.DB
      .prepare(`
        INSERT INTO consultations
        (first_name, last_name, email, phone, grad_year, message, source)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        firstName,
        lastName,
        email,
        phone || null,
        gradYear || null,
        message || null,
        source
      )
      .run();
  } catch (err) {
    console.error("D1 insert failed:", err);
    return jsonError("Database error", 500);
  }

  /* ===============================
     6. 成功返回
  =============================== */
  return jsonSuccess({
    message: "Consultation request submitted successfully"
  });
}

/* ===============================
   工具函数
=============================== */

function jsonError(message, status = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      message
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}

function jsonSuccess(data = {}) {
  return new Response(
    JSON.stringify({
      success: true,
      ...data
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
