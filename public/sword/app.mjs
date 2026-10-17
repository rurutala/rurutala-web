import { orientationQuaternion, vectorAvailable, rotationAvailable } from "./sensor-math.mjs";
import { createSampleEncoder } from "./wire.mjs";
import { PhonePeer } from "./peer.mjs";

const byId = id => document.getElementById(id);
const encode = createSampleEncoder();
let enabled = false;
let orientation;
let orientationAt = -Infinity;
let motionAt = -Infinity;
let sentAt = -Infinity;
let debugAt = -Infinity;
let sequence = 0;
let sent = 0;
let dropped = 0;
let wakeLock;

function updateButtons() {
    byId("calibrate").disabled = !enabled || !peer.ready || performance.now() - motionAt > 300;
}

const peer = new PhonePeer(state => {
    byId("connection").textContent = state === "connected" ? "PCと直接接続済み（センサー中継なし）" :
        state === "waiting" ? "PCへの直接接続を待っています。同じWi-Fiに接続してください。" :
        "切断しました。Unityで新しいQRを作成して、もう一度読み取ってください。";
    if (state === "connected") {
        byId("error").textContent = "";
        byId("feedback").textContent = "センサー開始後にキャリブレーションしてください。";
    }
    updateButtons();
}, value => {
    if (value.Type === "ping") {
        peer.sendControl({ Type: "pong", Id: value.Id });
    } else if (value.Type === "feedback" && typeof value.Status === "string") {
        byId("feedback").textContent = value.Status;
    }
});

async function keepAwake() {
    if (enabled && !document.hidden && navigator.wakeLock) {
        try { wakeLock = await navigator.wakeLock.request("screen"); } catch { /* Optional. */ }
    }
}

byId("enable").addEventListener("click", async () => {
    byId("error").textContent = "";
    try {
        if (!window.isSecureContext || !window.DeviceMotionEvent || !window.DeviceOrientationEvent) {
            throw new Error("UnityのQRコードから、iPhoneのSafariでHTTPSページを開いてください。");
        }
        // Both permission calls must happen in the original tap, before awaiting either result.
        const permissions = [DeviceMotionEvent, DeviceOrientationEvent].map(type =>
            typeof type.requestPermission === "function" ? type.requestPermission() : Promise.resolve("granted"));
        if ((await Promise.all(permissions)).some(result => result !== "granted")) {
            throw new Error("センサー許可が拒否されました。Safariのサイト設定を確認してください。");
        }
        enabled = true;
        byId("enable").disabled = true;
        byId("enable").textContent = "センサー開始済み";
        await keepAwake();
        updateButtons();
    } catch (error) {
        byId("error").textContent = error.message;
    }
});

window.addEventListener("deviceorientation", event => {
    if (enabled && [event.alpha, event.beta, event.gamma].every(Number.isFinite)) {
        orientation = orientationQuaternion(event.alpha, event.beta, event.gamma);
        orientationAt = performance.now();
    }
});

window.addEventListener("devicemotion", event => {
    if (!enabled || document.hidden) { return; }
    const now = performance.now();
    if (!orientation || now - orientationAt > 120 || !vectorAvailable(event.acceleration) || !rotationAvailable(event.rotationRate)) {
        byId("error").textContent = "姿勢・加速度・ジャイロが揃っていません。Safariの許可と前面表示を確認してください。";
        return;
    }
    motionAt = now;
    if (now - sentAt < 1000 / 65 || !peer.ready) { return; }
    const sample = { Seq: sequence++, Time: now / 1000, ...orientation,
        Ax: event.acceleration.x, Ay: event.acceleration.y, Az: event.acceleration.z,
        Gx: event.rotationRate.beta, Gy: event.rotationRate.gamma, Gz: event.rotationRate.alpha,
        OrientationAge: (now - orientationAt) / 1000 };
    if (peer.sendSample(encode(sample))) { sent++; } else { dropped++; }
    sentAt = now;
    if (now - debugAt >= 250) {
        debugAt = now;
        byId("error").textContent = "";
        byId("debug").textContent = `直接送信: ${sent} / 破棄: ${dropped} / 52バイト/回\n` +
            `加速度: ${sample.Ax.toFixed(2)}, ${sample.Ay.toFixed(2)}, ${sample.Az.toFixed(2)} m/s²\n` +
            `角速度: ${sample.Gx.toFixed(1)}, ${sample.Gy.toFixed(1)}, ${sample.Gz.toFixed(1)} deg/s`;
        updateButtons();
    }
});

byId("calibrate").addEventListener("click", () => {
    if (peer.ready) {
        peer.sendControl({ Type: "calibrate" });
        byId("feedback").textContent = "上端をPCへ向けて静止してください。";
    }
});
document.addEventListener("visibilitychange", () => {
    orientation = undefined;
    motionAt = -Infinity;
    if (document.hidden) { void wakeLock?.release(); } else { void keepAwake(); }
    updateButtons();
});
window.addEventListener("pagehide", () => peer.close());
setInterval(updateButtons, 500);
peer.connect().catch(error => {
    peer.close();
    byId("error").textContent = error.message;
});
