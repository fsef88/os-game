export const GameStates = {
    LOADING: 'LOADING',
    MENU: 'MENU',
    GAME: 'GAME',
    PAUSE: 'PAUSE'
};

export class GameStateManager {
    constructor() {
        this.currentState = GameStates.LOADING;
    }

    setState(state) {
        if (Object.values(GameStates).includes(state)) {
            this.currentState = state;
            console.log(`Game State changed to: ${state}`);
        }
    }

    is(state) {
        return this.currentState === state;
    }
}
