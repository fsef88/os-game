export class SimplexNoise {
    constructor(seed = 1337) {
        this.p = new Uint8Array(256);
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        this.setSeed(seed);
    }

    setSeed(seed) {
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }
        let s = seed % 2147483647;
        if (s <= 0) s += 2147483646;
        for (let i = 255; i > 0; i--) {
            s = (s * 16807) % 2147483647;
            const r = s % (i + 1);
            const temp = this.p[i];
            this.p[i] = this.p[r];
            this.p[r] = temp;
        }
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
            this.permMod12[i] = (this.perm[i] % 12);
        }
    }

    noise2D(xin, yin) {
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        let s = (xin + yin) * F2;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let t = (i + j) * G2;
        let X0 = i - t;
        let Y0 = j - t;
        let x0 = xin - X0;
        let y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; }
        else { i1 = 0; j1 = 1; }
        let x1 = x0 - i1 + G2;
        let y1 = y0 - j1 + G2;
        let x2 = x0 - 1.0 + 2.0 * G2;
        let y2 = y0 - 1.0 + 2.0 * G2;
        let ii = i & 255;
        let jj = j & 255;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        let n0 = 0, n1 = 0, n2 = 0;
        if (t0 > 0) {
            t0 *= t0;
            const gi0 = this.permMod12[ii + this.perm[jj]];
            n0 = t0 * t0 * (grad2[gi0][0] * x0 + grad2[gi0][1] * y0);
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 > 0) {
            t1 *= t1;
            const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
            n1 = t1 * t1 * (grad2[gi1][0] * x1 + grad2[gi1][1] * y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 > 0) {
            t2 *= t2;
            const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
            n2 = t2 * t2 * (grad2[gi2][0] * x2 + grad2[gi2][1] * y2);
        }
        return 70.0 * (n0 + n1 + n2);
    }
}

const grad2 = [
    [1, 1], [-1, 1], [1, -1], [-1, -1],
    [1, 0], [-1, 0], [1, 0], [-1, 0],
    [0, 1], [0, -1], [0, 1], [0, -1]
];
