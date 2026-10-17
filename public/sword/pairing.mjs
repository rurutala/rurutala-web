export function pairingAddress(pageAddress, relayAddress) {
    const page = new URL(pageAddress);
    const relay = new URL(relayAddress || page.origin);
    const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(relay.hostname);
    if ((relay.protocol !== "https:" && !(relay.protocol === "http:" && loopback)) ||
        relay.username || relay.password || relay.search || relay.hash || relay.pathname !== "/") {
        throw new Error("Invalid HTTPS relay configuration.");
    }
    const hash = page.hash.slice(1);
    const parameters = new URLSearchParams(hash);
    const room = parameters.get("room");
    const token = parameters.get("token") || hash;
    if (!/^[a-f0-9]{48}$/.test(token) || (room !== null && !/^[a-f0-9]{32}$/.test(room))) {
        throw new Error("Invalid QR. Open the latest QR from the Unity game.");
    }
    const socket = new URL(room ? `/rooms/${room}/phone` : "/phone", relay);
    socket.protocol = relay.protocol === "https:" ? "wss:" : "ws:";
    socket.searchParams.set("token", token);
    return socket.href;
}
