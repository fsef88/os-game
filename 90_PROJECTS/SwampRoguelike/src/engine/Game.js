import { AssetManager } from './AssetManager.js';
import { Camera } from './Camera.js';
import { InputHandler } from './InputHandler.js';
import { GameStateManager, GameStates } from './GameState.js';
import { World } from '../world/World.js';
import { Player } from '../entities/Player.js';
import { RenderPipeline } from '../rendering/RenderPipeline.js';

export class Game {
    constructor(canvasId = 'gameCanvas') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.assetManager = new AssetManager();
        this.input = new InputHandler();
        this.camera = new Camera(window.innerWidth, window.innerHeight);
        this.state = new GameStateManager();

        this.world = null;
        this.player = null;
        this.renderPipeline = null;

        this.lastTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        this.fpsTimer = 0;

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.camera.resize(this.canvas.width, this.canvas.height);
    }

    async init() {
        this.state.setState(GameStates.LOADING);

        // Preload assets via manifest
        await this.assetManager.loadManifest('assets.json');

        // Create World & Player
        this.world = new World(1337);
        this.player = new Player(0, 0);
        this.camera.setTarget(this.player);

        this.renderPipeline = new RenderPipeline(this.canvas, this.ctx);

        this.state.setState(GameStates.GAME);

        // Start main game loop
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(currentTime) {
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Clamp max frame time
        this.lastTime = currentTime;

        // Calculate FPS
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 0.5) {
            this.fps = this.frameCount / this.fpsTimer;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        if (this.state.is(GameStates.GAME)) {
            this.update(dt);
            this.render();
        }

        requestAnimationFrame((time) => this.loop(time));
    }

    update(dt) {
        this.player.handleInput(this.input);
        this.player.update(dt, this.world);

        // Update world chunks around player
        this.world.update(this.player.position.x, this.player.position.y);

        // Update camera position & zoom (mouse wheel controlled, Stage 2 scaling)
        this.camera.setZoom(this.input.zoom);
        this.camera.update(dt);
    }

    render() {
        this.renderPipeline.render(
            this.world,
            this.player,
            this.camera,
            this.assetManager,
            this.input,
            this.fps
        );
    }
}
