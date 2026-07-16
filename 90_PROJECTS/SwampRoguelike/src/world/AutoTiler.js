export class AutoTiler {
    static TILE_TYPES = {
        MOSS: 'moss',
        DIRT: 'dirt',
        MUD: 'mud',
        SWAMP: 'swamp',
        TOXIC_WATER: 'toxic_water',
        STONE: 'stone'
    };

    /**
     * Determines autotiling tile variant based on 8 neighboring tiles:
     * N, S, E, W, NE, NW, SE, SW
     */
    static getNeighborMask(grid, localX, localY, getTileType) {
        const neighbors = {
            N:  getTileType(localX, localY - 1),
            S:  getTileType(localX, localY + 1),
            E:  getTileType(localX + 1, localY),
            W:  getTileType(localX - 1, localY),
            NE: getTileType(localX + 1, localY - 1),
            NW: getTileType(localX - 1, localY - 1),
            SE: getTileType(localX + 1, localY + 1),
            SW: getTileType(localX - 1, localY + 1)
        };
        return neighbors;
    }

    /**
     * Calculates 8-bit neighbor bitmask for border selection
     */
    static calculateBitmask(neighbors, currentType) {
        let mask = 0;
        if (neighbors.N === currentType)  mask |= 1;   // Top
        if (neighbors.E === currentType)  mask |= 2;   // Right
        if (neighbors.S === currentType)  mask |= 4;   // Bottom
        if (neighbors.W === currentType)  mask |= 8;   // Left
        if (neighbors.NE === currentType) mask |= 16;  // Top-Right
        if (neighbors.NW === currentType) mask |= 32;  // Top-Left
        if (neighbors.SE === currentType) mask |= 64;  // Bottom-Right
        if (neighbors.SW === currentType) mask |= 128; // Bottom-Left
        return mask;
    }
}
