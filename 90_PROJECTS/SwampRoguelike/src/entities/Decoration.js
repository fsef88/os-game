import { Entity } from './Entity.js';

export class Decoration extends Entity {
    constructor(x, y, variant = 0) {
        super(x, y);
        this.variant = variant;
        this.layer = 4; // Small decorations layer
        this.collision = null; // Walkable
    }

    draw(ctx, camera, assetManager) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const img = assetManager.getAsset(`dec_${this.variant}`) || assetManager.getAsset('dec_0');

        const drawW = 64 * camera.zoom;
        const drawH = 64 * camera.zoom;

        if (img) {
            ctx.drawImage(img, screenPos.x - drawW / 2, screenPos.y - drawH / 2, drawW, drawH);
        }
    }
}
