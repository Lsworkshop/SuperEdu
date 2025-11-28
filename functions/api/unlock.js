// unlock.js
import { appendRow } from "./lib_google.js";

export async function onRequestPost({ request }) {
  try {
    const data = await request.json();
    const { firstName, lastName, email } = data;

    if (!firstName || !lastName || !email) {
      return new Response(JSON.stringify({ success: false, message: "Missing fields" }), { status: 400 });
    }

    await appendRow("SuperEdu_Referrals", [firstName, lastName, email, new Date().toISOString()]);

    return new Response(JSON.stringify({
      success: true,
      message: "Unlock successful. Click 'Enter Education Center' to continue!"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, message: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
