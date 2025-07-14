"use strict";

// Elementos DOM
const bootScreen = document.getElementById("bootScreen");
const bootProgress = document.querySelector("#bootBar .progress");
const desktop = document.getElementById("desktop");
const wallpaper = document.getElementById("wallpaper");
const windowsContainer = document.getElementById("windowsContainer");
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const notifications = document.getElementById("notifications");

const pointsLabel = document.getElementById("points");
const clockLabel = document.getElementById("clock");

const clickSound = document.getElementById("clickSound");
const errorSound = document.getElementById("errorSound");
const notifySound = document.getElementById("notifySound");
const bootSound = document.getElementById("bootSound");

// Estado do sistema
let points = 0;
let windows = [];
let zIndexCounter = 10;
let wallpaperLevel = 0;
let blurLevel = 2; // default blur level nas janelas
let activeWindow = null;

// Aplicativos disponíveis
const apps = {
  earn: {
    title: "Ganhar Pontos",
    content: `
      <p>Use o botão abaixo para ganhar pontos!</p>
      <button id="earnPointsBtn">Ganhar +1 ponto</button>
      <p id="earnPointsMsg"></p>
    `,
    init: () => {
      const btn = document.getElementById("earnPointsBtn");
      const msg = document.getElementById("earnPointsMsg");
      btn.onclick = () => {
        points += 1;
        updatePoints();
        showNotification("+1 ponto ganho!");
        clickSound.play();
        msg.textContent = "Você ganhou 1 ponto!";
      };
    }
  },

  store: {
    title: "Loja de Upgrades",
    content: `
      <p>Compre upgrades com seus pontos para melhorar o sistema.</p>
      <ul id="storeList"></ul>
      <p id="storeMsg"></p>
    `,
    init: () => {
      const storeList = document.getElementById("storeList");
      const storeMsg = document.getElementById("storeMsg");

      const upgrades = [
        { id: "wallpaperUpgrade", name: "Melhorar Papel de Parede (+1 nível)", cost: 10, action: () => {
          if(wallpaperLevel < 5){
            wallpaperLevel++;
            updateWallpaper();
            showNotification("Papel de parede melhorado!");
          } else {
            storeMsg.textContent = "Você já tem o melhor papel de parede!";
          }
        }},
        { id: "blurUpgrade", name: "Melhorar Desfoque nas Janelas (+1 nível)", cost: 15, action: () => {
          if(blurLevel < 5){
            blurLevel++;
            updateAllWindowsBlur();
            showNotification("Desfoque melhorado!");
          } else {
            storeMsg.textContent = "Desfoque já está no máximo!";
          }
        }},
        { id: "pointsMultiplier", name: "Multiplicador de Pontos (+1 ponto por clique extra)", cost: 20, action: () => {
          pointsMultiplier++;
          showNotification("Multiplicador aumentado!");
        }},
      ];

      storeList.innerHTML = "";
      upgrades.forEach(upg => {
        const li = document.createElement("li");
        li.textContent = `${upg.name} - Custo: ${upg.cost} pontos`;
        li.style.cursor = "pointer";
        li.style.marginBottom = "8px";
        li.style.padding = "6px";
        li.style.borderRadius = "6px";
        li.style.background = "rgba(0,123,255,0.1)";
        li.onmouseenter = () => li.style.background = "rgba(0,123,255,0.25)";
        li.onmouseleave = () => li.style.background = "rgba(0,123,255,0.1)";
        li.onclick = () => {
          if(points >= upg.cost){
            points -= upg.cost;
            updatePoints();
            upg.action();
            storeMsg.textContent = "";
            clickSound.play();
          } else {
            storeMsg.textContent = "Pontos insuficientes.";
            errorSound.play();
          }
        };
        storeList.appendChild(li);
      });
    }
  },

  notepad: {
    title: "Notepad",
    content: `
      <textarea id="notepadArea" style="width:100%; height: 300px; resize:none; font-size:14px; padding:8px; border-radius: 8px; border: 1px solid #aaa;"></textarea>
    `,
    init: () => {
      // Poderia salvar no localStorage, por exemplo
      const area = document.getElementById("notepadArea");
      const saved = localStorage.getItem("notepadContent");
      if(saved) area.value = saved;

      area.oninput = () => {
        localStorage.setItem("notepadContent", area.value);
      };
    }
  },

  winamp: {
    title: "Winamp",
    content: `
      <p>Player de música simples</p>
      <audio id="winampPlayer" controls style="width:100%;"></audio>
      <select id="winampPlaylist" style="width:100%; margin-top:8px;">
        <option value="">-- Selecione uma música --</option>
        <option value="sounds/music1.mp3">Música 1</option>
        <option value="sounds/music2.mp3">Música 2</option>
        <option value="sounds/music3.mp3">Música 3</option>
      </select>
    `,
    init: () => {
      const player = document.getElementById("winampPlayer");
      const playlist = document.getElementById("winampPlaylist");

      playlist.onchange = () => {
        if(playlist.value){
          player.src = playlist.value;
          player.play();
          showNotification("Tocando: " + playlist.options[playlist.selectedIndex].text);
        } else {
          player.pause();
          player.src = "";
        }
      };
    }
  },

  bet: {
    title: "Bahze (Jogo de Dados)",
    content: `
      <p>Jogue os dados e ganhe pontos!</p>
      <button id="rollDiceBtn">Lançar Dados</button>
      <p id="diceResult"></p>
    `,
    init: () => {
      const btn = document.getElementById("rollDiceBtn");
      const result = document.getElementById("diceResult");
      btn.onclick = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        if(roll >= 4){
          points += 2;
          updatePoints();
          showNotification("Você ganhou 2 pontos!");
          clickSound.play();
          result.textContent = `Você tirou ${roll} e ganhou 2 pontos!`;
        } else {
          showNotification("Você não ganhou pontos desta vez.");
          errorSound.play();
          result.textContent = `Você tirou ${roll}, tente novamente!`;
        }
      };
    }
  },

  calculator: {
    title: "Calculadora",
    content: `
      <input type="text" id="calcDisplay" readonly style="width:100%; font-size:18px; padding:10px; border-radius: 8px; border: 1px solid #aaa; margin-bottom:10px;"/>
      <div id="calcButtons" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;">
        <button class="calcBtn">7</button>
        <button class="calcBtn">8</button>
        <button class="calcBtn">9</button>
        <button class="calcBtn">/</button>
        <button class="calcBtn">4</button>
        <button class="calcBtn">5</button>
        <button class="calcBtn">6</button>
        <button class="calcBtn">*</button>
        <button class="calcBtn">1</button>
        <button class="calcBtn">2</button>
        <button class="calcBtn">3</button>
        <button class="calcBtn">-</button>
        <button class="calcBtn">0</button>
        <button class="calcBtn">.</button>
        <button id="calcClear" class="calcBtn">C</button>
        <button class="calcBtn">+</button>
        <button id="calcEqual" style="grid-column: span 4; background:#007bff; color:#fff; font-weight:bold; border:none; border-radius:6px; padding:10px; cursor:pointer;">=</button>
      </div>
    `,
    init: () => {
      const display = document.getElementById("calcDisplay");
      const buttons = document.querySelectorAll("#calcButtons .calcBtn");
      const clearBtn = document.getElementById("calcClear");
      const equalBtn = document.getElementById("calcEqual");

      buttons.forEach(btn => {
        btn.onclick = () => {
          display.value += btn.textContent;
        };
      });

      clearBtn.onclick = () => {
        display.value = "";
      };

      equalBtn.onclick = () => {
        try {
          // Cálculo seguro: evitar eval inseguro
          // Só números, operadores básicos e ponto
          if(/^[0-9+\-*/.() ]+$/.test(display.value)){
            // eslint-disable-next-line no-eval
            const res = eval(display.value);
            display.value = res;
          } else {
            throw new Error("Expressão inválida");
          }
        } catch {
          display.value = "Erro";
          errorSound.play();
        }
      };
    }
  }
};

// Multiplicador de pontos por clique
let pointsMultiplier = 1;

// Atualizar pontos na interface
function updatePoints(){
  pointsLabel.textContent = points;
}

// Atualizar papel de parede
function updateWallpaper(){
  wallpaper.className = ""; // reset classes
  wallpaper.classList.add(`wallpaper-level-${wallpaperLevel}`);
}

// Atualizar blur de todas janelas abertas
function updateAllWindowsBlur(){
  windows.forEach(win => {
    win.element.classList.remove(...[...win.element.classList].filter(c => c.startsWith("blur-level-")));
    win.element.classList.add(`blur-level-${blurLevel}`);
  });
}

// Criar janela
function createWindow(appKey){
  if(!apps[appKey]) return;

  // Som clique
  clickSound.play();

  // Criar elemento da janela
  const win = document.createElement("div");
  win.classList.add("window", `blur-level-${blurLevel}`);
  win.style.top = "80px";
  win.style.left = "80px";
  win.style.width = "400px";
  win.style.height = "300px";
  win.style.zIndex = zIndexCounter++;

  // Conteúdo da janela
  win.innerHTML = `
    <div class="window-header" tabindex="0">
      <span class="window-title">${apps[appKey].title}</span>
      <div>
        <button class="btn-minimize" aria-label="Minimizar janela" title="Minimizar">—</button>
        <button class="btn-maximize" aria-label="Maximizar janela" title="Maximizar">⬜</button>
        <button class="btn-close" aria-label="Fechar janela" title="Fechar">×</button>
      </div>
    </div>
    <div class="window-body">${apps[appKey].content}</div>
    <div class="resizer"></div>
  `;

  windowsContainer.appendChild(win);

  // Inicializar app específico
  apps[appKey].init();

  // Adicionar à lista de janelas
  windows.push({element: win, appKey: appKey});

  // Focar janela ao clicar
  win.addEventListener("mousedown", () => focusWindow(win));

  // Drag da janela
  const header = win.querySelector(".window-header");
  header.style.cursor = "grab";

  header.addEventListener("mousedown", dragMouseDown);

  // Botões minimizar, maximizar e fechar
  const btnMin = win.querySelector(".btn-minimize");
  const btnMax = win.querySelector(".btn-maximize");
  const btnClose = win.querySelector(".btn-close");

  btnMin.onclick = (e) => {
    e.stopPropagation();
    win.style.display = "none";
  };

  btnMax.onclick = (e) => {
    e.stopPropagation();
    toggleMaximize(win);
  };

  btnClose.onclick = (e) => {
    e.stopPropagation();
    closeWindow(win);
  };

  // Resizer
  const resizer = win.querySelector(".resizer");
  resizer.addEventListener("mousedown", resizeMouseDown);

  // Focar ao abrir
  focusWindow(win);
}

// Focar janela e mandar pro topo
function focusWindow(win){
  if(activeWindow === win) return;
  activeWindow = win;
  windows.forEach(w => {
    w.element.style.zIndex = (w.element === win) ? zIndexCounter++ : 10;
  });
}

// Fechar janela
function closeWindow(win){
  windows = windows.filter(w => w.element !== win);
  win.remove();
  clickSound.play();
  activeWindow = null;
}

// Maximizar/restaurar janela
function toggleMaximize(win){
  if(win.classList.contains("maximized")){
    // Restaurar
    win.classList.remove("maximized");
    // Restaurar posição e tamanho anterior se salvo
    if(win.dataset.prevPos){
      const prev = JSON.parse(win.dataset.prevPos);
      win.style.top = prev.top;
      win.style.left = prev.left;
      win.style.width = prev.width;
      win.style.height = prev.height;
    }
  } else {
    // Salvar posição e tamanho atual
    win.dataset.prevPos = JSON.stringify({
      top: win.style.top,
      left: win.style.left,
      width: win.style.width,
      height: win.style.height,
    });
    // Maximizar
    win.classList.add("maximized");
    win.style.top = "0";
    win.style.left = "0";
    win.style.width = "100%";
    win.style.height = `calc(100% - 44px)`; // barra de tarefas
  }
}

// Drag janela
let dragData = null;
function dragMouseDown(e){
  e.preventDefault();
  const win = e.target.closest(".window");
  focusWindow(win);
  dragData = {
    win,
    startX: e.clientX,
    startY: e.clientY,
    startTop: parseInt(win.style.top),
    startLeft: parseInt(win.style.left),
  };
  document.addEventListener("mousemove", dragMouseMove);
  document.addEventListener("mouseup", dragMouseUp);
}
function dragMouseMove(e){
  if(!dragData) return;
  let newTop = dragData.startTop + (e.clientY - dragData.startY);
  let newLeft = dragData.startLeft + (e.clientX - dragData.startX);

  // Restringir para dentro da viewport
  newTop = Math.min(window.innerHeight - 100, Math.max(0, newTop));
  newLeft = Math.min(window.innerWidth - 100, Math.max(0, newLeft));

  dragData.win.style.top = newTop + "px";
  dragData.win.style.left = newLeft + "px";
}
function dragMouseUp(){
  dragData = null;
  document.removeEventListener("mousemove", dragMouseMove);
  document.removeEventListener("mouseup", dragMouseUp);
}

// Resize janela
let resizeData = null;
function resizeMouseDown(e){
  e.preventDefault();
  const win = e.target.closest(".window");
  focusWindow(win);
  resizeData = {
    win,
    startX: e.clientX,
    startY: e.clientY,
    startWidth: parseInt(window.getComputedStyle(win).width),
    startHeight: parseInt(window.getComputedStyle(win).height),
  };
  document.addEventListener("mousemove", resizeMouseMove);
  document.addEventListener("mouseup", resizeMouseUp);
}
function resizeMouseMove(e){
  if(!resizeData) return;
  let newWidth = resizeData.startWidth + (e.clientX - resizeData.startX);
  let newHeight = resizeData.startHeight + (e.clientY - resizeData.startY);

  newWidth = Math.max(280, Math.min(window.innerWidth - resizeData.win.offsetLeft, newWidth));
  newHeight = Math.max(180, Math.min(window.innerHeight - resizeData.win.offsetTop - 44, newHeight)); // - barra de tarefas

  resizeData.win.style.width = newWidth + "px";
  resizeData.win.style.height = newHeight + "px";
}
function resizeMouseUp(){
  resizeData = null;
  document.removeEventListener("mousemove", resizeMouseMove);
  document.removeEventListener("mouseup", resizeMouseUp);
}

// Mostrar notificações
function showNotification(text, duration=3500){
  const note = document.createElement("div");
  note.className = "notification";
  note.textContent = text;
  notifications.appendChild(note);
  notifySound.play();

  setTimeout(() => {
    note.style.opacity = 0;
    setTimeout(() => note.remove(), 500);
  }, duration);
}

// Atualizar relógio
function updateClock(){
  const now = new Date();
  const h = now.getHours().toString().padStart(2,"0");
  const m = now.getMinutes().toString().padStart(2,"0");
  const s = now.getSeconds().toString().padStart(2,"0");
  clockLabel.textContent = `${h}:${m}:${s}`;
}

// Inicializar boot screen (animação de inicialização)
function boot(){
  bootSound.play();
  let progress = 0;
  const interval = setInterval(() => {
    progress += 1 + Math.random()*3;
    if(progress >= 100){
      progress = 100;
      clearInterval(interval);
      bootScreen.classList.add("hidden");
      desktop.classList.remove("hidden");
      showNotification("Bem-vindo ao UpgradOS!");
    }
    bootProgress.style.width = progress + "%";
  }, 60);
}

// Abrir app da barra
function openApp(appKey){
  // Verifica se já está aberta
  const exists = windows.find(w => w.appKey === appKey);
  if(exists){
    exists.element.style.display = "flex";
    focusWindow(exists.element);
  } else {
    createWindow(appKey);
  }
}

// Eventos botão iniciar (toggle menu iniciar)
startButton.addEventListener("click", () => {
  const shown = !startMenu.classList.contains("hidden");
  if(shown){
    startMenu.classList.add("hidden");
  } else {
    startMenu.classList.remove("hidden");
  }
});

// Eventos ícones barra
document.querySelectorAll(".appIcon").forEach(btn => {
  btn.addEventListener("click", () => {
    openApp(btn.dataset.app);
  });
});

// Inicialização
updatePoints();
updateWallpaper();
updateAllWindowsBlur();
updateClock();
setInterval(updateClock, 1000);
boot();

