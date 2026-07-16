import { Entity } from './Entity.js';

export class Rock extends Entity {
    constructor(x, y, variant = 0) {
        super(x, y);
        this.variant = variant;
        this.layer = 5;
        this.collision = {
            offsetX: -35,
            offsetY: -10,
            width: 70,
            height: 50
        };
    }

    draw(ctx, camera, assetManager) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const img = assetManager.getAsset(`rock_${this.variant}`) || assetManager.getAsset('rock_0');

        const drawW = 90 * camera.zoom;
        const drawH = 90 * camera.zoom;

        if (img) {
            ctx.drawImage(img, screenPos.x - drawW / 2, screenPos.y - drawH / 2, drawW, drawH);
        }
    }
}
