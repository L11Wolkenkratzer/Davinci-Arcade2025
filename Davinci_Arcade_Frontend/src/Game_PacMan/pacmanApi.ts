// pacmanApi.ts - API für Pacman Highscores
const apiCall = async (url: string, options?: RequestInit) => {
    const origin5000 = window.location.origin.replace(/:5173$/, ':5000');
    const fullUrl = `${origin5000}${url}`;

    try {
        const response = await fetch(fullUrl, options);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Pacman API Error:', error);
        throw error;
    }
};

const pacmanApi = {
    // Player Stats laden
    async getPlayerStats(playerId: string) {
        try {
            console.log('🟡 Loading Pacman player stats for:', playerId);

            const [playerData, scoresData] = await Promise.all([
                apiCall(`/api/players/${playerId}`),
                apiCall('/api/scores/game/pacman')
            ]);

            console.log('🟡 Pacman scores data:', scoresData);

            const pacmanScores = scoresData.filter((score: any) =>
                score.playerId._id === playerId
            );

            const pacmanHighscore = pacmanScores.length > 0
                ? Math.max(...pacmanScores.map((s: any) => s.score))
                : 0;

            // ✅ KUMULIERTE COINS BERECHNUNG
            const totalEarnedCoins = pacmanScores.reduce((total: number, score: any) => {
                return total + Math.floor(score.score / 20); // 1 Coin pro 20 Punkte (Pacman hat höhere Scores)
            }, 0);

            const stats = {
                totalScore: playerData.totalScore || 0,
                gamesPlayed: playerData.gamesPlayed || 0,
                pacmanHighscore,
                pacmanCoins: 400 + totalEarnedCoins, // ✅ Base 400 + alle verdienten Coins
                pacmanGamesPlayed: pacmanScores.length
            };

            console.log('🟡 Pacman player stats:', stats);
            return stats;

        } catch (error) {
            console.error('❌ Load Pacman player stats failed:', error);
            return {
                totalScore: 0,
                gamesPlayed: 0,
                pacmanHighscore: 0,
                pacmanCoins: 400, // ✅ Fallback auf 400
                pacmanGamesPlayed: 0
            };
        }
    },

    // ✅ HIGHSCORES (nur beste pro Spieler)
    async getHighscores(limit = 10) {
        try {
            console.log('🟡 Loading Pacman highscores...');
            const data = await apiCall('/api/scores/game/pacman');
            console.log('🟡 Raw pacman scores:', data);

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

            console.log('🟡 Filtered unique pacman highscores:', uniqueHighscores);
            return uniqueHighscores;

        } catch (error) {
            console.error('❌ Error loading Pacman highscores:', error);
            return [];
        }
    },

    // Score direkt submittieren
    async submitScore(playerId: string, score: number, level: number, duration: number) {
        try {
            console.log('🟡 Submitting Pacman score...', { playerId, score, level, duration });

            const response = await apiCall('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerId,
                    gameName: 'pacman', // ✅ WICHTIG: 'pacman'
                    score,
                    level,
                    duration
                })
            });

            console.log('✅ Pacman score submitted successfully:', response);
            return response;
        } catch (error) {
            console.error('❌ Error submitting Pacman score:', error);
            throw error;
        }
    }
};

export default pacmanApi;
