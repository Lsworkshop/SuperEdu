// lib_google.js
// 使用 Google Sheets API (原生 HTTP)，兼容 Cloudflare Deno Functions

const SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID');
const SA_KEY = JSON.parse(Deno.env.get('GOOGLE_SA_KEY'));

// 获取 JWT Access Token
async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: SA_KEY.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  // 使用 jose 库生成签名 JWT
  // Deno Cloudflare Pages 默认支持 Web Crypto API
  function base64urlEncode(obj) {
    return btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encodedHeader = base64urlEncode(header);
  const encodedPayload = base64urlEncode(payload);
  const toSign = `${encodedHeader}.${encodedPayload}`;

  // 签名
  const encoder = new TextEncoder();
  const keyData = Uint8Array.from(atob(SA_KEY.private_key.replace(/-----\w+ PRIVATE KEY-----|\n/g, '')), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(toSign));
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const jwt = `${toSign}.${base64Signature}`;

  // 获取 Access Token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const data = await res.json();
  return data.access_token;
}

// 添加一行数据
export async function appendRow(sheetName, row) {
  const token = await getAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}:append?valueInputOption=RAW`;
  await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [row] })
  });
}
