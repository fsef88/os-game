import { AutoTiler } from '../world/AutoTiler.js';

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

    // Picks the real texture for a tile based on its AutoTiler-classified type,
    // and whether it borders water (shore transition band).
    pickTexture(tile, assetManager) {
        if (tile.type === AutoTiler.TILE_TYPES.TOXIC_WATER) {
            return assetManager.getAsset('tile_toxic_water');
        }
        if (tile.type === AutoTiler.TILE_TYPES.SWAMP) {
            return assetManager.getAsset('tile_swamp_water');
        }
        if (tile.nearWater) {
            return assetManager.getAsset('tile_shore_transition');
        }
        if (tile.type === AutoTiler.TILE_TYPES.MUD) {
            return assetManager.getAsset('tile_mud_ground');
        }
        // MOSS / DIRT / STONE fall back to the verified Stage 1/2 ground texture -
        // distinct art for those is Stage 4 scope (rocks/decoration pass).
        return assetManager.getAsset('tile_ground_moss');
    }

    renderGroundLayer(world, camera, assetManager, bounds) {
        const ctx = this.ctx;
        const tileSize = 64;

        for (const chunk of world.chunks.values()) {
            for (const tile of chunk.tiles) {
                if (tile.worldX + tileSize < bounds.minX || tile.worldX > bounds.maxX ||
                    tile.worldY + tileSize < bounds.minY || tile.worldY > bounds.maxY) {
                    continue;
                }

                const texture = this.pickTexture(tile, assetManager);
                if (!texture) continue; // No fallback fill/color - only real pixels are drawn.

                this.drawSeamlessTile(ctx, texture, tile.worldX, tile.worldY, tileSize, camera);
            }
        }
    }

    // Samples a real, non-squished tileSize x tileSize crop of `texture` for the given
    // world tile, using mirrored-repeat wrapping (like GL_MIRRORED_REPEAT) so the texture
    // - which wasn't authored as a seamless tile - still repeats with no visible seam at
    // any pan/zoom. Requires texture dimensions to be an exact multiple of tileSize.
    drawSeamlessTile(ctx, texture, worldX, worldY, tileSize, camera) {
        const texSize = texture.naturalWidth;
        const sp = camera.worldToScreen(worldX, worldY);
        const drawSize = tileSize * camera.zoom + 1; // +1 seam preventer for subpixel gaps

        const blockX = Math.floor(worldX / texSize);
        const blockY = Math.floor(worldY / texSize);
        const localX = worldX - blockX * texSize;
        const localY = worldY - blockY * texSize;
        const mirrorX = (((blockX % 2) + 2) % 2) === 1;
        const mirrorY = (((blockY % 2) + 2) % 2) === 1;
        const sx = mirrorX ? (texSize - tileSize - localX) : localX;
        const sy = mirrorY ? (texSize - tileSize - localY) : localY;

        if (!mirrorX && !mirrorY) {
            ctx.drawImage(texture, sx, sy, tileSize, tileSize, sp.x, sp.y, drawSize, drawSize);
        } else {
            ctx.save();
            ctx.translate(sp.x + drawSize / 2, sp.y + drawSize / 2);
            ctx.scale(mirrorX ? -1 : 1, mirrorY ? -1 : 1);
            ctx.drawImage(texture, sx, sy, tileSize, tileSize, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            ctx.restore();
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
            ctx.fillText('type: ' + tile.type + '  bitmask: ' + tile.bitmask + '  nearWater: ' + tile.nearWater, 20, 84);
        }
        ctx.fillText('(F2: AutoTile-driven texture selection, Stage 3)', 20, 98);
    }
}
