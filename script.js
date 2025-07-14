// Variáveis globais
let points = parseInt(localStorage.getItem("points")) || 0;
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || [];

const pointsDisplay = document.getElementById("points");
const startButton = document.getElementById("startButton");
const taskbarApps = document.getElementById("taskbarApps");
const windowsContainer = document.getElementById("windowsContainer");
const wallpaper = document.getElementById("wallpaper");
const notifications = document.getElementById("notifications");

const clickSound = document.getElementById("clickSound");
const errorSound = document.getElementById("errorSound");
const notifySound = document.getElementById("notifySound");
const bootSound = document.getElementById("bootSound");

let firstInteraction = false;

// Lista simulada de músicas (não dá pra listar pasta no GitHub Pages)
const musicFiles = [
  "sounds/music/song1.mp3",
  "sounds/music/song2.mp3",
  "sounds/music/song3.mp3"
];
const musicNames = [
  "Song 1 - Chill",
  "Song 2 - Retro",
  "Song 3 - Groove"
];

// Garante que sons só toquem após interação do usuário
window.addEventListener("click", () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound("boot");
  }
});

// Tela boot some após 3.1s
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const boot = document.getElementById("bootScreen");
    if (boot) boot.style.display = "none";
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
    updateClock();
  }, 3100);
});

// Toca sons com controle de interação
function playSound(type) {
  if (!firstInteraction && type !== "boot") return;
  try {
    if (type === "click") clickSound.play();
    else if (type === "error") errorSound.play();
    else if (type === "notify") notifySound.play();
    else if (type === "boot") bootSound.play();
  } catch (e) {
    console.warn("Erro ao tocar som:", type, e);
  }
}

// Atualiza interface visual e upgrades
function updateUI() {
  pointsDisplay.textContent = points;

  // Papel de parede upgrade
  if (upgrades.includes("wallpaper")) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2708044.jpg')";
  } else {
    wallpaper.style.backgroundImage = "none";
  }

  // Blur upgrade aplica a todas janelas abertas
  const windows = document.querySelectorAll(".window");
  if (upgrades.includes("blur")) {
    windows.forEach(w => w.classList.add("blur"));
  } else {
    windows.forEach(w => w.classList.remove("blur"));
  }

  // Cursor customizado upgrade
  if (upgrades.includes("cursor")) {
    document.body.classList.add("custom-cursor");
  } else {
    document.body.classList.remove("custom-cursor");
  }

  // Atualiza ícones da barra destacando os apps abertos
  updateTaskbarIcons();

  // Atualiza botões de upgrade na loja
  updateUpgradesButtons();

  // Atualiza player música caso aberto
  const winPlayer = document.querySelector(".window[data-app='winamp']");
  if (winPlayer) {
    updateMusicPlayerUI(winPlayer);
  }
}

// Atualiza relógio na barra
function updateClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }, 1000);
}

// Salva progresso local
function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// Abrir/fechar menu iniciar
startButton.addEventListener("click", e => {
  e.stopPropagation();
  toggleStartMenu();
});

function toggleStartMenu() {
  const startMenu = document.getElementById("startMenu");
  startMenu.classList.toggle("hidden");
}

// Fecha menu se clicar fora
document.addEventListener("click", e => {
  const startMenu = document.getElementById("startMenu");
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add("hidden");
  }
});

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
    content: `
      <button class="upgrade" data-cost="10" data-upgrade="wallpaper">🖼 Papel de Parede (10 pts)</button>
      <button class="upgrade" data-cost="20" data-upgrade="blur">🌫 Blur nas janelas (20 pts)</button>
      <button class="upgrade" data-cost="15" data-upgrade="cursor">🖱 Cursor Customizado (15 pts)</button>
      <button class="upgrade" data-cost="25" data-upgrade="playerUpgrade">🎧 Upgrade Player Música (25 pts)</button>
    `
  },
  notepad: {
    title: "Notepad",
    icon: "📝",
    content: `<textarea rows="10" style="width:100%; resize:none;">Escreva algo aqui...</textarea>`
  },
  winamp: {
    title: "Winamp",
    icon: "🎵",
    content: `<div class="music-player" role="region" aria-label="Player de Música">
      <div class="music-list" role="list" aria-label="Lista de músicas"></div>
      <div class="music-controls">
        <button id="prevBtn" title="Anterior" disabled>⏮</button>
        <button id="playPauseBtn" title="Play/Pausa">▶️</button>
        <button id="nextBtn" title="Próxima" disabled>⏭</button>
      </div>
      <div id="currentTrack" aria-live="polite" style="margin-top: 6px; font-weight: 600; text-align: center;"></div>
    </div>`
  }
};

let zIndexCounter = 100;

// Atrela os botões fixos da barra para abrir app
taskbarApps.querySelectorAll(".appIcon").forEach(btn => {
  btn.onclick = () => {
    openApp(btn.dataset.app);
    playSound("click");
  };
});

// Guarda janelas abertas para foco e controle
const openWindows = {};

// Abre janela do app
function openApp(appKey) {
  if (!appsData[appKey]) return;

  // Se já aberto, foca e ativa ícone na barra
  if (openWindows[appKey]) {
    focusWindow(openWindows[appKey]);
    setActiveAppIcon(appKey);
    return;
  }

  // Cria janela
  const win = document.createElement("div");
  win.className = "window";
  win.dataset.app = appKey;
  win.style.top = "100px";
  win.style.left = "100px";
  win.style.zIndex = ++zIndexCounter;

  // Header da janela
  const header = document.createElement("div");
  header.className = "window-header";
  header.innerHTML = `
    <span>${appsData[appKey].title}</span>
    <div>
      <button class="minimizeBtn" title="Minimizar" aria-label="Minimizar">━</button>
      <button class="maximizeBtn" title="Maximizar" aria-label="Maximizar">⬜</button>
      <button class="closeBtn" title="Fechar" aria-label="Fechar">✖</button>
    </div>
  `;
  win.appendChild(header);

  // Corpo da janela
  const body = document.createElement("div");
  body.className = "window-body";
  body.innerHTML = appsData[appKey].content;
  win.appendChild(body);

  windowsContainer.appendChild(win);
  openWindows[appKey] = win;

  updateTaskbarIcons();
  updateUI();

  // Botões da janela
  header.querySelector(".closeBtn").onclick = () => {
    win.remove();
    delete openWindows[appKey];
    updateTaskbarIcons();
  };

  header.querySelector(".minimizeBtn").onclick = () => {
    win.style.display = "none";
  };

  header.querySelector(".maximizeBtn").onclick = () => {
    if (win.classList.contains("maximized")) {
      // Restaurar
      win.style.top = win.dataset.prevTop || "100px";
      win.style.left = win.dataset.prevLeft || "100px";
      win.style.width = win.dataset.prevWidth || "350px";
      win.style.height = win.dataset.prevHeight || "250px";
      win.classList.remove("maximized");
    } else {
      // Maximizar
      win.dataset.prevTop = win.style.top;
      win.dataset.prevLeft = win.style.left;
      win.dataset.prevWidth = win.style.width;
      win.dataset.prevHeight = win.style.height;

      win.style.top = "40px";
      win.style.left = "0";
      win.style.width = "100%";
      win.style.height = `calc(100vh - 40px)`;
      win.classList.add("maximized");
    }
  };

  // Arrastar janela
  makeDraggable(win, header);

  // Funcionalidades específicas apps
  if (appKey === "earn") {
    body.querySelector("#earnPointsBtn").onclick = () => {
      points++;
      saveGame();
      updateUI();
      notify("Você ganhou 1 ponto!");
      playSound("click");
    };
  }

  if (appKey === "store") {
    const upgradeBtns = body.querySelectorAll(".upgrade");
    upgradeBtns.forEach(btn => {
      btn.onclick = () => {
        if (btn.classList.contains("disabled")) {
          playSound("error");
          return;
        }
        const cost = parseInt(btn.dataset.cost);
        const upg = btn.dataset.upgrade;
        if (points >= cost && !upgrades.includes(upg)) {
          points -= cost;
          upgrades.push(upg);
          saveGame();
          updateUI();
          notify(`Upgrade "${upg}" comprado!`);
          playSound("notify");
        } else {
          playSound("error");
        }
      };
    });
    updateUpgradesButtons();
  }

  if (appKey === "winamp") {
    setupMusicPlayer(body);
  }

  win.style.display = "flex";
  focusWindow(win);
  setActiveAppIcon(appKey);
}

// Destaca ícone ativo na barra
function updateTaskbarIcons() {
  const icons = taskbarApps.querySelectorAll(".appIcon");
  icons.forEach(icon => {
    if (openWindows[icon.dataset.app]) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });
}

// Define o ícone ativo na barra
function setActiveAppIcon(appKey) {
  const icons = taskbarApps.querySelectorAll(".appIcon");
  icons.forEach(icon => {
    if (icon.dataset.app === appKey) {
      icon.classList.add("active");
    } else {
      icon.classList.remove("active");
    }
  });
}

// Atualiza os botões de upgrade (desabilita comprados)
function updateUpgradesButtons() {
  const upgradeButtons = document.querySelectorAll(".upgrade");
  upgradeButtons.forEach(btn => {
    const upg = btn.dataset.upgrade;
    if (upgrades.includes(upg)) {
      btn.classList.add("disabled");
      btn.textContent = `✔ ${btn.textContent.replace(/^.+?\s/, "")}`;
    } else {
      btn.classList.remove("disabled");
    }
  });
}

// Faz janelas arrastáveis
function makeDraggable(win, header) {
  let isDragging = false;
  let offsetX, offsetY;

  header.addEventListener("mousedown", e => {
    isDragging = true;
    offsetX = e.clientX - win.getBoundingClientRect().left;
    offsetY = e.clientY - win.getBoundingClientRect().top;
    header.classList.add("dragging");
    focusWindow(win);
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      header.classList.remove("dragging");
    }
  });

  document.addEventListener("mousemove", e => {
    if (isDragging) {
      let newLeft = e.clientX - offsetX;
      let newTop = e.clientY - offsetY;

      const desktopRect = document.getElementById("desktop").getBoundingClientRect();
      const winRect = win.getBoundingClientRect();

      if (newLeft < desktopRect.left) newLeft = desktopRect.left;
      if (newTop < desktopRect.top) newTop = desktopRect.top;
      if (newLeft + winRect.width > desktopRect.right) newLeft = desktopRect.right - winRect.width;
      if (newTop + winRect.height > desktopRect.bottom - 40) newTop = desktopRect.bottom - 40 - winRect.height;

      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    }
  });
}

// Trazer janela para frente
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

// Notificações visuais
function notify(text) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => {
    box.remove();
  }, 4000);
}

// == PLAYER DE MÚSICA ==

let currentTrackIndex = 0;
let isPlaying = false;
let audio = null;
let playerUpgraded = false;

function setupMusicPlayer(body) {
  const musicListDiv = body.querySelector(".music-list");
  const playPauseBtn = body.querySelector("#playPauseBtn");
  const prevBtn = body.querySelector("#prevBtn");
  const nextBtn = body.querySelector("#nextBtn");
  const currentTrackLabel = body.querySelector("#currentTrack");

  // Cria botões da lista
  musicListDiv.innerHTML = "";
  musicFiles.forEach((file, idx) => {
    const btn = document.createElement("button");
    btn.textContent = musicNames[idx];
    btn.setAttribute("role", "listitem");
    btn.onclick = () => {
      currentTrackIndex = idx;
      playTrack();
    };
    musicListDiv.appendChild(btn);
  });

  // Cria elemento audio se ainda não existir
  if (!audio) audio = new Audio();

  function playTrack() {
    audio.src = musicFiles[currentTrackIndex];
    audio.play().catch(() => {
      // Sem interação, não toca
    });
    isPlaying = true;
    updateMusicPlayerUI(body);
    playPauseBtn.textContent = "⏸";
    highlightActiveSong();
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updateMusicPlayerUI(body);
    playPauseBtn.textContent = "▶️";
  }

  function highlightActiveSong() {
    const buttons = musicListDiv.querySelectorAll("button");
    buttons.forEach((b, i) => {
      if (i === currentTrackIndex) b.classList.add("active");
      else b.classList.remove("active");
    });
  }

  playPauseBtn.onclick = () => {
    if (!playerUpgraded) {
      notify("Compre upgrade do player para controlar a música!");
      playSound("error");
      return;
    }
    if (!isPlaying) playTrack();
    else pauseTrack();
  };

  prevBtn.onclick = () => {
    if (!playerUpgraded) {
      notify("Compre upgrade do player para controlar a música!");
      playSound("error");
      return;
    }
    currentTrackIndex--;
    if (currentTrackIndex < 0) currentTrackIndex = musicFiles.length -1;
    playTrack();
  };

  nextBtn.onclick = () => {
    if (!playerUpgraded) {
      notify("Compre upgrade do player para controlar a música!");
      playSound("error");
      return;
    }
    currentTrackIndex++;
    if (currentTrackIndex >= musicFiles.length) currentTrackIndex = 0;
    playTrack();
  };

  audio.onended = () => {
    currentTrackIndex++;
    if (currentTrackIndex >= musicFiles.length) currentTrackIndex = 0;
    if (playerUpgraded) playTrack();
  };

  updateMusicPlayerUI(body);
}

function updateMusicPlayerUI(body) {
  const playPauseBtn = body.querySelector("#playPauseBtn");
  const prevBtn = body.querySelector("#prevBtn");
  const nextBtn = body.querySelector("#nextBtn");
  const currentTrackLabel = body.querySelector("#currentTrack");

  currentTrackLabel.textContent = musicNames[currentTrackIndex] || "Nenhuma música";

  if (upgrades.includes("playerUpgrade")) {
    playerUpgraded = true;
    playPauseBtn.disabled = false;
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  } else {
    playerUpgraded = false;
    playPauseBtn.disabled = true;
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  }
}

// Inicialização
function init() {
  updateUI();
  updateClock();
}

init();
