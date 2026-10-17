import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import QRCode from "qrcode/lib/core/qrcode.js";

const lifetime = 120;
const roomPattern = /^[a-f0-9]{32}$/;
const tokenPattern = /^[a-f0-9]{48}$/;
const headers = { "Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
const hash = value => createHash("sha256").update(value).digest("hex");
const reply = (value, status = 200) => Response.json(value, { status, headers });

async function description(request) {
    if (Number(request.headers.get("Content-Length")) > 20000 ||
        !request.headers.get("Content-Type")?.startsWith("application/json")) {
        throw new Error("Invalid description");
    }
    const text = await request.text();
    if (text.length > 20000) {
        throw new Error("Description too large");
    }
    const { Sdp } = JSON.parse(text);
    if (typeof Sdp !== "string" || Sdp.length > 16000 || !Sdp.startsWith("v=0") ||
        !/^m=application /m.test(Sdp) || /^m=(audio|video) /m.test(Sdp)) {
        throw new Error("Expected a data-only WebRTC description");
    }
    return Sdp;
}

// A short-lived rendezvous, not durable session storage. Eviction simply requires a new QR.
export function createSignalingHandler(cacheProvider, now = Date.now) {
    return async request => {
        const url = new URL(request.url);
        const browserOrigin = request.headers.get("Origin");
        if (browserOrigin && browserOrigin !== url.origin) {
            return reply({ Error: "Wrong website origin." }, 403);
        }
        try {
            const cache = cacheProvider();
            const room = url.searchParams.get("room");
            if (request.method === "POST" && !room) {
                if (request.headers.get("X-Sword-Client") !== "unity") {
                    return reply({ Error: "Create a connection from the Unity game." }, 403);
                }
                let sdp;
                try { sdp = await description(request); } catch {
                    return reply({ Error: "Invalid WebRTC offer." }, 400);
                }
                const id = randomBytes(16).toString("hex");
                const unityToken = randomBytes(24).toString("hex");
                const phoneToken = randomBytes(24).toString("hex");
                const expiresAt = now() + lifetime * 1000;
                await cache.set(`offer:${id}`, { Sdp: sdp, UnityHash: hash(unityToken),
                    PhoneHash: hash(phoneToken), ExpiresAt: expiresAt }, { ttl: lifetime });
                const page = new URL("/sword/", url);
                page.hash = new URLSearchParams({ room: id, token: phoneToken }).toString();
                const modules = QRCode.create(page.href, { errorCorrectionLevel: "M" }).modules;
                return reply({ SessionId: id, UnityToken: unityToken, JoinUrl: page.href,
                    ExpiresAt: expiresAt / 1000, QrSize: modules.size,
                    QrModules: Array.from(modules.data, value => value ? "1" : "0").join("") });
            }
            const role = url.searchParams.get("role");
            const token = request.headers.get("Authorization")?.replace(/^Bearer /, "") || "";
            if (!roomPattern.test(room || "") || !["unity", "phone"].includes(role) || !tokenPattern.test(token)) {
                return reply({ Error: "Invalid pairing credentials." }, 403);
            }
            const offer = await cache.get(`offer:${room}`);
            if (!offer || now() >= offer.ExpiresAt) {
                return reply({ Error: "QR expired or evicted. Create a new QR in Unity." }, 410);
            }
            const expected = role === "unity" ? offer.UnityHash : offer.PhoneHash;
            if (!timingSafeEqual(Buffer.from(hash(token), "hex"), Buffer.from(expected, "hex"))) {
                return reply({ Error: "Invalid pairing credentials." }, 403);
            }
            if (request.method === "GET") {
                const value = role === "phone" ? offer : await cache.get(`answer:${room}`);
                return reply({ Sdp: value?.Sdp || "", ExpiresAt: offer.ExpiresAt / 1000 });
            }
            if (request.method === "POST" && role === "phone") {
                let sdp;
                try { sdp = await description(request); } catch {
                    return reply({ Error: "Invalid WebRTC answer." }, 400);
                }
                const previous = await cache.get(`answer:${room}`);
                if (previous && previous.Sdp !== sdp) {
                    return reply({ Error: "A phone already answered this QR. Create a new QR." }, 409);
                }
                await cache.set(`answer:${room}`, { Sdp: sdp },
                    { ttl: Math.max(1, Math.ceil((offer.ExpiresAt - now()) / 1000)) });
                return reply({ Ready: true });
            }
            if (request.method === "DELETE" && role === "unity") {
                await cache.delete(`offer:${room}`);
                await cache.delete(`answer:${room}`);
                return reply({ Removed: true });
            }
            return reply({ Error: "Unsupported pairing action." }, 405);
        } catch {
            // Do not log tokens, SDP (local addresses), or sensor values.
            return reply({ Error: "Pairing cache unavailable. Retry from Unity later." }, 503);
        }
    };
}
