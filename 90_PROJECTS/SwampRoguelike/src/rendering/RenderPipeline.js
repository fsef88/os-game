export class RenderPipeline {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    render(world, player, camera, assetManager, input, fps) {
        const ctx = this.ctx;
        const bounds = camera.getVisibleBounds();

        // Clear dark background
        ctx.fillStyle = '#050805';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // STAGE 2: Render real PNG ground tile (tile_moss) instead of colored square
        this.renderGroundLayer(world, camera, assetManager, bounds);

        // Render Player
        player.draw(ctx, camera, assetManager);

        // Debug Overlay
        if (input && input.debugKeys && input.debugKeys.f1) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(10, 10, 110, 32);
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('FPS: ' + Math.round(fps), 20, 31);
        }
    }

    renderGroundLayer(world, camera, assetManager, bounds) {
        const ctx = this.ctx;
        const tileSize = 64;

        // Retrieve real PNG asset for tile_moss loaded in Stage 1
        const mossTexture = assetManager.getAsset('tile_moss');

        for (const chunk of world.chunks.values()) {
            for (const tile of chunk.tiles) {
                if (tile.wx + tileSize < bounds.minX || tile.wx > bounds.maxX ||
                    tile.wy + tileSize < bounds.minY || tile.wy > bounds.maxY) {
                    continue;
                }

                const sp = camera.worldToScreen(tile.wx, tile.wy);
                const drawSize = tileSize * camera.zoom + 1; // +1 seam preventer

                if (mossTexture) {
                    // STAGE 2 SUCCESS: Drawing actual PNG texture directly from assets/sprites!
                    ctx.drawImage(mossTexture, sp.x, sp.y, drawSize, drawSize);
                } else {
                    ctx.fillStyle = '#142a14';
                    ctx.fillRect(sp.x, sp.y, drawSize, drawSize);
                }
            }
        }
    }
}
