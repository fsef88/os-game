import { Entity } from './Entity.js';

export class Tree extends Entity {
    constructor(x, y, variant = 0) {
        super(x, y);
        this.variant = variant;
        this.layer = 5; // Large objects layer
        this.collision = {
            offsetX: -30,
            offsetY: 40,
            width: 60,
            height: 40
        };
    }

    draw(ctx, camera, assetManager) {
        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const img = assetManager.getAsset(`tree_${this.variant}`) || assetManager.getAsset('tree_0');

        const drawW = 140 * camera.zoom;
        const drawH = 200 * camera.zoom;

        if (img) {
            ctx.drawImage(img, screenPos.x - drawW / 2, screenPos.y - drawH + 40, drawW, drawH);
        }
    }
}
