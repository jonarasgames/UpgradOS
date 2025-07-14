// Seletores principais
const wallpaper = document.getElementById('wallpaper');
const windowsContainer = document.getElementById('windowsContainer');
const pointsLabel = document.getElementById('points');
const notifications = document.getElementById('notifications');
const clickSound = document.getElementById('clickSound');
const errorSound = document.getElementById('errorSound');
const notifySound = document.getElementById('notifySound');
const bootSound = document.getElementById('bootSound');
const store = document.getElementById('store');
const storeList = document.getElementById('storeList');

let points = 0;
const windows = []; // Armazena objetos {appKey, element}

/** Estado dos upgrades */
const upgradesState = {
  wallpaper: 0,
  blur: 0,
  cursor: 0,
  player: 0,
};

/** Custos por upgrade e nível */
const upgradeCosts = {
  wallpaper: [0, 10, 20, 40, 60, 100],
  blur:      [0, 15, 30, 50, 70, 120],
  cursor:    [0, 10, 25, 45, 70, 110],
  player:    [0, 10, 25, 50, 75, 120],
};

/** Aplicativos e seus conteúdos (exemplo básico) */
const appsContent = {
  winamp: `<div class="winamp-window">
    <h3>Winamp Player</h3>
    <audio controls>
      <source src="music/sample.mp3" type="audio/mpeg" />
      Seu navegador não suporta áudio.
    </audio>
  </div>`,
  notepad: `<div><h3>Notepad</h3><textarea rows="10" cols="30" placeholder="Escreva aqui..."></textarea></div>`,
  earn: `<div><h3>Ganhar Pontos</h3><button id="earnPointsBtn">Ganhar 5 pontos</button></div>`,
  store: `<div><h3>Loja</h3><p>Use os pontos para comprar upgrades.</p><div id="storeList"></div></div>`,
  bet: `<div><h3>Bahze</h3><p>Jogo de apostas (em breve)</p></div>`,
  calculator: `<div><h3>Calculadora</h3><input type="text" placeholder="0" disabled id="calcDisplay"><br>
    <button id="calcClear">C</button> <button id="calcAdd">+</button> <button id="calcEquals">=</button>
  </div>`,
};

/** Cria uma nova janela no desktop */
function openApp(appKey) {
  if (windows.some(w => w.appKey === appKey)) {
    showNotification(`Aplicativo ${appKey} já aberto.`);
    return;
  }

  const win = document.createElement('div');
  win.classList.add('window', `blur-level-${upgradesState.blur}`);
  win.dataset.appKey = appKey;
  win.style.top = `${50 + windows.length * 30}px`;
  win.style.left = `${50 + windows.length * 30}px`;
  win.style.width = '300px';
  win.style.height = '220px';
  win.style.zIndex = 10 + windows.length;

  // Conteúdo da janela
  win.innerHTML = appsContent[appKey] || `<p>App ${appKey} não encontrado.</p>`;

  // Se app for winamp, adicionar classe visual nível player
  if (appKey === 'winamp') {
    win.classList.add(`winamp-player-level-${upgradesState.player}`);
  }

  windowsContainer.appendChild(win);

  windows.push({ appKey, element: win });

  // Eventos especiais para apps
  if(appKey === 'earn'){
    const earnBtn = win.querySelector('#earnPointsBtn');
    earnBtn.onclick = () => {
      points += 5 * (upgradesState.player + 1); // bônus player
      updatePoints();
      showNotification(`Você ganhou 5 pontos!`);
      clickSound.play();
    }
  }

  // Implementar drag simples (opcional)
  makeDraggable(win);

  showNotification(`Aplicativo ${appKey} aberto.`);
}

/** Fecha a janela do app */
function closeApp(appKey) {
  const index = windows.findIndex(w => w.appKey === appKey);
  if(index === -1) return;
  windowsContainer.removeChild(windows[index].element);
  windows.splice(index, 1);
  showNotification(`Aplicativo ${appKey} fechado.`);
}

/** Atualiza a exibição de pontos */
function updatePoints(){
  pointsLabel.textContent = points;
  renderStore();
}

/** Mostra notificações temporárias */
function showNotification(text) {
  notifications.textContent = text;
  notifications.classList.add('show');
  notifySound.play();
  setTimeout(() => {
    notifications.classList.remove('show');
  }, 3500);
}

/** Atualiza papel de parede com base no nível */
function updateWallpaper(){
  for(let i=0; i<=5; i++){
    wallpaper.classList.remove(`wallpaper-level-${i}`);
  }
  wallpaper.classList.add(`wallpaper-level-${upgradesState.wallpaper}`);

  // Ativa/desativa efeito interativo nível 5
  if(upgradesState.wallpaper === 5){
    wallpaper.style.backgroundPosition = 'center';
    wallpaper.addEventListener('mousemove', wallpaperMouseMove);
  } else {
    wallpaper.style.backgroundPosition = 'center';
    wallpaper.removeEventListener('mousemove', wallpaperMouseMove);
  }
}

/** Função para efeito interativo wallpaper nível 5 */
function wallpaperMouseMove(e){
  const x = e.clientX / window.innerWidth - 0.5;
  const y = e.clientY / window.innerHeight - 0.5;
  wallpaper.style.backgroundPosition = `${50 + x * 10}% ${50 + y * 10}%`;
}

/** Atualiza todas as janelas com o blur correto */
function updateAllWindowsBlur(){
  windows.forEach(win => {
    for(let i=0; i<=5; i++){
      win.element.classList.remove(`blur-level-${i}`);
    }
    win.element.classList.add(`blur-level-${upgradesState.blur}`);
  });
}

/** Atualiza cursor */
function updateCursor(){
  for(let i=0; i<=5; i++){
    document.body.classList.remove(`cursor-level-${i}`);
  }
  document.body.classList.add(`cursor-level-${upgradesState.cursor}`);
}

/** Atualiza player */
function updatePlayerWindow(){
  const playerWin = windows.find(w => w.appKey === "winamp");
  if(!playerWin) return;
  for(let i=0; i<=5; i++){
    playerWin.element.classList.remove(`winamp-player-level-${i}`);
  }
  playerWin.element.classList.add(`winamp-player-level-${upgradesState.player}`);
}

/** Tenta comprar um upgrade */
function tryUpgrade(type){
  if(upgradesState[type] >= 5) {
    showNotification(`Upgrade de ${type} já está no nível máximo!`);
    errorSound.play();
    return;
  }
  const nextLevel = upgradesState[type] + 1;
  const cost = upgradeCosts[type][nextLevel];
  if(points < cost){
    showNotification(`Pontos insuficientes para upgrade de ${type}! Custo: ${cost}`);
    errorSound.play();
    return;
  }
  points -= cost;
  upgradesState[type] = nextLevel;
  updatePoints();
  showNotification(`Upgrade de ${type} para nível ${nextLevel} concluído!`);
  clickSound.play();

  // Atualiza visuais
  switch(type){
    case "wallpaper": updateWallpaper(); break;
    case "blur": updateAllWindowsBlur(); break;
    case "cursor": updateCursor(); break;
    case "player": updatePlayerWindow(); break;
  }
}

/** Renderiza a lista da loja */
function renderStore(){
  storeList.innerHTML = "";
  const upgrades = [
    { id: "wallpaper", name: "Melhorar Papel de Parede" },
    { id: "blur", name: "Melhorar Desfoque nas Janelas" },
    { id: "cursor", name: "Melhorar Cursor" },
    { id: "player", name: "Melhorar Player de Música" },
  ];

  upgrades.forEach(upg => {
    const currentLevel = upgradesState[upg.id];
    const nextLevel = currentLevel + 1;
    const cost = nextLevel <= 5 ? upgradeCosts[upg.id][nextLevel] : null;

    const btn = document.createElement("button");
    btn.textContent = cost
      ? `${upg.name} (Nível ${currentLevel}) → Nível ${nextLevel} - Custo: ${cost} pontos`
      : `${upg.name} (Nível ${currentLevel}) - Máximo nível atingido`;
    btn.disabled = !cost || points < cost;
    btn.style.marginBottom = "8px";
    btn.style.padding = "10px";
    btn.style.width = "100%";
    btn.style.borderRadius = "8px";
    btn.style.border = "none";
    btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
    btn.style.backgroundColor = btn.disabled ? "#555" : "#007bff";
    btn.style.color = btn.disabled ? "#aaa" : "#fff";
    btn.onclick = () => {
      tryUpgrade(upg.id);
      renderStore();
    };

    storeList.appendChild(btn);
  });
}

/** Faz uma janela ser arrastável (drag) */
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;

  el.addEventListener('mousedown', e => {
    isDragging = true;
    offsetX = e.clientX - el.offsetLeft;
    offsetY = e.clientY - el.offsetTop;
    el.style.zIndex = 1000; // traz pra frente
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    // limitar dentro da tela
    x = Math.min(window.innerWidth - el.offsetWidth, Math.max(0, x));
    y = Math.min(window.innerHeight - el.offsetHeight - 40, Math.max(0, y)); // menos taskbar
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

/** Atualiza o relógio na taskbar */
function updateClock(){
  const clock = document.getElementById('clock');
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  clock.textContent = `${h}:${m}:${s}`;
}

/** Inicializa app */
function init() {
  // Mostra boot e progress bar animada
  const bootScreen = document.getElementById('bootScreen');
  const desktop = document.getElementById('desktop');
  let progress = 0;
  const progressBar = document.querySelector('.progress');
  bootSound.play();

  const interval = setInterval(() => {
    progress += 5;
    progressBar.style.width = `${progress}%`;
    if(progress >= 100){
      clearInterval(interval);
      bootScreen.style.display = 'none';
      desktop.classList.remove('hidden');
      updatePoints();
      updateWallpaper();
      updateAllWindowsBlur();
      updateCursor();
      updatePlayerWindow();
      updateClock();
      setInterval(updateClock, 1000);
    }
  }, 150);

  // Eventos da taskbar
  document.getElementById('taskbarApps').addEventListener('click', e => {
    if(e.target.matches('button.appIcon')){
      const appKey = e.target.dataset.app;
      if(appKey === 'store'){
        store.classList.toggle('hidden');
        if(!store.classList.contains('hidden')) renderStore();
      } else {
        store.classList.add('hidden');
        openApp(appKey);
      }
      clickSound.play();
    }
  });

  // Start button (simples)
  document.getElementById('startButton').addEventListener('click', () => {
    alert('Menu Iniciar em construção.');
    clickSound.play();
  });
}

window.onload = init;
