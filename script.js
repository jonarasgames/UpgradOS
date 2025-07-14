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
  if (context === "grab") document.body.classList.add("custom-cursor-grab");
  else if (context === "pointer") document.body.classList.add("custom-cursor-pointer");
  else document.body.classList.add("custom-cursor-default");
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

function getUpgradeLevel(key) {
  return upgrades[key] || 0;
}

function updateUI() {
  pointsDisplay.textContent = points;
  updateVisualUpgrades();
  updateTaskbarIcons();
  document.querySelectorAll(".window").forEach(win => {
    if (win.dataset.app === "store") updateStoreUI(win.querySelector(".window-body"));
  });
}

function updateVisualUpgrades() {
  wallpaper.classList.toggle("aero-wallpaper", getUpgradeLevel("wallpaper") >= 1);

  document.querySelectorAll(".window").forEach(w => {
    const body = w.querySelector(".window-body");
    const blur = getUpgradeLevel("blur");
    const aero = blur >= 1;
    w.classList.toggle("aero-window", aero);
    body.classList.toggle("blur", aero);
  });

  if (getUpgradeLevel("cursor") >= 1) updateCursorContext("default");
  else document.body.classList.remove("custom-cursor-default", "custom-cursor-grab", "custom-cursor-pointer");

  const taskbar = document.getElementById("taskbar");
  taskbar.classList.toggle("aero-taskbar", getUpgradeLevel("wallpaper") >= 1);
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
    title: "Bahze",
    icon: "🎲",
    content: `<div id="betArea">
      <p>Quantos pontos deseja apostar?</p>
      <input type="number" id="betInput" min="1" style="width:100%;" />
      <button id="betButton">Apostar</button>
      <div id="betResult"></div>
    </div>`
  }
};

const allUpgrades = {
  wallpaper: { max: 5, label: "🖼 Papel de Parede" },
  blur: { max: 5, label: "🌫 Blur nas Janelas" },
  cursor: { max: 5, label: "🖱 Cursor Personalizado" },
  player: { max: 5, label: "🎧 Upgrade do Player" }
};

let openWindows = {};
let zIndexCounter = 100;

taskbarApps.querySelectorAll(".appIcon").forEach(btn => {
  btn.onclick = () => {
    openApp(btn.dataset.app);
    playSound("click");
  };
});

function openApp(key) {
  if (openWindows[key]) return focusWindow(openWindows[key]);

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
  header.querySelector(".minimizeBtn").onclick = () => win.style.display = "none";
  header.querySelector(".maximizeBtn").onclick = () => win.classList.toggle("maximized");

  makeDraggable(win, header);
  focusWindow(win);

  if (key === "earn") {
    body.querySelector("#earnPointsBtn").onclick = () => {
      points++;
      saveGame();
      updateUI();
      notify("Ganhou 1 ponto!");
    };
  }

  if (key === "store") updateStoreUI(body);
  if (key === "winamp") setupMusicPlayer(body);
  if (key === "bet") setupBetApp(body);
}

function focusWindow(win) {
  win.style.zIndex = ++zIndexCounter;
}

function updateTaskbarIcons() {
  taskbarApps.querySelectorAll(".appIcon").forEach(icon => {
    icon.classList.toggle("active", openWindows[icon.dataset.app]);
  });
}

function notify(msg) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = msg;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

function updateStoreUI(body) {
  const storeList = body.querySelector(".store-list");
  if (!storeList) return;
  storeList.innerHTML = "";

  Object.keys(allUpgrades).forEach(k => {
    const level = getUpgradeLevel(k);
    const max = allUpgrades[k].max;
    const nextLevel = level + 1;
    const base = 10;
    const cost = Math.round(base * Math.pow(1.5, level));

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
        notify(`${allUpgrades[k].label} melhorado para nível ${nextLevel}!`);
      } else {
        playSound("error");
      }
    };

    storeList.appendChild(btn);
  });
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

let betCooldown = false;

function setupBetApp(body) {
  const input = body.querySelector("#betInput");
  const button = body.querySelector("#betButton");
  const result = body.querySelector("#betResult");

  button.onclick = () => {
    const value = parseInt(input.value);
    if (betCooldown) return notify("Espere antes de apostar de novo!");
    if (isNaN(value) || value <= 0) return notify("Valor inválido!");
    if (value > points) return notify("Você não tem pontos suficientes!");

    const win = Math.random() < 0.5;
    points += win ? value : -value;
    result.textContent = win ? `Você ganhou +${value} pontos!` : `Você perdeu ${value} pontos!`;
    saveGame();
    updateUI();

    betCooldown = true;
    setTimeout(() => {
      betCooldown = false;
      result.textContent = "";
    }, Math.random() * 5000 + 2000); // Cooldown aleatório entre 2s e 7s
  };
}
