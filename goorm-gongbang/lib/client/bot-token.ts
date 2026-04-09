/* ===========================
   X-Bot-Token — 브라우저 검증 토큰
   JavaScript 실행 가능한 진짜 브라우저만 생성 가능
   순수 HTTP 봇(curl, requests, 매크로)은 생성 불가
=========================== */

const SECRET = process.env.NEXT_PUBLIC_BOT_TOKEN_SECRET ?? "playball-xbot-v1";
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5분

let cachedToken: string | null = null;
let cachedAt = 0;

/**
 * Canvas fingerprint 생성
 * 브라우저마다 렌더링 미세 차이 → 고유 해시
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "no-canvas";

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#1a1a1a";
    ctx.fillText("PlayBall-BotCheck", 2, 2);

    ctx.fillStyle = "rgba(102,204,0,0.7)";
    ctx.fillRect(75, 1, 50, 20);

    return canvas.toDataURL().slice(-50);
  } catch {
    return "canvas-error";
  }
}

/**
 * 브라우저 메타 정보 수집
 * navigator.webdriver: Headless Chrome(Puppeteer)은 true, 일반 브라우저는 false
 */
function getBrowserMeta(): string {
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    navigator.language,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency ?? 0,
    navigator.webdriver ? 1 : 0,
  ].join("|");
}

/**
 * HMAC-SHA256 서명 (Web Crypto API)
 */
async function hmacSign(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

/**
 * X-Bot-Token 생성
 * 결과: base64(timestamp:fingerprint_hash:signature)
 *
 * 캐싱: 5분간 재사용 (매 요청마다 Canvas 렌더링 방지)
 */
export async function getBotToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now - cachedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  const timestamp = Math.floor(now / 1000);
  const fingerprint = getCanvasFingerprint();
  const meta = getBrowserMeta();

  const payload = `${fingerprint}:${meta}:${timestamp}`;
  const sig = await hmacSign(payload);

  cachedToken = btoa(`${timestamp}:${sig}`);
  cachedAt = now;

  return cachedToken;
}

/**
 * 서버사이드에서는 빈 문자열 반환 (SSR 안전)
 */
export function getBotTokenSync(): string {
  if (typeof window === "undefined") return "";
  return cachedToken ?? "";
}
