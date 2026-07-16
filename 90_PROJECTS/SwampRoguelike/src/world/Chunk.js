import { AutoTiler } from './AutoTiler.js';

export class Chunk {
    static CHUNK_SIZE = 32; // 32x32 tiles
    static TILE_SIZE = 64;  # 64x64 pixels

    constructor(chunkX, chunkY, noise) {
        this.chunkX = chunkX;
        this.chunkY = chunkY;
        this.tiles = [];
        this.objects = [];
        this.isLoaded = true;

        this.generate(noise);
    }

    generate(noise) {
        const chunkSize = Chunk.CHUNK_SIZE;
        const tileSize = Chunk.TILE_SIZE;

        this.tiles = new Array(chunkSize * chunkSize);

        const worldStartX = this.chunkX * chunkSize;
        const worldStartY = this.chunkY * chunkSize;

        // 1. Generate ground & water tile grid
        for (let ly = 0; ly < chunkSize; ly++) {
            for (let lx = 0; lx < chunkSize; lx++) {
                const wx = worldStartX + lx;
                const wy = worldStartY + ly;

                // Multi-octave terrain noise
                const eNoise = noise.noise2D(wx * 0.03, wy * 0.03);
                const mNoise = noise.noise2D(wx * 0.08 + 100, wy * 0.08 + 100);
                const rNoise = noise.noise2D(wx * 0.15 + 500, wy * 0.15 + 500);

                let type = AutoTiler.TILE_TYPES.MOSS;

                if (eNoise < -0.35) {
                    type = AutoTiler.TILE_TYPES.TOXIC_WATER;
                } else if (eNoise < -0.15) {
                    type = AutoTiler.TILE_TYPES.SWAMP;
                } else if (mNoise > 0.3) {
                    type = AutoTiler.TILE_TYPES.MUD;
                } else if (rNoise > 0.4) {
                    type = AutoTiler.TILE_TYPES.DIRT;
                } else if (rNoise < -0.5) {
                    type = AutoTiler.TILE_TYPES.STONE;
                }

                this.tiles[ly * chunkSize + lx] = {
                    type: type,
                    worldX: wx * tileSize,
                    worldY: wy * tileSize,
                    lx: lx,
                    ly: ly
                };
            }
        }

        // Helper to query neighboring tiles for autotiling
        const getTileType = (lx, ly) => {
            if (lx >= 0 && lx < chunkSize && ly >= 0 && ly < chunkSize) {
                return this.tiles[ly * chunkSize + lx].type;
            }
            return AutoTiler.TILE_TYPES.MOSS;
        };

        // 2. Autotile calculation
        for (let ly = 0; ly < chunkSize; ly++) {
            for (let lx = 0; lx < chunkSize; lx++) {
                const tile = this.tiles[ly * chunkSize + lx];
                const neighbors = AutoTiler.getNeighborMask(this.tiles, lx, ly, getTileType);
                tile.bitmask = AutoTiler.calculateBitmask(neighbors, tile.type);
            }
        }

        // 3. Procedurally populate large objects (Trees, Rocks) and small decorations
        for (let ly = 0; ly < chunkSize; ly += 2) {
            for (let lx = 0; lx < chunkSize; lx += 2) {
                const wx = worldStartX + lx;
                const wy = worldStartY + ly;
                const tile = this.tiles[ly * chunkSize + lx];

                // Skip placing solid objects in deep toxic water
                if (tile.type === AutoTiler.TILE_TYPES.TOXIC_WATER) continue;

                const objNoise = noise.noise2D(wx * 0.2 + 200, wy * 0.2 + 200);
                const decNoise = noise.noise2D(wx * 0.4 + 300, wy * 0.4 + 300);

                const posX = (wx + 0.5) * tileSize;
                const posY = (wy + 0.5) * tileSize;

                if (objNoise > 0.55) {
                    // Place Tree obstacle
                    const treeVariant = Math.abs(Math.floor(objNoise * 10)) % 4;
                    this.objects.push({
                        type: 'tree',
                        variant: treeVariant,
                        x: posX,
                        y: posY,
                        width: 120,
                        height: 180,
                        collision: { offsetX: -30, offsetY: 40, width: 60, height: 40 }
                    });
                } else if (objNoise < -0.6) {
                    // Place Rock obstacle
                    const rockVariant = Math.abs(Math.floor(objNoise * 10)) % 2;
                    this.objects.push({
                        type: 'rock',
                        variant: rockVariant,
                        x: posX,
                        y: posY,
                        width: 90,
                        height: 90,
                        collision: { offsetX: -35, offsetY: -10, width: 70, height: 50 }
                    });
                } else if (decNoise > 0.45) {
                    // Place Small Decoration (grass tufts, mushrooms, roots)
                    const decVariant = Math.abs(Math.floor(decNoise * 10)) % 2;
                    this.objects.push({
                        type: 'decoration',
                        variant: decVariant,
                        x: posX,
                        y: posY,
                        width: 64,
                        height: 64,
                        collision: null
                    });
                }
            }
        }
    }
}
