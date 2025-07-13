// Referências DOM
const bootScreen = document.getElementById('bootScreen');
const desktop = document.getElementById('desktop');
const wallpaper = document.getElementById('wallpaper');
const windowsContainer = document.getElementById('windowsContainer');
const taskbar = document.getElementById('taskbar');
const taskbarApps = document.getElementById('taskbarApps');
const startButton = document.getElementById('startButton');
const notifications = document.getElementById('notifications');
const pointsLabel = document.getElementById('points');
const clockEl = document.getElementById('clock');

const clickSound = document.getElementById('clickSound');
const errorSound = document.getElementById('errorSound');
const notifySound = document.getElementById('notifySound');
const bootSound = document.getElementById('bootSound');

let points = 0;
const maxLevel = 5;

// Upgrades
const upgrades = {
  wallpaper: 0,
  blur: 0,
  cursor: 0,
  player: 0,
  taskbarTransparency: 0,
  systemSounds: 0,
  animations: 0,
  earn: 0,
};

// Música para o player
const musicFiles = [
  'sounds/music/track1.mp3',
  'sounds/music/track2.mp3',
  'sounds/music/track3.mp3',
];
const musicNames = ['Track 1', 'Track 2', 'Track 3'];

let firstInteraction = false;

// Função para iniciar boot após interação
function startBootSequence() {
  bootSound.play().catch(() => {});
  setTimeout(() => {
    bootScreen.classList.add('hidden');
    desktop.classList.remove('hidden');
    bootSound.pause();
    bootSound.currentTime = 0;
    updateUI();
  }, 3000);
}

// Espera interação do usuário
document.body.addEventListener('click', function handler() {
  document.body.removeEventListener('click', handler);
  startBootSequence();
});

// Som helper
function playSound(name) {
  try {
    if (name === 'click') clickSound.play();
    else if (name === 'error') errorSound.play();
    else if (name === 'notify') notifySound.play();
  } catch {}
}

// Atualiza UI geral
function updateUI() {
  pointsLabel.textContent = points;

  // Wallpaper conforme nível
  if (upgrades.wallpaper === 0) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp1854874.jpg')";
  else if (upgrades.wallpaper === 1) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  else if (upgrades.wallpaper === 2) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp10192012.jpg')";
  else if (upgrades.wallpaper === 3) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp9052173.jpg')";
  else if (upgrades.wallpaper >= 4) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp5863691.jpg')";

  // Blur aero nas janelas
  const windows = document.querySelectorAll('.window');
  if (upgrades.blur > 0) {
    windows.forEach(win => win.classList.add('blur'));
  } else {
    windows.forEach(win => win.classList.remove('blur'));
  }

  // Cursor customizado
  document.body.classList.remove('cursor-level-1', 'cursor-level-2', 'cursor-level-3', 'cursor-level-4', 'cursor-level-5');
  if (upgrades.cursor > 0) {
    document.body.classList.add(`cursor-level-${upgrades.cursor}`);
  } else {
    document.body.style.cursor = 'auto';
  }

  // Transparência taskbar
  taskbar.classList.remove(
    'taskbar-transparent-1',
    'taskbar-transparent-2',
    'taskbar-transparent-3',
    'taskbar-transparent-4',
    'taskbar-transparent-5'
  );
  if (upgrades.taskbarTransparency > 0) {
    taskbar.classList.add(`taskbar-transparent-${upgrades.taskbarTransparency}`);
  }

  // Animações taskbar
  if (upgrades.animations > 0) {
    taskbar.style.boxShadow = '0 0 10px #00d8ff';
  } else {
    taskbar.style.boxShadow = 'none';
  }

  updateMusicPlayerUI();
  updatePointsButtons();
}

// Atualiza relógio sem segundos
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  clockEl.textContent = `${h}:${m}`;
  setTimeout(updateClock, 60000);
}

// Notificações
function notify(text) {
  const box = document.createElement('div');
  box.className = 'notification';
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Controle janelas abertas
const openWindows = new Map();
let zIndexCounter = 100;

// Cria janela app
function createWindow(appName, title, contentHTML) {
  if (openWindows.has(appName)) {
    focusWindow(openWindows.get(appName));
    return;
  }
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.app = appName;
  win.style.left = '50px';
  win.style.top = '50px';
  win.tabIndex = 0;

  const header = document.createElement('div');
  header.className = 'window-header';
  header.textContent = title;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Fechar janela');
  closeBtn.onclick = () => {
    win.remove();
    openWindows.delete(appName);
  };

  header.appendChild(closeBtn);
  win.appendChild(header);

  const body = document.createElement('div');
  body.className = 'window-body';
  body.innerHTML = contentHTML;
  win.appendChild(body);

  windowsContainer.appendChild(win);
  openWindows.set(appName, win);
  focusWindow(win);

  // Drag and drop
  dragElement(win, header);
}

// Foca janela
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

// Arrastar janela
function dragElement(elmnt, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  dragHandle.style.cursor = 'move';

  dragHandle.onmousedown = dragMouseDown;
  dragHandle.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
    focusWindow(elmnt);
  }

  function dragTouchStart(e) {
    e.preventDefault();
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementTouchDrag;
    focusWindow(elmnt);
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function elementTouchDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// Abre app pelo ícone da taskbar
taskbarApps.querySelectorAll('.appIcon').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('click');
    openApp(btn.dataset.app);
  });
});

// Abre apps
function openApp(name) {
  switch(name) {
    case 'earn':
      openEarnApp();
      break;
    case 'store':
      openStoreApp();
      break;
    case 'notepad':
      openNotepadApp();
      break;
    case 'winamp':
      openWinampApp();
      break;
  }
}

// App Ganhar Pontos
function openEarnApp() {
  createWindow('earn', 'Ganhar Pontos', `
    <button id="earnBtn">Clique para ganhar pontos</button>
  `);
  const earnBtn = document.getElementById('earnBtn');
  earnBtn.onclick = () => {
    points++;
    notify('Você ganhou 1 ponto!');
    updateUI();
    playSound('notify');
  };
}

// App Loja Upgrades
function openStoreApp() {
  const upgradeNames = Object.keys(upgrades);
  let html = '<div>';
  upgradeNames.forEach(name => {
    const lvl = upgrades[name];
    if (lvl >= maxLevel) {
      html += `<div>${capitalize(name)}: Nível máximo</div>`;
    } else {
      const price = (lvl + 1) * 5;
      html += `
      <div>
        ${capitalize(name)}: Nível ${lvl}
        <button class="buyBtn" data-upgrade="${name}" data-price="${price}">Comprar Upgrade (${price} pontos)</button>
      </div>`;
    }
  });
  html += '</div>';

  createWindow('store', 'Loja de Upgrades', html);

  document.querySelectorAll('.buyBtn').forEach(btn => {
    btn.disabled = points < Number(btn.getAttribute('data-price'));
    btn.onclick = () => {
      const upgrade = btn.getAttribute('data-upgrade');
      const price = Number(btn.getAttribute('data-price'));
      if (points >= price && upgrades[upgrade] < maxLevel) {
        points -= price;
        upgrades[upgrade]++;
        notify(`Upgrade de ${capitalize(upgrade)} para nível ${upgrades[upgrade]} comprado!`);
        updateUI();
        openWindows.get('store').remove();
        openStoreApp();
        playSound('click');
      } else {
        playSound('error');
      }
    };
  });
}

// Notepad app simples
function openNotepadApp() {
  createWindow('notepad', 'Notepad', `
    <textarea style="width: 100%; height: 100%; background: #222; color: white; border: none; resize: none; padding: 8px;" placeholder="Digite aqui..."></textarea>
  `);
}

// Winamp app simples com player e upgrades
let currentTrackIndex = 0;
let audio = null;

function openWinampApp() {
  const musicListHtml = musicNames.map((name, i) => 
    `<button data-index="${i}" class="${i === currentTrackIndex ? 'active' : ''}">${name}</button>`
  ).join('');

  createWindow('winamp', 'Winamp', `
    <div class="music-player">
      <div class="music-controls">
        <button id="prevTrack">⏮️</button>
        <button id="playPause">▶️</button>
        <button id="nextTrack">⏭️</button>
      </div>
      <div class="music-list">${musicListHtml}</div>
      <div>Upgrades do Player: Nível ${upgrades.player}</div>
    </div>
  `);

  const winampWin = openWindows.get('winamp');

  const playPauseBtn = winampWin.querySelector('#playPause');
  const prevBtn = winampWin.querySelector('#prevTrack');
  const nextBtn = winampWin.querySelector('#nextTrack');
  const musicListButtons = winampWin.querySelectorAll('.music-list button');

  if (audio) {
    audio.pause();
    audio = null;
  }
  audio = new Audio(musicFiles[currentTrackIndex]);
  audio.volume = 0.3;

  function playMusic() {
    audio.play();
    playPauseBtn.textContent = '⏸️';
  }

  function pauseMusic() {
    audio.pause();
    playPauseBtn.textContent = '▶️';
  }

  playPauseBtn.onclick = () => {
    if (audio.paused) playMusic();
    else pauseMusic();
  };
  prevBtn.onclick = () => {
    currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
    switchTrack();
  };
  nextBtn.onclick = () => {
    currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
    switchTrack();
  };

  musicListButtons.forEach(btn => {
    btn.onclick = () => {
      currentTrackIndex = Number(btn.getAttribute('data-index'));
      switchTrack();
    };
  });

  function switchTrack() {
    audio.pause();
    audio = new Audio(musicFiles[currentTrackIndex]);
    audio.volume = 0.3;
    playMusic();
    updateMusicPlayerUI();
  }

  updateMusicPlayerUI();
}

function updateMusicPlayerUI() {
  const winampWin = openWindows.get('winamp');
  if (!winampWin) return;
  const musicListButtons = winampWin.querySelectorAll('.music-list button');
  musicListButtons.forEach(btn => btn.classList.remove('active'));
  musicListButtons[currentTrackIndex].classList.add('active');
}

// Atualiza botão de compra
function updatePointsButtons() {
  document.querySelectorAll('.buyBtn').forEach(btn => {
    const price = Number(btn.getAttribute('data-price'));
    btn.disabled = points < price;
  });
}

// Capitalizar texto
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Atualiza o relógio a cada minuto
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  clockEl.textContent = `${h}:${m}`;
  setTimeout(updateClock, 60000);
}

// Inicializa relógio
updateClock();

// Inicializa UI sem mostrar desktop até boot acabar
function updateUI() {
  pointsLabel.textContent = points;

  // Atualiza wallpaper conforme nível
  if (upgrades.wallpaper === 0) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp1854874.jpg')";
  else if (upgrades.wallpaper === 1) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  else if (upgrades.wallpaper === 2) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp10192012.jpg')";
  else if (upgrades.wallpaper === 3) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp9052173.jpg')";
  else if (upgrades.wallpaper >= 4) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp5863691.jpg')";

  // Blur aero janelas
  const windows = document.querySelectorAll('.window');
  if (upgrades.blur > 0) {
    windows.forEach(win => win.classList.add('blur'));
  } else {
    windows.forEach(win => win.classList.remove('blur'));
  }

  // Cursor
  document.body.classList.remove('cursor-level-1', 'cursor-level-2', 'cursor-level-3', 'cursor-level-4', 'cursor-level-5');
  if (upgrades.cursor > 0) {
    document.body.classList.add(`cursor-level-${upgrades.cursor}`);
  } else {
    document.body.style.cursor = 'auto';
  }

  // Transparência taskbar
  taskbar.classList.remove(
    'taskbar-transparent-1',
    'taskbar-transparent-2',
    'taskbar-transparent-3',
    'taskbar-transparent-4',
    'taskbar-transparent-5'
  );
  if (upgrades.taskbarTransparency > 0) {
    taskbar.classList.add(`taskbar-transparent-${upgrades.taskbarTransparency}`);
  }

  // Animações taskbar
  if (upgrades.animations > 0) {
    taskbar.style.boxShadow = '0 0 10px #00d8ff';
  } else {
    taskbar.style.boxShadow = 'none';
  }

  updateMusicPlayerUI();
  updatePointsButtons();
}

// Notificações
function notify(text) {
  const box = document.createElement('div');
  box.className = 'notification';
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Som helper
function playSound(name) {
  try {
    if (name === 'click') clickSound.play();
    else if (name === 'error') errorSound.play();
    else if (name === 'notify') notifySound.play();
  } catch {}
}
