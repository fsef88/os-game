import { Vector2 } from '../utils/Vector2.js';

export class Entity {
    constructor(x = 0, y = 0) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(0, 0);
        this.sprite = null;
        this.layer = 5; // Default object layer
        this.collision = {
            offsetX: -16,
            offsetY: -16,
            width: 32,
            height: 32
        };
        this.isSolid = true;
    }

    getColliderBounds() {
        return {
            x: this.position.x + this.collision.offsetX,
            y: this.position.y + this.collision.offsetY,
            width: this.collision.width,
            height: this.collision.height
        };
    }

    intersects(other) {
        const a = this.getColliderBounds();
        const b = typeof other.getColliderBounds === 'function' ? other.getColliderBounds() : {
            x: other.x + (other.collision ? other.collision.offsetX : 0),
            y: other.y + (other.collision ? other.collision.offsetY : 0),
            width: other.collision ? other.collision.width : 32,
            height: other.collision ? other.collision.height : 32
        };

        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    update(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
    }

    draw(ctx, camera, assetManager) {
        // Base draw implementation
    }
}
