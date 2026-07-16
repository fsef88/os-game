import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(x = 0, y = 0) {
        super(x, y);

        this.maxSpeed = 280;      // Pixels per second
        this.acceleration = 1800;  // Acceleration rate
        this.friction = 0.85;      // Damping / friction factor
        this.layer = 6;            // Characters layer

        this.collision = {
            offsetX: -20,
            offsetY: 10,
            width: 40,
            height: 25
        };

        this.facingDirection = 'down'; // 'up', 'down', 'left', 'right'
        this.animFrame = 0;
        this.animTimer = 0;
    }

    handleInput(input) {
        const move = input.getMovementVector();

        if (move.x !== 0 || move.y !== 0) {
            this.velocity.x += move.x * this.acceleration * (1 / 60);
            this.velocity.y += move.y * this.acceleration * (1 / 60);

            // Clamp max speed
            const speed = Math.hypot(this.velocity.x, this.velocity.y);
            if (speed > this.maxSpeed) {
                this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
                this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
            }

            // Update facing direction
            if (Math.abs(move.x) > Math.abs(move.y)) {
                this.facingDirection = move.x > 0 ? 'right' : 'left';
            } else {
                this.facingDirection = move.y > 0 ? 'down' : 'up';
            }
        }
    }

    update(dt, world) {
        // Apply friction
        this.velocity.x *= Math.pow(this.friction, dt * 60);
        this.velocity.y *= Math.pow(this.friction, dt * 60);

        // Separate X and Y movement for smooth sliding against collisions
        const newX = this.position.x + this.velocity.x * dt;
        const newY = this.position.y + this.velocity.y * dt;

        // X movement check
        this.position.x = newX;
        let nearby = world.getNearbyObstacles(this.position.x, this.position.y);
        for (const obs of nearby) {
            if (this.intersects(obs)) {
                this.position.x -= this.velocity.x * dt;
                this.velocity.x = 0;
                break;
            }
        }

        // Y movement check
        this.position.y = newY;
        nearby = world.getNearbyObstacles(this.position.x, this.position.y);
        for (const obs of nearby) {
            if (this.intersects(obs)) {
                this.position.y -= this.velocity.y * dt;
                this.velocity.y = 0;
                break;
            }
        }

        // Animation update
        const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
        if (currentSpeed > 20) {
            this.animTimer += dt;
            if (this.animTimer > 0.12) {
                this.animTimer = 0;
                this.animFrame = (this.animFrame + 1) % 4;
            }
        } else {
            this.animFrame = 0;
        }
    }

    draw(ctx, camera, assetManager) {
        // No verified real player sprite yet (Stage 5 scope adds animated character art).
        // Intentionally draw nothing rather than a placeholder shape - the player
        // remains a controllable camera-focus point until real art is wired in.
        const playerImg = assetManager.getAsset('player');
        if (!playerImg) return;

        const screenPos = camera.worldToScreen(this.position.x, this.position.y);
        const drawW = 96 * camera.zoom;
        const drawH = 128 * camera.zoom;

        ctx.save();
        if (this.facingDirection === 'left') {
            ctx.translate(screenPos.x, screenPos.y);
            ctx.scale(-1, 1);
            ctx.drawImage(playerImg, -drawW / 2, -drawH + 20, drawW, drawH);
        } else {
            ctx.drawImage(playerImg, screenPos.x - drawW / 2, screenPos.y - drawH + 20, drawW, drawH);
        }
        ctx.restore();
    }
}
