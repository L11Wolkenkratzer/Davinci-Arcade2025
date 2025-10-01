// -- src/games/pacman/pacmanTypes.ts --
export interface Player {
    _id: string;
    name: string;
    badgeId: string;
}

export type PacmanGameScreen = 'menu' | 'playing';
