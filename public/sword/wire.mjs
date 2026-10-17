export const packetSize = 52;

// Little endian: version/reserved, orientation age (ms), sequence, timestamp (ms), 10 float32 values.
export function createSampleEncoder() {
    const buffer = new ArrayBuffer(packetSize);
    const view = new DataView(buffer);
    view.setUint8(0, 1);
    const fields = ["Qx", "Qy", "Qz", "Qw", "Ax", "Ay", "Az", "Gx", "Gy", "Gz"];
    return sample => {
        view.setUint16(2, Math.round(sample.OrientationAge * 1000), true);
        view.setUint32(4, sample.Seq, true);
        view.setUint32(8, Math.floor(sample.Time * 1000), true);
        fields.forEach((field, index) => view.setFloat32(12 + index * 4, sample[field], true));
        return buffer;
    };
}
