/* ===========================
   X-Bot-Token — 브라우저 검증 토큰 (서버 2-way 검증 지원)

   토큰 포맷:
     X-Bot-Token: <base64url(payload_json)>.<hex(HMAC-SHA256(payload, SECRET))>

   payload_json = { v, ts, nonce, fp, meta }
     - v:     프로토콜 버전 ("1")
     - ts:    생성 시각 (UNIX seconds)
     - nonce: 요청별 랜덤값 (서버에서 재사용 탐지)
     - fp:    Canvas fingerprint 해시 (요청자 추적용 rate-limit key)
     - meta:  브라우저 메타데이터 해시

   서버는 payload를 디코딩해서 HMAC을 재계산하여 무결성 검증 가능.
   SECRET은 NEXT_PUBLIC_ 이라 어차피 번들에 노출 → 암호학적 보안 경계가 아닌
   "우리 JS를 실제로 실행한 요청"을 강제하는 허들. 순수 HTTP 봇(curl, requests,
   매크로)은 Canvas 렌더링/Web Crypto 실행 불가이므로 유효 토큰 생성 불가.
=========================== */

const SECRET = process.env.NEXT_PUBLIC_BOT_TOKEN_SECRET ?? "playball-xbot-v1";
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5분
const TOKEN_VERSION = "1";
let tokenPromise: Promise<string> | null = null;

let cachedToken: string | null = null;
let cachedAt = 0;

/** Canvas fingerprint — 브라우저/OS/GPU 차이로 고유 해시 생성 */
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

/** 브라우저 메타 정보 — 화면/언어/타임존/코어수/webdriver 여부 */
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

/** SHA-256 (hex, 앞 16자리) */
async function sha256Short(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(message));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}

/** HMAC-SHA256 (hex) */
async function hmacSha256Hex(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** base64url (padding 없이, URL-safe) */
function base64urlEncode(input: string): string {
  return btoa(input)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** 16바이트 랜덤 nonce (hex 32자) */
function randomNonce(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * X-Bot-Token 생성
 *
 * 결과 예시: eyJ2IjoiMSIsInRzIjoxNzA2MDAwMDAwLCJub25jZSI6IjFmM2Y...".abcd1234...
 *
 * 캐싱: 5분간 재사용 (매 요청마다 Canvas 렌더링 방지).
 * 서버는 nonce를 5분 TTL로 Redis에 저장하여 재사용 탐지.
 * ※ 동일 브라우저의 여러 요청은 같은 토큰을 공유 → 서버도 같은 nonce의 5분 내
 *    재등장은 정상으로 처리 (첫 요청에만 INCR, 이후는 fp-count만 증가).
 */
export async function getBotToken(): Promise<string> {
  const now = Date.now();

  if (cachedToken && now - cachedAt < TOKEN_TTL_MS) {
    return cachedToken;
  }

  const ts = Math.floor(now / 1000);
  const nonce = randomNonce();
  const fp = await sha256Short(getCanvasFingerprint());
  const meta = await sha256Short(getBrowserMeta());

  const payload = JSON.stringify({ v: TOKEN_VERSION, ts, nonce, fp, meta });
  const payloadB64 = base64urlEncode(payload);
  const sig = await hmacSha256Hex(payloadB64, SECRET);

  cachedToken = `${payloadB64}.${sig}`;
  cachedAt = now;

  return cachedToken;
}

/**
 * 서버사이드 / 초기 로드 직후 즉시 호출 시 빈 문자열 반환 (SSR 안전).
 * fetch wrapper는 빈 토큰이면 헤더 생략 → 백은 필수 엔드포인트에서 403 처리.
 */
export function getBotTokenSync(): string {
  if (typeof window === "undefined") return "";
  return cachedToken ?? "";
}

/**
 * 앱 부트 시점(providers.tsx 등)에 미리 호출하여 첫 API 요청 전에 토큰 확보.
 */
export async function ensureBotTokenReady(): Promise<void> {
  if (typeof window === "undefined") return;
  await getBotToken();
}
