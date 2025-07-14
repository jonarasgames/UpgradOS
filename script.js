// script.js completo atualizado

let points = parseInt(localStorage.getItem("points")) || 0;
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || {};
let firstInteraction = false;

const pointsDisplay = document.getElementById("points");
const wallpaper = document.getElementById("wallpaper");
const startButton = document.getElementById("startButton");
const taskbarApps = document.getElementById("taskbarApps");
const notifications = document.getElementById("notifications");
const windowsContainer = document.getElementById("windowsContainer");

const clickSound = document.getElementById("clickSound");
const errorSound = document.getElementById("errorSound");
const notifySound = document.getElementById("notifySound");
const bootSound = document.getElementById("bootSound");

const musicFiles = [
  "sounds/music/song1.mp3",
  "sounds/music/song2.mp3",
  "sounds/music/song3.mp3"
];
const musicNames = ["Música 1", "Música 2", "Música 3"];

window.addEventListener("click", () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound("boot");
  }
});

window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("bootScreen").style.display = "none";
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
    updateClock();
  }, 3100);
});

function playSound(type) {
  try {
    if (type === "click") clickSound.play();
    else if (type === "error") errorSound.play();
    else if (type === "notify") notifySound.play();
    else if (type === "boot") bootSound.play();
  } catch (e) {}
}

function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

function updateClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
}

function updateCursorContext(context) {
  document.body.classList.remove("custom-cursor-default", "custom-cursor-grab", "custom-cursor-pointer");

  if (getUpgradeLevel("cursor") === 0) return;

  if (context === "grab") {
    document.body.classList.add("custom-cursor-grab");
  } else if (context === "pointer") {
    document.body.classList.add("custom-cursor-pointer");
  } else {
    document.body.classList.add("custom-cursor-default");
  }
}

function makeDraggable(win, header) {
  let dragging = false, offsetX, offsetY;

  header.style.cursor = "grab";

  header.addEventListener("mousedown", e => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    updateCursorContext("grab");
  });

  document.addEventListener("mouseup", () => {
    if (dragging) {
      dragging = false;
      updateCursorContext("default");
    }
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  win.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("mouseenter", () => updateCursorContext("pointer"));
    btn.addEventListener("mouseleave", () => updateCursorContext("default"));
  });
}

function updateUI() {
  pointsDisplay.textContent = points;
  updateVisualUpgrades();
  updateTaskbarIcons();
  updateUpgradesButtons();
}

function updateVisualUpgrades() {
  const wallLevel = getUpgradeLevel("wallpaper");
  if (wallLevel >= 1) {
    wallpaper.style.backgroundImage = `url('https://wallpapercave.com/wp/wp2708044.jpg')`;
  } else {
    wallpaper.style.backgroundImage = "";
  }

  const blurLevel = getUpgradeLevel("blur");
  const windows = document.querySelectorAll(".window");
  windows.forEach(w => {
    if (blurLevel >= 1) w.classList.add("blur");
    else w.classList.remove("blur");
  });

  const cursorLevel = getUpgradeLevel("cursor");
  if (cursorLevel >= 1) {
    updateCursorContext("default");
  } else {
    document.body.classList.remove("custom-cursor-default", "custom-cursor-grab", "custom-cursor-pointer");
  }
}

function getUpgradeLevel(key) {
  return upgrades[key] || 0;
}

const appsData = {
  earn: {
    title: "Ganhar Pontos",
    icon: "💾",
    content: `<button id="earnPointsBtn" class="upgrade">Clique para ganhar pontos</button>`
  },
  store: {
    title: "Loja de Upgrades",
    icon: "🛒",
    content: `<div class="store-list"></div>`
  },
  notepad: {
    title: "Notepad",
    icon: "📝",
    content: `<textarea rows="10" style="width:100%; resize:none;">Escreva algo aqui...</textarea>`
  },
  winamp: {
    title: "Winamp",
    icon: "🎵",
    content: `<div class="music-player">
      <div class="music-list"></div>
      <div class="music-controls">
        <button id="prevBtn">⏮</button>
        <button id="playPauseBtn">▶️</button>
        <button id="nextBtn">⏭</button>
      </div>
      <div id="currentTrack" style="text-align:center;"></div>
    </div>`
  },
  bet: {
    title: "Aposte seus Pontos",
    icon: "🎲",
    content: `
      <div style="display:flex; flex-direction: column; gap: 10px;">
        <label>Quantos pontos quer apostar?</label>
        <input type="number" id="betAmount" min="1" max="1000" style="padding:5px; border-radius:4px; border:none;"/>
        <button id="betBtn" class="upgrade">Fazer aposta</button>
        <div id="betResult" style="margin-top:10px; font-weight:bold;"></div>
        <canvas id="betGameCanvas" width="320" height="150" style="border:1px solid #0078d7; border-radius:4px; background:#111; display:none; margin-top:10px;"></canvas>
      </div>`
  }
};

const allUpgrades = {
  wallpaper: { max: 5, label: "🖼 Papel de Parede" },
  blur: { max: 5, label: "🌫 Blur nas Janelas" },
  cursor: { max: 5, label: "🖱 Cursor Personalizado" },
  player: { max: 5, label: "🎧 Upgrade do Player" }
};

taskbarApps.querySelectorAll(".appIcon").forEach(btn => {
  btn.onclick = () => {
    openApp(btn.dataset.app);
    playSound("click");
  };
});

const openWindows = {};
let zIndexCounter = 100;

function openApp(key) {
  if (openWindows[key]) {
    focusWindow(openWindows[key]);
    return;
  }

  const app = appsData[key];
  const win = document.createElement("div");
  win.className = "window";
  win.dataset.app = key;
  win.style.top = "100px";
  win.style.left = "100px";
  win.style.zIndex = ++zIndexCounter;

  const header = document.createElement("div");
  header.className = "window-header";
  header.innerHTML = `
    <span>${app.title}</span>
    <div>
      <button class="minimizeBtn">━</button>
      <button class="maximizeBtn">⬜</button>
      <button class="closeBtn">✖</button>
    </div>`;
  win.appendChild(header);

  const body = document.createElement("div");
  body.className = "window-body";
  body.innerHTML = app.content;
  win.appendChild(body);
  windowsContainer.appendChild(win);
  openWindows[key] = win;
  updateUI();

  header.querySelector(".closeBtn").onclick = () => {
    win.remove();
    delete openWindows[key];
    updateTaskbarIcons();
  };

  header.querySelector(".minimizeBtn").onclick = () => {
    win.style.display = "none";
  };

  header.querySelector(".maximizeBtn").onclick = () => {
    win.classList.toggle("maximized");
  };

  makeDraggable(win, header);
  focusWindow(win);

  if (key === "earn") {
    body.querySelector("#earnPointsBtn").onclick = () => {
      points++;
      saveGame();
      updateUI();
      playSound("click");
      notify("Ganhou 1 ponto!");
    };
  }

  if (key === "store") {
    updateStoreUI(body);
  }

  if (key === "winamp") {
    setupMusicPlayer(body);
  }

  if (key === "bet") {
    setupBetGame(body);
  }
}

function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

function updateTaskbarIcons() {
  taskbarApps.querySelectorAll(".appIcon").forEach(icon => {
    if (openWindows[icon.dataset.app]) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });
}

function updateUpgradesButtons() {
  document.querySelectorAll(".upgrade").forEach(btn => {
    if (btn.disabled) btn.classList.add("disabled");
    else btn.classList.remove("disabled");
  });
}

function updateStoreUI(body) {
  const storeList = body.querySelector(".store-list");
  if (!storeList) return;

  storeList.innerHTML = "";
  Object.keys(allUpgrades).forEach(k => {
    const level = getUpgradeLevel(k);
    const max = allUpgrades[k].max;
    const nextLevel = level + 1;
    const baseCost = 10;
    const cost = Math.floor(baseCost * Math.pow(1.5, level));

    const btn = document.createElement("button");
    btn.className = "upgrade";
    btn.textContent = `${allUpgrades[k].label} (Nível ${level}/${max}) - ${cost} pts`;
    btn.disabled = level >= max || points < cost;

    btn.onclick = () => {
      if (points >= cost && level < max) {
        upgrades[k] = nextLevel;
        points -= cost;
        saveGame();
        updateUI();
        playSound("notify");
        notify(`${allUpgrades[k].label} melhorado para nível ${nextLevel}!`);
        updateStoreUI(body);
      } else {
        playSound("error");
      }
    };

    storeList.appendChild(btn);
  });
}

function notify(msg) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = msg;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

let audio = new Audio();
let currentTrackIndex = 0;
let isPlaying = false;

function setupMusicPlayer(body) {
  const listDiv = body.querySelector(".music-list");
  const playBtn = body.querySelector("#playPauseBtn");
  const nextBtn = body.querySelector("#nextBtn");
  const prevBtn = body.querySelector("#prevBtn");
  const label = body.querySelector("#currentTrack");

  function playTrack() {
    audio.src = musicFiles[currentTrackIndex];
    audio.play();
    isPlaying = true;
    label.textContent = musicNames[currentTrackIndex];
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
  }

  playBtn.onclick = () => isPlaying ? pauseTrack() : playTrack();
  nextBtn.onclick = () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    playTrack();
  };
  prevBtn.onclick = () => {
    currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    playTrack();
  };

  musicFiles.forEach((src, i) => {
    const btn = document.createElement("button");
    btn.textContent = musicNames[i];
    btn.onclick = () => {
      currentTrackIndex = i;
      playTrack();
    };
    listDiv.appendChild(btn);
  });
}

// Controle para cooldown de aposta
let lastBetTimestamp = 0;
let betCooldown = 0;

function setupBetGame(body) {
  const betBtn = body.querySelector("#betBtn");
  const betInput = body.querySelector("#betAmount");
  const betResult = body.querySelector("#betResult");
  const canvas = body.querySelector("#betGameCanvas");
  const ctx = canvas.getContext("2d");

  let gameActive = false;
  let playerX = 140;
  let playerY = 130;
  let playerSize = 20;
  let obstacleX = 320;
  let obstacleY = 130;
  let obstacleSize = 20;
  let speed = 4;

  function resetGame() {
    playerX = 140;
    playerY = 130;
    obstacleX = 320;
    betResult.textContent = "";
    gameActive = false;
    canvas.style.display = "none";
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha jogador
    ctx.fillStyle = "#0a64c8";
    ctx.fillRect(playerX, playerY, playerSize, playerSize);

    // Desenha obstáculo
    ctx.fillStyle = "#d14424";
    ctx.fillRect(obstacleX, obstacleY, obstacleSize, obstacleSize);
  }

  function update() {
    if (!gameActive) return;

    obstacleX -= speed;
    if (obstacleX + obstacleSize < 0) {
      // Jogador venceu (obstáculo saiu da tela)
      endGame(true);
      return;
    }

    // Checa colisão
    if (
      playerX < obstacleX + obstacleSize &&
      playerX + playerSize > obstacleX &&
      playerY < obstacleY + obstacleSize &&
      playerY + playerSize > obstacleY
    ) {
      // Jogador perdeu (colidiu)
      endGame(false);
      return;
    }

    draw();
    requestAnimationFrame(update);
  }

  function endGame(won) {
    gameActive = false;
    canvas.style.display = "none";
    betInput.disabled = false;
    betBtn.disabled = false;

    if (won) {
      let ganho = currentBet * 2;
      points += ganho;
      betResult.textContent = `Você ganhou ${ganho} pontos! 🎉`;
      playSound("notify");
    } else {
      points -= currentBet;
      betResult.textContent = `Você perdeu ${currentBet} pontos. 😢`;
      playSound("error");
    }
    saveGame();
    updateUI();
  }

  function startGame() {
    if (gameActive) return;

    const now = Date.now();
    if (now - lastBetTimestamp < betCooldown) {
      const timeLeft = Math.ceil((betCooldown - (now - lastBetTimestamp)) / 1000);
      betResult.textContent = `Espere ${timeLeft}s para apostar novamente.`;
      playSound("error");
      return;
    }

    let bet = parseInt(betInput.value);
    if (!bet || bet < 1) {
      betResult.textContent = "Digite um valor válido para apostar.";
      playSound("error");
      return;
    }
    if (bet > points) {
      betResult.textContent = "Você não tem pontos suficientes para essa aposta.";
      playSound("error");
      return;
    }

    currentBet = bet;
    betInput.disabled = true;
    betBtn.disabled = true;
    canvas.style.display = "block";
    betResult.textContent = "Use as setas ↑ ↓ para desviar do bloco vermelho!";

    // Reset posições
    playerY = 130;
    obstacleX = 320;

    // Sorteia cooldown entre 10s e 30s
    betCooldown = (Math.floor(Math.random() * 21) + 10) * 1000;
    lastBetTimestamp = now;

    gameActive = true;
    draw();
    update();
  }

  betBtn.onclick = startGame;

  // Controle de teclado
  window.addEventListener("keydown", e => {
    if (!gameActive) return;
    if (e.key === "ArrowUp" && playerY > 5) playerY -= 20;
    if (e.key === "ArrowDown" && playerY < canvas.height - playerSize - 5) playerY += 20;
  });

  // Limpa estado se app fechar
  body.closest(".window").querySelector(".closeBtn").onclick = () => {
    gameActive = false;
    canvas.style.display = "none";
    betInput.disabled = false;
    betBtn.disabled = false;
    betResult.textContent = "";
  };
}
