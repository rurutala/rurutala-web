// Device orientation uses intrinsic Z-X'-Y'' rotations in a right-handed frame.
// Axes remain attached to the physical portrait phone, even in landscape Safari.
export function orientationQuaternion(alpha, beta, gamma) {
    const halfRadians = Math.PI / 360;
    const a = alpha * halfRadians;
    const b = beta * halfRadians;
    const g = gamma * halfRadians;
    const ca = Math.cos(a), sa = Math.sin(a);
    const cb = Math.cos(b), sb = Math.sin(b);
    const cg = Math.cos(g), sg = Math.sin(g);
    return {
        Qx: ca * sb * cg - sa * cb * sg,
        Qy: ca * cb * sg + sa * sb * cg,
        Qz: sa * cb * cg + ca * sb * sg,
        Qw: ca * cb * cg - sa * sb * sg
    };
}

export function vectorAvailable(vector) {
    return vector != null && [vector.x, vector.y, vector.z].every(Number.isFinite);
}

export function rotationAvailable(rotation) {
    return rotation != null && [rotation.alpha, rotation.beta, rotation.gamma].every(Number.isFinite);
}
