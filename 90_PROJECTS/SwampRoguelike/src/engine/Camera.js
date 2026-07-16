import { Vector2 } from '../utils/Vector2.js';

export class Camera {
    constructor(width, height) {
        this.position = new Vector2(0, 0);
        this.viewportSize = new Vector2(width, height);
        this.target = null;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.shakeIntensity = 0;
        this.shakeDecay = 0.9;
    }

    resize(width, height) {
        this.viewportSize.set(width, height);
    }

    setTarget(target) {
        this.target = target;
    }

    shake(intensity) {
        this.shakeIntensity = intensity;
    }

    setZoom(z) {
        this.targetZoom = z;
    }

    update(dt) {
        if (this.target) {
            // Smooth lerp to target position
            const lerpFactor = 0.1;
            this.position.x += (this.target.position.x - this.position.x) * lerpFactor;
            this.position.y += (this.target.position.y - this.position.y) * lerpFactor;
        }

        // Smooth zoom
        this.zoom += (this.targetZoom - this.zoom) * 0.1;

        // Apply camera shake
        if (this.shakeIntensity > 0.01) {
            this.shakeIntensity *= this.shakeDecay;
        } else {
            this.shakeIntensity = 0;
        }
    }

    worldToScreen(worldX, worldY) {
        let offsetX = 0;
        let offsetY = 0;
        if (this.shakeIntensity > 0) {
            offsetX = (Math.random() - 0.5) * this.shakeIntensity;
            offsetY = (Math.random() - 0.5) * this.shakeIntensity;
        }

        const screenX = (worldX - this.position.x) * this.zoom + this.viewportSize.x / 2 + offsetX;
        const screenY = (worldY - this.position.y) * this.zoom + this.viewportSize.y / 2 + offsetY;
        return { x: screenX, y: screenY };
    }

    screenToWorld(screenX, screenY) {
        const worldX = (screenX - this.viewportSize.x / 2) / this.zoom + this.position.x;
        const worldY = (screenY - this.viewportSize.y / 2) / this.zoom + this.position.y;
        return { x: worldX, y: worldY };
    }

    getVisibleBounds() {
        const halfW = (this.viewportSize.x / 2) / this.zoom;
        const halfH = (this.viewportSize.y / 2) / this.zoom;
        return {
            minX: this.position.x - halfW,
            maxX: this.position.x + halfW,
            minY: this.position.y - halfH,
            maxY: this.position.y + halfH
        };
    }
}
