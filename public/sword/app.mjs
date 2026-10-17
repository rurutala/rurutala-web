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
let sequence = 0;
let wakeLock;

function updateButtons() {
    byId("calibrate").disabled = !enabled || !peer.ready || performance.now() - motionAt > 300;
}

const peer = new PhonePeer(updateButtons, value => {
    if (value.Type === "ping") {
        peer.sendControl({ Type: "pong", Id: value.Id });
    }
});

async function keepAwake() {
    if (enabled && !document.hidden && navigator.wakeLock) {
        try { wakeLock = await navigator.wakeLock.request("screen"); } catch { /* Optional. */ }
    }
}

byId("enable").addEventListener("click", async () => {
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
        byId("enable").removeAttribute("aria-description");
        await keepAwake();
        updateButtons();
    } catch (error) {
        byId("enable").textContent = "センサーを許可して再試行";
        byId("enable").setAttribute("aria-description", error.message);
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
        return;
    }
    motionAt = now;
    if (now - sentAt < 1000 / 65 || !peer.ready) { return; }
    const sample = { Seq: sequence++, Time: now / 1000, ...orientation,
        Ax: event.acceleration.x, Ay: event.acceleration.y, Az: event.acceleration.z,
        Gx: event.rotationRate.beta, Gy: event.rotationRate.gamma, Gz: event.rotationRate.alpha,
        OrientationAge: (now - orientationAt) / 1000 };
    peer.sendSample(encode(sample));
    sentAt = now;
});

byId("calibrate").addEventListener("click", () => {
    if (peer.ready) {
        peer.sendControl({ Type: "calibrate" });
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
    byId("calibrate").setAttribute("aria-description", error.message);
});
