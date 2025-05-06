const gameArea = document.getElementById('game-area');
const timerDisplay = document.getElementById('timer');
const killCountDisplay = document.getElementById('kill-count');
const muteBtn = document.getElementById('mute-btn');
const connectionStatus = document.getElementById('connection-status');
const gameoverPopup = document.getElementById('gameover-popup');
const totalKillsElement = document.getElementById('total-kills');
const playAgainBtn = document.getElementById('play-again-btn');
const startPopup = document.getElementById('start-popup');
const startGameBtn = document.getElementById('start-game-btn');

const bgMusic = document.getElementById('bg-music');
const killSound = document.getElementById('kill-sound');

let killCount = 0;
let timer = 0;
let gameInterval;
let spawnInterval = 2000; // Initial spawn interval (2 seconds)
let maxCockroaches = 1; // Start with 1 cockroach at a time
let spawnTimer;
let spawnRateIncreaseInterval = 10000; // Time interval to increase spawn rate (10 seconds)
let maxCockroachIncreaseInterval = 15000; // Time interval to increase the number of cockroaches
let isMuted = false;
let gameDuration = 30; // Set the game duration in seconds
let countdownTimer;

const cockroachAliveImg = 'images/cockroach.png';
const cockroachDeadImg = 'images/cockroach-dead.png';

// Function to set the slipper cursor
function setSlipperCursor() {
  document.body.style.cursor = "url('images/slipper-cursor.png'), auto";
}

// Function to start the game
function startGame() {
  killCount = 0;
  timer = gameDuration; // Initialize the timer with the game duration
  killCountDisplay.textContent = `Killed: ${killCount}`;
  timerDisplay.textContent = `Time: ${timer}s`;
  gameoverPopup.classList.add('hidden');

  // Set the slipper cursor
  setSlipperCursor();

  // Start the countdown timer
  countdownTimer = setInterval(() => {
    timer--;
    timerDisplay.textContent = `Time: ${timer}s`;
    if (timer <= 0) {
      clearInterval(countdownTimer);
      endGame(); // End the game when the timer reaches zero
    }
  }, 1000);

  resetSpawnSettings(); // Reset spawn settings when the game restarts
  startSpawning(); // Start spawning cockroaches
}

// Function to end the game
function endGame() {
  clearInterval(countdownTimer); // Stop the countdown timer
  clearInterval(spawnTimer); // Stop spawning cockroaches
  totalKillsElement.textContent = killCount;
  gameoverPopup.classList.remove('hidden');
  // Disable further clicks on cockroaches
  const cockroaches = document.querySelectorAll('.cockroach');
  cockroaches.forEach(c => c.style.pointerEvents = 'none');
}

// Event listener for the "Play Again" button
playAgainBtn.addEventListener('click', startGame);

// Function to spawn a cockroach
function spawnCockroach() {
  for (let i = 0; i < maxCockroaches; i++) {
    const cockroach = document.createElement('img');
    cockroach.src = cockroachAliveImg;
    cockroach.classList.add('cockroach');
    cockroach.style.top = Math.random() * (gameArea.clientHeight - 50) + 'px';
    cockroach.style.left = Math.random() * (gameArea.clientWidth - 50) + 'px';
    cockroach.dataset.alive = 'true';

    cockroach.addEventListener('click', () => {
      if (cockroach.dataset.alive === 'true') {
        cockroach.dataset.alive = 'false';
        cockroach.src = cockroachDeadImg;
        cockroach.classList.add('dead');
        killCount++;
        killCountDisplay.textContent = `Killed: ${killCount}`;
        if (!isMuted) killSound.play();
        setTimeout(() => {
          gameArea.removeChild(cockroach);
        }, 1000);
      }
    });

    gameArea.appendChild(cockroach);
  }
}

// Function to start spawning cockroaches
function startSpawning() {
  spawnTimer = setInterval(spawnCockroach, spawnInterval);

  // Gradually increase spawn rate every 10 seconds
  const spawnRateIncreaseTimer = setInterval(() => {
    if (spawnInterval > 1000) { // Minimum spawn interval is 1 second
      spawnInterval -= 200; // Decrease spawn interval by 200ms
      clearInterval(spawnTimer); // Clear the current spawn timer
      spawnTimer = setInterval(spawnCockroach, spawnInterval); // Restart with the new interval
    } else {
      clearInterval(spawnRateIncreaseTimer); // Stop adjusting spawn rate when the minimum is reached
    }
  }, spawnRateIncreaseInterval);

  // Gradually increase the number of cockroaches every 15 seconds
  const maxCockroachIncreaseTimer = setInterval(() => {
    maxCockroaches++;
  }, maxCockroachIncreaseInterval);
}

// Function to reset spawn interval and cockroach count when the game restarts
function resetSpawnSettings() {
  spawnInterval = 2000; // Reset to the initial spawn interval
  maxCockroaches = 1; // Reset to 1 cockroach at a time
}

// Function to toggle mute
function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.pause();
    muteBtn.textContent = '🔇';
  } else {
    bgMusic.play();
    muteBtn.textContent = '🔊';
  }
}

// Function to update connection status
function updateConnectionStatus() {
  if (navigator.onLine) {
    connectionStatus.textContent = '';
  } else {
    connectionStatus.textContent = 'No internet connection';
  }
}

// Event listeners for online/offline status
window.addEventListener('online', updateConnectionStatus);
window.addEventListener('offline', updateConnectionStatus);

// Event listener for mute button
muteBtn.addEventListener('click', toggleMute);

// Function to show the start popup
function showStartPopup() {
  startPopup.classList.remove('hidden');
}

// Function to hide the start popup and start the game
function startGameFromPopup() {
  startPopup.classList.add('hidden');
  startGame(); // Call the existing startGame function
}

// Event listener for the "Start Game" button
startGameBtn.addEventListener('click', startGameFromPopup);

// Show the start popup when the page loads
window.onload = () => {
  showStartPopup();
  updateConnectionStatus();
  bgMusic.volume = 0.3;
  // Try to play bgMusic on load, catch any errors (e.g. autoplay policy)
  if (!isMuted) {
    bgMusic.play().catch((error) => {
      console.log('Background music play was prevented:', error);
    });
  }

  // Add user interaction to start bgMusic if not playing due to autoplay restrictions
  const startMusicOnInteraction = () => {
    if (bgMusic.paused && !isMuted) {
      bgMusic.play().catch((error) => {
        console.log('Background music play was prevented on user interaction:', error);
      });
    }
    // Remove event listeners after first interaction
    window.removeEventListener('click', startMusicOnInteraction);
    window.removeEventListener('keydown', startMusicOnInteraction);
  };

  window.addEventListener('click', startMusicOnInteraction);
  window.addEventListener('keydown', startMusicOnInteraction);
};
