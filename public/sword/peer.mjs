export class PhonePeer {
    constructor(onState, onControl) {
        this.onState = onState;
        this.onControl = onControl;
        this.closed = false;
    }

    get ready() {
        return this.sensors?.readyState === "open" && this.control?.readyState === "open";
    }

    async connect(pageAddress = location.href) {
        const page = new URL(pageAddress);
        const values = new URLSearchParams(page.hash.slice(1));
        const room = values.get("room"), token = values.get("token");
        if (!/^[a-f0-9]{32}$/.test(room || "") || !/^[a-f0-9]{48}$/.test(token || "")) {
            throw new Error("Unityの最新のQRコードから開いてください。");
        }
        const endpoint = new URL("/api/sword", page);
        endpoint.search = new URLSearchParams({ room, role: "phone" }).toString();
        const headers = { Authorization: `Bearer ${token}` };
        const offerResponse = await fetch(endpoint, { headers, cache: "no-store", signal: AbortSignal.timeout(10000) });
        if (!offerResponse.ok) {
            throw new Error("QRが期限切れ、または接続サービスが利用できません。Unityで新しいQRを作成してください。");
        }
        const offer = await offerResponse.json();
        if (this.closed) { return; }
        // Host candidates only: same LAN. No STUN/TURN service, video, audio, or sensor relay.
        this.connection = new RTCPeerConnection({ iceServers: [] });
        this.connection.ondatachannel = ({ channel }) => {
            if (!["sword-sensors", "sword-control"].includes(channel.label)) {
                channel.close();
                return;
            }
            if (channel.label === "sword-sensors") {
                this.sensors = channel;
            } else {
                this.control = channel;
                channel.onmessage = event => {
                    try { this.onControl(JSON.parse(event.data)); } catch { /* Ignore invalid control messages. */ }
                };
            }
            channel.onopen = () => {
                if (this.ready) { clearTimeout(this.connectTimer); this.onState("connected"); }
            };
            channel.onclose = () => this.close();
        };
        this.connection.onconnectionstatechange = () => {
            if (["failed", "closed", "disconnected"].includes(this.connection.connectionState)) {
                this.close();
            }
        };
        await this.connection.setRemoteDescription({ type: "offer", sdp: offer.Sdp });
        await this.connection.setLocalDescription(await this.connection.createAnswer());
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => { cleanup(); reject(new Error("LANの接続情報を取得できません。")); }, 7000);
            const check = () => { if (this.connection.iceGatheringState === "complete") { cleanup(); resolve(); } };
            const cleanup = () => { clearTimeout(timer); this.connection.removeEventListener("icegatheringstatechange", check); };
            this.connection.addEventListener("icegatheringstatechange", check);
            check();
        });
        if (this.closed) { return; }
        const answerResponse = await fetch(endpoint, { method: "POST",
            headers: { ...headers, "Content-Type": "application/json" },
            body: JSON.stringify({ Sdp: this.connection.localDescription.sdp }), signal: AbortSignal.timeout(10000) });
        if (!answerResponse.ok) {
            throw new Error("接続情報を送れませんでした。Unityで新しいQRを作成してください。");
        }
        if (!this.ready) { this.onState("waiting"); }
        this.connectTimer = setTimeout(() => { if (!this.ready) { this.close(); } }, 20000);
    }

    sendSample(buffer) {
        if (!this.ready || this.sensors.bufferedAmount > 1024) { return false; }
        this.sensors.send(buffer);
        return true;
    }

    sendControl(value) {
        if (this.control?.readyState === "open" && this.control.bufferedAmount < 4096) {
            this.control.send(JSON.stringify(value));
        }
    }

    close() {
        if (this.closed) { return; }
        this.closed = true;
        clearTimeout(this.connectTimer);
        this.connection?.close();
        this.onState("closed");
    }
}
