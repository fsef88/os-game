export class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loadedCount = 0;
        this.totalCount = 5;
        this.isReady = false;

        // 5 Test Assets explicit registry
        // Keys reflect actual verified content, not the original (mismatched) labels.
        this.testManifest = {
            "portrait_warrior_NOT_A_TILE": "assets/sprites/1784063748840-019f627c-0b37-7fbb-97fa-922de3e45ebc.png",
            "icon_sheet_skills_NOT_A_PLAYER": "assets/sprites/1784135845972-019f66c7-b076-7811-9e3f-ad947049df17.png",
            "tile_ground_moss": "assets/sprites/1784180938147-019f6976-8969-73e8-8699-5ad39f8b5233.jpeg",
            "tileset_swamp_shore_sheet": "assets/sprites/1784188674960-019f69ee-8233-7500-b88b-a6e23f0b9573.jpeg",
            "tileset_swamp_props_sheet": "assets/sprites/1784188824060-019f69f0-c58c-75a7-a71f-315bafae0489.jpeg"
        };
    }

    async loadTestAssets() {
        const entries = Object.entries(this.testManifest);
        this.totalCount = entries.length;
        this.loadedCount = 0;

        const promises = entries.map(([id, url]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    this.assets.set(id, img);
                    this.loadedCount++;
                    console.log(`[AssetManager] Loaded test asset [${this.loadedCount}/${this.totalCount}]: ${id}`);
                    resolve(true);
                };
                img.onerror = () => {
                    console.warn(`[AssetManager] Error loading: ${url}`);
                    resolve(false);
                };
                img.src = url;
            });
        });

        await Promise.all(promises);
        this.isReady = true;
        console.log(`[AssetManager] Stage 1 complete! Total loaded: ${this.assets.size}/${this.totalCount}`);
        return this.isReady;
    }

    getAsset(id) {
        return this.assets.get(id);
    }
}
