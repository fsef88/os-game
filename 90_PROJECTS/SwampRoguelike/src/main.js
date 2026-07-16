import { Game } from './engine/Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
    game.init().catch(err => {
        console.error('Failed to initialize game engine:', err);
    });
});
