import { orientationQuaternion, vectorAvailable, rotationAvailable } from "./sensor-math.mjs";
import { pairingAddress } from "./pairing.mjs";

const byId = id => document.getElementById(id);
let socket;
let retry;
let enabled = false;
let unityConnected = false;
let orientation;
let orientationAt = -Infinity;
let motionAt = -Infinity;
let sentAt = -Infinity;
let debugAt = -Infinity;
let sequence = 0;
let sent = 0;
let dropped = 0;
let wakeLock;
let expired = false;

function updateButtons() {
    byId("calibrate").disabled = !enabled || !unityConnected || socket?.readyState !== WebSocket.OPEN ||
        performance.now() - motionAt > 300;
}

function connect() {
    clearTimeout(retry);
    if (document.hidden || expired) {
        return;
    }
    try {
        const relayAddress = document.querySelector('meta[name="sword-relay"]')?.content;
        socket = new WebSocket(pairingAddress(location.href, relayAddress));
    } catch {
        byId("error").textContent = "Unityの最新のQRコードから開いてください。";
        return;
    }
    socket.onopen = () => {
        byId("connection").textContent = "接続済み";
        byId("error").textContent = "";
        sentAt = -Infinity;
        updateButtons();
    };
    socket.onmessage = event => {
        const value = JSON.parse(event.data);
        if (value.Type === "unity") {
            unityConnected = value.Connected;
            byId("feedback").textContent = unityConnected ? "Unity接続済み。センサー開始後にキャリブレーションしてください。" : "UnityのPlay開始を待っています。";
        } else if (value.Type === "ping") {
            socket.send(JSON.stringify({ Type: "pong", Id: value.Id }));
        } else if (value.Type === "feedback") {
            byId("feedback").textContent = value.Status;
        }
        updateButtons();
    };
    socket.onerror = () => {
        byId("error").textContent = "接続できません。インターネット接続とQRの有効期限を確認してください。";
    };
    socket.onclose = event => {
        unityConnected = false;
        if (event.code === 4001) {
            expired = true;
            byId("connection").textContent = "接続の有効期限が切れました。Unityの新しいQRコードを読み取ってください。";
            updateButtons();
            return;
        }
        byId("connection").textContent = "切断しました。2秒後に再接続します。";
        updateButtons();
        if (!document.hidden) {
            retry = setTimeout(connect, 2000);
        }
    };
}

async function keepAwake() {
    if (enabled && !document.hidden && navigator.wakeLock) {
        try {
            wakeLock = await navigator.wakeLock.request("screen");
        } catch {
            // Screen Wake Lock is optional; keep Safari visible if unavailable.
        }
    }
}

byId("enable").addEventListener("click", async () => {
    byId("error").textContent = "";
    try {
        if (!window.isSecureContext) {
            throw new Error("センサーを利用するには、UnityのQRコードからHTTPSの接続ページを開いてください。");
        }
        if (!window.DeviceMotionEvent || !window.DeviceOrientationEvent) {
            throw new Error("このブラウザーではセンサーを利用できません。iPhoneのSafariで開いてください。");
        }
        // Invoke BOTH permission methods within the original tap, before any await.
        const permissions = [DeviceMotionEvent, DeviceOrientationEvent].map(type =>
            typeof type.requestPermission === "function" ? type.requestPermission() : Promise.resolve("granted"));
        const results = await Promise.all(permissions);
        if (results.some(result => result !== "granted")) {
            throw new Error("センサー許可が拒否されました。Safariのサイト設定を確認して再読み込みしてください。");
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
    if (!enabled || ![event.alpha, event.beta, event.gamma].every(Number.isFinite)) {
        return;
    }
    orientation = orientationQuaternion(event.alpha, event.beta, event.gamma);
    orientationAt = performance.now();
});

window.addEventListener("devicemotion", event => {
    if (!enabled || document.hidden) {
        return;
    }
    const now = performance.now();
    if (!orientation || now - orientationAt > 120 || !vectorAvailable(event.acceleration) || !rotationAvailable(event.rotationRate)) {
        byId("error").textContent = "姿勢・重力除去済み加速度・ジャイロが揃っていません。Safariの許可設定を確認してください。";
        return;
    }
    motionAt = now;
    if (now - sentAt < 1000 / 65 || socket?.readyState !== WebSocket.OPEN) {
        return;
    }
    // Never build a motion backlog. A gap makes Unity require calibration again.
    if (socket.bufferedAmount > 8192) {
        dropped++;
        socket.close(4000, "Sensor backlog");
        return;
    }
    const sample = {
        Type: "sample", Seq: sequence++, Time: now / 1000, ...orientation,
        Ax: event.acceleration.x, Ay: event.acceleration.y, Az: event.acceleration.z,
        // W3C rotationRate: beta = local X, gamma = local Y, alpha = local Z (deg/s).
        Gx: event.rotationRate.beta, Gy: event.rotationRate.gamma, Gz: event.rotationRate.alpha,
        OrientationAge: (now - orientationAt) / 1000
    };
    socket.send(JSON.stringify(sample));
    sentAt = now;
    sent++;
    if (now - debugAt > 200) {
        debugAt = now;
        byId("error").textContent = "";
        byId("debug").textContent = `送信: ${sent} / backlog切断: ${dropped}\n` +
            `加速度: ${sample.Ax.toFixed(2)}, ${sample.Ay.toFixed(2)}, ${sample.Az.toFixed(2)} m/s²\n` +
            `角速度: ${sample.Gx.toFixed(1)}, ${sample.Gy.toFixed(1)}, ${sample.Gz.toFixed(1)} deg/s\n` +
            `姿勢の古さ: ${(now - orientationAt).toFixed(0)} ms`;
        updateButtons();
    }
});

byId("calibrate").addEventListener("click", () => {
    if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ Type: "calibrate" }));
        byId("feedback").textContent = "上端をPCへ向けて静止してください。結果はUnity画面に表示されます。";
    }
});

document.addEventListener("visibilitychange", () => {
    orientation = undefined;
    motionAt = -Infinity;
    if (document.hidden) {
        clearTimeout(retry);
        socket?.close(1000, "Page hidden");
        wakeLock?.release();
    } else {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
            connect();
        }
        void keepAwake();
    }
    updateButtons();
});

window.addEventListener("pagehide", () => socket?.close(1000, "Page closed"));
setInterval(() => {
    updateButtons();
    if (enabled && !document.hidden && performance.now() - motionAt > 1500) {
        byId("error").textContent = "センサーが停止しています。Safariの許可・前面表示・スリープ状態を確認してください。";
    }
}, 500);
connect();
