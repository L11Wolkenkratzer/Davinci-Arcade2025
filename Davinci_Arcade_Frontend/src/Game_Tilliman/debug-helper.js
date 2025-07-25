// Debug Helper für Tilliman currentPlayer Probleme
// Diese Funktion kann direkt in der Browser-Konsole ausgeführt werden

window.debugTilliman = function() {
  console.log('🔍 TILLIMAN DEBUG HELPER STARTED');
  console.log('================================');
  
  // 1. Check localStorage
  console.log('\n📦 LOCAL STORAGE CHECK:');
  const currentPlayer = localStorage.getItem('currentPlayer');
  const badgeId = localStorage.getItem('playerBadgeId');
  const playerName = localStorage.getItem('playerName');
  
  console.log('currentPlayer:', currentPlayer ? JSON.parse(currentPlayer) : 'NULL');
  console.log('playerBadgeId:', badgeId || 'NULL');
  console.log('playerName:', playerName || 'NULL');
  
  // 2. Check URL and route
  console.log('\n🌐 ROUTE CHECK:');
  console.log('Current URL:', window.location.href);
  console.log('Current pathname:', window.location.pathname);
  console.log('Current search:', window.location.search);
  
  // 3. Check if API is reachable
  console.log('\n🔗 API CHECK:');
  
  if (badgeId) {
    fetch(`http://localhost:5000/api/players/badge/${badgeId}`)
      .then(response => {
        console.log('Player API status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('✅ Player data from API:', data);
        
        // Test Tilli profile
        return fetch(`http://localhost:5000/api/players/badge/${badgeId}/tilli`);
      })
      .then(response => {
        console.log('Tilli API status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('✅ Tilli profile from API:', data);
      })
      .catch(error => {
        console.error('❌ API Error:', error);
      });
  } else {
    console.log('⚠️ No badgeId in localStorage - cannot test API');
  }
  
  // 4. React DevTools check
  console.log('\n⚛️ REACT COMPONENT CHECK:');
  if (window.React) {
    console.log('✅ React available');
  } else {
    console.log('❌ React not found');
  }
  
  // 5. Navigation state check
  console.log('\n🧭 NAVIGATION STATE:');
  if (window.history && window.history.state) {
    console.log('History state:', window.history.state);
  } else {
    console.log('No history state available');
  }
  
  // 6. Provide solutions
  console.log('\n🔧 MÖGLICHE LÖSUNGEN:');
  console.log('1. Wenn currentPlayer NULL ist:');
  console.log('   → Gehe zu /login und melde dich erneut an');
  console.log('2. Wenn API Error auftritt:');
  console.log('   → Überprüfe ob Backend läuft (localhost:5000)');
  console.log('3. Wenn alles OK aussieht aber trotzdem Fehler:');
  console.log('   → Führe debugTilliman.fix() aus');
  
  return {
    currentPlayer: currentPlayer ? JSON.parse(currentPlayer) : null,
    badgeId: badgeId,
    playerName: playerName,
    url: window.location.href
  };
};

// Fix-Funktion für häufige Probleme
window.debugTilliman.fix = function() {
  console.log('🛠️ ATTEMPTING AUTOMATIC FIX...');
  
  const currentPlayer = localStorage.getItem('currentPlayer');
  if (currentPlayer) {
    try {
      const player = JSON.parse(currentPlayer);
      console.log('✅ Re-syncing player data...');
      
      localStorage.setItem('playerBadgeId', player.badgeId);
      localStorage.setItem('playerName', player.name);
      
      console.log('✅ localStorage re-synchronized');
      console.log('🔄 Please refresh the page and try again');
      
      return true;
    } catch (error) {
      console.error('❌ Fix failed:', error);
      return false;
    }
  } else {
    console.log('❌ No currentPlayer data to fix');
    console.log('👉 Please go to /login and log in again');
    return false;
  }
};

// Auto-run beim Laden
console.log('🎮 Tilliman Debug Helper loaded!');
console.log('👉 Run debugTilliman() to check your current state');
console.log('👉 Run debugTilliman.fix() to attempt automatic fixes'); 