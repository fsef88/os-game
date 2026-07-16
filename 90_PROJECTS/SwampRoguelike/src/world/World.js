import { Chunk } from './Chunk.js';
import { SimplexNoise } from './Noise.js';

export class World {
    constructor(seed = 1337) {
        this.seed = seed;
        this.noise = new SimplexNoise(seed);
        this.chunks = new Map(); // Key: "chunkX,chunkY" -> Chunk instance
        this.savedChunkData = new Map(); // For save/load persistence
        this.loadRadius = 2; // Load 5x5 chunks around player
    }

    getChunkKey(chunkX, chunkY) {
        return `${chunkX},${chunkY}`;
    }

    getChunk(chunkX, chunkY) {
        const key = this.getChunkKey(chunkX, chunkY);
        if (this.chunks.has(key)) {
            return this.chunks.get(key);
        }

        // Generate or restore chunk
        let chunk;
        if (this.savedChunkData.has(key)) {
            chunk = this.savedChunkData.get(key);
        } else {
            chunk = new Chunk(chunkX, chunkY, this.noise);
        }
        this.chunks.set(key, chunk);
        return chunk;
    }

    update(playerX, playerY) {
        const chunkSizeInPixels = Chunk.CHUNK_SIZE * Chunk.TILE_SIZE;
        const playerChunkX = Math.floor(playerX / chunkSizeInPixels);
        const playerChunkY = Math.floor(playerY / chunkSizeInPixels);

        const activeKeys = new Set();

        // 1. Load active chunks in radius
        for (let cy = playerChunkY - this.loadRadius; cy <= playerChunkY + this.loadRadius; cy++) {
            for (let cx = playerChunkX - this.loadRadius; cx <= playerChunkX + this.loadRadius; cx++) {
                const key = this.getChunkKey(cx, cy);
                activeKeys.add(key);
                if (!this.chunks.has(key)) {
                    this.getChunk(cx, cy);
                }
            }
        }

        // 2. Unload distant chunks from active memory (culling)
        for (const [key, chunk] of this.chunks.entries()) {
            if (!activeKeys.has(key)) {
                // Persist state before unloading
                this.savedChunkData.set(key, chunk);
                this.chunks.delete(key);
            }
        }
    }

    getNearbyObstacles(worldX, worldY, radius = 250) {
        const obstacles = [];
        for (const chunk of this.chunks.values()) {
            for (const obj of chunk.objects) {
                if (obj.collision) {
                    const dist = Math.hypot(obj.x - worldX, obj.y - worldY);
                    if (dist < radius) {
                        obstacles.push(obj);
                    }
                }
            }
        }
        return obstacles;
    }

    saveWorld() {
        const serializable = {
            seed: this.seed,
            savedChunkCount: this.savedChunkData.size
        };
        localStorage.setItem('slavic_roguelike_world_save', JSON.stringify(serializable));
        console.log('World saved to localStorage.');
    }

    loadWorld() {
        const dataStr = localStorage.getItem('slavic_roguelike_world_save');
        if (dataStr) {
            const data = JSON.parse(dataStr);
            this.seed = data.seed;
            this.noise = new SimplexNoise(this.seed);
            this.chunks.clear();
            this.savedChunkData.clear();
            console.log('World restored with seed:', this.seed);
            return true;
        }
        return false;
    }
}
