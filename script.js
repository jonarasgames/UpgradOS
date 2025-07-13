// Variáveis
let points = parseInt(localStorage.getItem("points")) || 0;
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || [];

const pointsDisplay = document.getElementById("points");
const startButton = document.getElementById("startButton");
const taskbarIcons = document.getElementById("taskbarIcons");
const startMenu = document.getElementById("startMenu");
const windowsContainer = document.getElementById("windowsContainer");
const wallpaper = document.getElementById("wallpaper");
const achievementPopup = document.getElementById("achievement");
const notificationArea = document.getElementById("notifications");

const clickSound = document.getElementById("clickSound");
const errorSound = document.getElementById("errorSound");
const notifySound = document.getElementById("notifySound");
const bootSound = document.getElementById("bootSound");

let firstInteraction = false;

window.addEventListener("click", () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound("boot");
  }
});

// Tela boot
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("bootScreen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
    updateClock();
  }, 3100);
});

// Função para tocar sons
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

// Atualiza UI geral
function updateUI() {
  pointsDisplay.textContent = points;

  // Papel de parede
  if (upgrades.includes("wallpaper")) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2708044.jpg')";
  } else {
    wallpaper.style.backgroundImage = "none";
  }

  // Blur
  const windows = document.querySelectorAll(".window");
  if (upgrades.includes("blur")) {
    windows.forEach(w => w.classList.add("blur"));
  } else {
    windows.forEach(w => w.classList.remove("blur"));
  }

  // Cursor
  if (upgrades.includes("cursor")) {
    document.body.classList.add("custom-cursor");
  } else {
    document.body.classList.remove("custom-cursor");
  }

  updateTaskbar();
  updateUpgradesButtons();

  if (upgrades.length >= 3) {
    achievementPopup.classList.remove("hidden");
  }
}

// Atualiza o relógio na barra
function updateClock() {
  const clock = document.getElementById("clock");
  setInterval(() => {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }, 1000);
}

// Salvar progresso
function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// Abre ou fecha o menu iniciar
startButton.addEventListener("click", e => {
  e.stopPropagation();
  startMenu.classList.toggle("hidden");
});

// Fecha o menu se clicar fora
document.addEventListener("click", e => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add("hidden");
  }
});

// Controle dos apps
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
    content: `<p>Tocando: nostalgia.mp3 (simulado)</p>`
  }
};

let zIndexCounter = 100;

// Atualiza ícones das janelas na taskbar
function updateTaskbar() {
  taskbarIcons.innerHTML = "";
  const windows = [...windowsContainer.children];
  windows.forEach(win => {
    const appName = win.dataset.app;
    const appInfo = appsData[appName];
    if (!appInfo) return;

    const iconBtn = document.createElement("button");
    iconBtn.className = "taskbarIcon";
    iconBtn.title = appInfo.title;
    iconBtn.textContent = appInfo.icon;
    iconBtn.onclick = () => {
      focusWindow(win);
    };
    taskbarIcons.appendChild(iconBtn);
  });
}

// Atualiza botões de upgrade na loja (desabilita os comprados)
function updateUpgradesButtons() {
  const upgradeButtons = document.querySelectorAll(".upgrade");
  upgradeButtons.forEach(btn => {
    const cost = parseInt(btn.dataset.cost);
    const upg = btn.dataset.upgrade;
    if (upgrades.includes(upg)) {
      btn.classList.add("disabled");
      btn.textContent = `✔ ${btn.textContent.replace(/^.+?\s/, '')}`; // adiciona ✔
    } else {
      btn.classList.remove("disabled");
    }
  });
}

// Função para abrir uma janela do app
function openApp(appKey) {
  if (!appsData[appKey]) return;

  // Se já aberto, foca a janela
  const existing = [...windowsContainer.children].find(w => w.dataset.app === appKey);
  if (existing) {
    focusWindow(existing);
    return;
  }

  // Cria nova janela
  const win = document.createElement("div");
  win.className = "window";
  win.dataset.app = appKey;
  win.style.top = "100px";
  win.style.left = "100px";
  win.style.zIndex = ++zIndexCounter;

  // Header com título e botões
  const header = document.createElement("div");
  header.className = "window-header";
  header.innerHTML = `
    <span>${appsData[appKey].title}</span>
    <div>
      <button class="minimizeBtn" title="Minimizar">━</button>
      <button class="maximizeBtn" title="Maximizar">⬜</button>
      <button class="closeBtn" title="Fechar">✖</button>
    </div>
  `;

  win.appendChild(header);

  // Corpo da janela
  const body = document.createElement("div");
  body.className = "window-body";
  body.innerHTML = appsData[appKey].content;
  win.appendChild(body);

  windowsContainer.appendChild(win);

  updateTaskbar();

  // Eventos janelas
  header.querySelector(".closeBtn").onclick = () => {
    win.remove();
    updateTaskbar();
  };
  header.querySelector(".minimizeBtn").onclick = () => {
    win.style.display = "none";
  };
  header.querySelector(".maximizeBtn").onclick = () => {
    if (win.classList.contains("maximized")) {
      // Restaurar tamanho
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

  // Ações internas dos apps
  if (appKey === "earn") {
    const btnEarn = body.querySelector("#earnPointsBtn");
    btnEarn.onclick = () => {
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

  // Mostrar janela e focar
  win.style.display = "flex";
  focusWindow(win);
}

// Focar uma janela (trazer pra frente)
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  win.style.display = "flex";
  // Também abrir o app no taskbar se estiver minimizado
  if (win.style.display === "none") win.style.display = "flex";
}

// Função para permitir arrastar janelas
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

      // Limita dentro da tela
      const desktopRect = document.getElementById("desktop").getBoundingClientRect();
      const winRect = win.getBoundingClientRect();

      if (newLeft < desktopRect.left) newLeft = desktopRect.left;
      if (newTop < desktopRect.top) newTop = desktopRect.top;
      if (newLeft + winRect.width > desktopRect.right) newLeft = desktopRect.right - winRect.width;
      if (newTop + winRect.height > desktopRect.bottom - 40) newTop = desktopRect.bottom - 40 - winRect.height; // deixa barra visível

      win.style.left = newLeft + "px";
      win.style.top = newTop + "px";
    }
  });
}

// Notificações
function notify(text) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = text;
  notificationArea.appendChild(box);
  setTimeout(() => {
    box.remove();
  }, 4000);
}

// Salvar progresso
function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// Inicializar UI
function init() {
  updateUI();

  // Ações dos apps do menu iniciar
  document.querySelectorAll(".appIcon").forEach(el => {
    el.onclick = () => {
      openApp(el.dataset.app);
      startMenu.classList.add("hidden");
      playSound("click");
    };
  });

  updateClock();
}

init();
