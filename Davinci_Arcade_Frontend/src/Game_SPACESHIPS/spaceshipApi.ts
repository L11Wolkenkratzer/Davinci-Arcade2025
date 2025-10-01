// spaceshipApi.ts - API für SpaceShips Highscores
const apiCall = async (url: string, options?: RequestInit) => {
    const origin5000 = window.location.origin.replace(/:5173$/, ':5000');
    const fullUrl = `${origin5000}${url}`;

    try {
        const response = await fetch(fullUrl, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Spaceship API Error:', error);
        throw error;
    }
};

const spaceshipApi = {
    async getPlayerStats(playerId: string) {
        // ... bleibt unverändert
        try {
            const [playerData, scoresData] = await Promise.all([
                apiCall(`/api/players/${playerId}`),
                apiCall('/api/scores/game/spaceships')
            ]);

            const spaceshipScores = scoresData.filter((score: any) =>
                score.playerId._id === playerId
            );

            const spaceshipHighscore = spaceshipScores.length > 0
                ? Math.max(...spaceshipScores.map((s: any) => s.score))
                : 0;

            const totalEarnedCoins = spaceshipScores.reduce((total: number, score: any) => {
                return total + Math.floor(score.score / 10);
            }, 0);

            return {
                totalScore: playerData.totalScore || 0,
                gamesPlayed: playerData.gamesPlayed || 0,
                spaceshipHighscore,
                spaceshipCoins: 400 + totalEarnedCoins,
                spaceshipGamesPlayed: spaceshipScores.length
            };
        } catch (error) {
            console.error('Load Spaceship player stats failed:', error);
            return {
                totalScore: 0,
                gamesPlayed: 0,
                spaceshipHighscore: 0,
                spaceshipCoins: 400,
                spaceshipGamesPlayed: 0
            };
        }
    },

    // ✅ NUR DIESE FUNKTION ERSETZEN:
    async getHighscores(limit = 10) {
        try {
            console.log('🚀 Loading Spaceship highscores...');
            const data = await apiCall('/api/scores/game/spaceships');
            console.log('🚀 Raw spaceship scores:', data);

            // ✅ FILTER: Nur bester Score pro Spieler
            const bestScoresPerPlayer = new Map<string, any>();

            data.forEach((score: any) => {
                const playerId = score.playerId._id;
                const existingBest = bestScoresPerPlayer.get(playerId);

                // Wenn kein Score für diesen Spieler existiert ODER neuer Score ist besser
                if (!existingBest || score.score > existingBest.score) {
                    bestScoresPerPlayer.set(playerId, score);
                }
            });

            // ✅ Konvertiere Map zu Array und sortiere nach Score (absteigend)
            const uniqueHighscores = Array.from(bestScoresPerPlayer.values())
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

            console.log('🚀 Filtered unique highscores:', uniqueHighscores);
            return uniqueHighscores;

        } catch (error) {
            console.error('❌ Error loading Spaceship highscores:', error);
            return [];
        }
    },

    async submitScore(playerId: string, score: number, level: number, duration: number) {
        try {
            // ✅ WICHTIG: /api/highscores/submit verwendet, die BEIDES macht:
            // 1. Score Collection Entry
            // 2. Player.gameHighscores Update
            const response = await apiCall('/api/highscores/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId,
                    gameName: 'spaceships',
                    score,
                    level,
                    duration
                })
            });

            return response;
        } catch (error) {
            console.error('Error submitting Spaceship score:', error);
            throw error;
        }
    }
};

export default spaceshipApi;
