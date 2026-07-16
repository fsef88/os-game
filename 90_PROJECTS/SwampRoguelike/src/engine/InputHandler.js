export class InputHandler {
    constructor() {
        this.keys = {};
        this.debugKeys = {
            f1: false,
            f2: false,
            f3: false
        };

        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'F1') {
                e.preventDefault();
                this.debugKeys.f1 = !this.debugKeys.f1;
            }
            if (e.code === 'F2') {
                e.preventDefault();
                this.debugKeys.f2 = !this.debugKeys.f2;
            }
            if (e.code === 'F3') {
                e.preventDefault();
                this.debugKeys.f3 = !this.debugKeys.f3;
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }

    isKeyDown(code) {
        return !!this.keys[code];
    }

    getMovementVector() {
        let x = 0;
        let y = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

        if (x !== 0 && y !== 0) {
            const len = Math.hypot(x, y);
            x /= len;
            y /= len;
        }
        return { x, y };
    }
}
