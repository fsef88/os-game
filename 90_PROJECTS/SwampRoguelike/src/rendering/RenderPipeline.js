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

        this.renderGroundLayer(world, camera, assetManager, bounds);

        // Player has no verified real sprite yet (Stage 5 scope) - draw nothing
        // rather than a placeholder shape.
        player.draw(ctx, camera, assetManager);

        // Debug Overlay
        if (input && input.debugKeys && input.debugKeys.f1) {
            ctx.fillStyle = 'rgba(0,0,0,0.85)';
            ctx.fillRect(10, 10, 130, 32);
            ctx.fillStyle = '#22c55e';
            ctx.font = 'bold 14px monospace';
            ctx.fillText('FPS: ' + Math.round(fps), 20, 31);
        }

        if (input && input.debugKeys && input.debugKeys.f2) {
            this.renderAutoTileDebug(world, player, ctx);
        }
    }

    renderGroundLayer(world, camera, assetManager, bounds) {
        const ctx = this.ctx;
        const tileSize = 64;

        // Real ground texture verified in Stage 1: seamless swamp/moss ground, 2048x2048.
        const groundTexture = assetManager.getAsset('tile_ground_moss');

        if (!groundTexture) return; // No fallback fill/color - only real pixels are drawn.

        const texSize = groundTexture.naturalWidth; // 2048, an exact multiple of tileSize

        for (const chunk of world.chunks.values()) {
            for (const tile of chunk.tiles) {
                if (tile.worldX + tileSize < bounds.minX || tile.worldX > bounds.maxX ||
                    tile.worldY + tileSize < bounds.minY || tile.worldY > bounds.maxY) {
                    continue;
                }

                const sp = camera.worldToScreen(tile.worldX, tile.worldY);
                const drawSize = tileSize * camera.zoom + 1; // +1 seam preventer for subpixel gaps

                // The source texture (2048x2048) repeats every texSize world-pixels. A plain
                // wrap would leave a hard seam every repeat because the image's own edges
                // don't match. Mirroring alternate blocks (like GL_MIRRORED_REPEAT) makes
                // every block boundary share the same edge pixels, so the real texture tiles
                // with no visible seam at any zoom/pan, using only real sampled pixels.
                const blockX = Math.floor(tile.worldX / texSize);
                const blockY = Math.floor(tile.worldY / texSize);
                const localX = tile.worldX - blockX * texSize;
                const localY = tile.worldY - blockY * texSize;
                const mirrorX = (((blockX % 2) + 2) % 2) === 1;
                const mirrorY = (((blockY % 2) + 2) % 2) === 1;
                const sx = mirrorX ? (texSize - tileSize - localX) : localX;
                const sy = mirrorY ? (texSize - tileSize - localY) : localY;

                if (!mirrorX && !mirrorY) {
                    ctx.drawImage(groundTexture, sx, sy, tileSize, tileSize, sp.x, sp.y, drawSize, drawSize);
                } else {
                    ctx.save();
                    ctx.translate(sp.x + drawSize / 2, sp.y + drawSize / 2);
                    ctx.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1);
                    ctx.drawImage(groundTexture, sx, sy, tileSize, tileSize, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
                    ctx.restore();
                }
            }
        }
    }

    renderAutoTileDebug(world, player, ctx) {
        const tileSize = 64;
        const tx = Math.floor(player.position.x / tileSize);
        const ty = Math.floor(player.position.y / tileSize);
        const chunkSize = 32;
        const cx = Math.floor(tx / chunkSize);
        const cy = Math.floor(ty / chunkSize);
        const chunk = world.chunks.get(`${cx},${cy}`);

        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.fillRect(10, 48, 300, 56);
        ctx.fillStyle = '#3b82f6';
        ctx.font = '12px monospace';
        ctx.fillText('World tile: ' + tx + ',' + ty, 20, 66);

        if (chunk) {
            const lx = ((tx % chunkSize) + chunkSize) % chunkSize;
            const ly = ((ty % chunkSize) + chunkSize) % chunkSize;
            const tile = chunk.tiles[ly * chunkSize + lx];
            ctx.fillText('AutoTile type: ' + tile.type + '  bitmask: ' + tile.bitmask, 20, 84);
        }
        ctx.fillText('(F2 debug: proves AutoTiler runs; Stage 3 adds real', 20, 98);
    }
}
