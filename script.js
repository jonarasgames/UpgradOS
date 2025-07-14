// Variáveis principais
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

// Inicializa som após interação do usuário
window.addEventListener("click", () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound("boot");
  }
});

// Esconde tela de boot após carregamento
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("bootScreen").style.display = "none";
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
    updateClock();
  }, 3100);
});

// Função para tocar sons
function playSound(type) {
  try {
    if (type === "click") clickSound.play();
    else if (type === "error") errorSound.play();
    else if (type === "notify") notifySound.play();
    else if (type === "boot") bootSound.play();
  } catch (e) {}
}

// Salva progresso no localStorage
function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// Atualiza relógio digital
function updateClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, 1000);
}

// Atualiza cursor conforme contexto e upgrade
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

// Torna janela arrastável com cursor dinâmico
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

  // Cursor dedinho para os botões dentro da janela
  win.querySelectorAll("button").forEach(btn => {
    btn.addEventListener("mouseenter", () => updateCursorContext("pointer"));
    btn.addEventListener("mouseleave", () => updateCursorContext("default"));
  });
}

// Atualiza o UI geral (pontos, upgrades visuais, barra)
function updateUI() {
  pointsDisplay.textContent = points;
  updateVisualUpgrades();
  updateTaskbarIcons();
  updateUpgradesButtons();
}

// Aplica upgrades visuais em tempo real
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

// Obter nível do upgrade
function getUpgradeLevel(key) {
  return upgrades[key] || 0;
}

// Dados dos apps
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
  }
};

// Upgrades disponíveis com máximo de 5 níveis
const allUpgrades = {
  wallpaper: { max: 5, label: "🖼 Papel de Parede" },
  blur: { max: 5, label: "🌫 Blur nas Janelas" },
  cursor: { max: 5, label: "🖱 Cursor Personalizado" },
  player: { max: 5, label: "🎧 Upgrade do Player" }
};

// Abrir apps fixos ao clicar na barra de tarefas
taskbarApps.querySelectorAll(".appIcon").forEach(btn => {
  btn.onclick = () => {
    openApp(btn.dataset.app);
    playSound("click");
  };
});

// Abre app e cria janela, com todos handlers
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

  // Cabeçalho com botões
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

  // Corpo
  const body = document.createElement("div");
  body.className = "window-body";
  body.innerHTML = app.content;
  win.appendChild(body);
  windowsContainer.appendChild(win);
  openWindows[key] = win;
  updateUI();

  // Fechar janela
  header.querySelector(".closeBtn").onclick = () => {
    win.remove();
    delete openWindows[key];
    updateTaskbarIcons();
  };

  // Minimizar janela
  header.querySelector(".minimizeBtn").onclick = () => {
    win.style.display = "none";
  };

  // Maximizar/restaurar
  header.querySelector(".maximizeBtn").onclick = () => {
    win.classList.toggle("maximized");
  };

  // Tornar arrastável com cursor dinâmico
  makeDraggable(win, header);
  focusWindow(win);

  // Apps específicos
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
}

// Dar foco na janela
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

// Atualizar ícones ativos na barra de tarefas
function updateTaskbarIcons() {
  taskbarApps.querySelectorAll(".appIcon").forEach(icon => {
    if (openWindows[icon.dataset.app]) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });
}

// Atualiza botões de upgrade (desabilita/abilita)
function updateUpgradesButtons() {
  document.querySelectorAll(".upgrade").forEach(btn => {
    if (btn.disabled) btn.classList.add("disabled");
    else btn.classList.remove("disabled");
  });
}

// Atualiza a UI da loja em tempo real sem fechar
function updateStoreUI(body) {
  const storeList = body.querySelector(".store-list");
  if (!storeList) return;

  storeList.innerHTML = "";
  Object.keys(allUpgrades).forEach(k => {
    const level = getUpgradeLevel(k);
    const max = allUpgrades[k].max;
    const nextLevel = level + 1;
    const cost = nextLevel * 10;

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
        updateStoreUI(body); // Atualiza loja instantaneamente
      } else {
        playSound("error");
      }
    };

    storeList.appendChild(btn);
  });
}

// Notificações simples
function notify(msg) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = msg;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Player música
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
