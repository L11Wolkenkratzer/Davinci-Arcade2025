// snakeApi.ts - API für Snake Highscores
const apiCall = async (url: string, options?: RequestInit) => {
  const origin5000 = window.location.origin.replace(/:5173$/, ':5000');
  const fullUrl = `${origin5000}${url}`;

  try {
    const response = await fetch(fullUrl, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Snake API Error:', error);
    throw error;
  }
};

const snakeApi = {
  // Player Stats laden
  async getPlayerStats(playerId: string) {
    try {
      console.log('🐍 Loading Snake player stats for:', playerId);

      const [playerData, scoresData] = await Promise.all([
        apiCall(`/api/players/${playerId}`),
        apiCall('/api/scores/game/snake')
      ]);

      console.log('🐍 Snake scores data:', scoresData);

      const snakeScores = scoresData.filter((score: any) =>
          score.playerId._id === playerId
      );

      const snakeHighscore = snakeScores.length > 0
          ? Math.max(...snakeScores.map((s: any) => s.score))
          : 0;

      // ✅ KUMULIERTE COINS BERECHNUNG
      const totalEarnedCoins = snakeScores.reduce((total: number, score: any) => {
        return total + Math.floor(score.score / 10); // 1 Coin pro 10 Punkte
      }, 0);

      const stats = {
        totalScore: playerData.totalScore || 0,
        gamesPlayed: playerData.gamesPlayed || 0,
        snakeHighscore,
        snakeCoins: 400 + totalEarnedCoins, // ✅ Base 400 + alle verdienten Coins
        snakeGamesPlayed: snakeScores.length
      };

      console.log('🐍 Snake player stats:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Load Snake player stats failed:', error);
      return {
        totalScore: 0,
        gamesPlayed: 0,
        snakeHighscore: 0,
        snakeCoins: 400, // ✅ Fallback auf 400
        snakeGamesPlayed: 0
      };
    }
  },

  // ✅ KORRIGIERTE HIGHSCORES (nur beste pro Spieler)
  async getHighscores(limit = 10) {
    try {
      console.log('🐍 Loading Snake highscores...');
      const data = await apiCall('/api/scores/game/snake');
      console.log('🐍 Raw snake scores:', data);

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

      console.log('🐍 Filtered unique snake highscores:', uniqueHighscores);
      return uniqueHighscores;

    } catch (error) {
      console.error('❌ Error loading Snake highscores:', error);
      return [];
    }
  },

  // Score direkt submittieren
  async submitScore(playerId: string, score: number, level: number, duration: number) {
    try {
      console.log('🐍 Submitting Snake score...', { playerId, score, level, duration });

      const response = await apiCall('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId,
          gameName: 'snake', // ✅ WICHTIG: 'snake'
          score,
          level,
          duration
        })
      });

      console.log('✅ Snake score submitted successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Error submitting Snake score:', error);
      throw error;
    }
  }
};

export default snakeApi;
