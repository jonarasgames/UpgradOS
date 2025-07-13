// Elementos DOM
const bootScreen = document.getElementById('bootScreen');
const wallpaper = document.getElementById('wallpaper');
const desktop = document.getElementById('desktop');
const windowsContainer = document.getElementById('windowsContainer');
const taskbar = document.getElementById('taskbar');
const taskbarApps = document.getElementById('taskbarApps');
const pointsLabel = document.getElementById('points');
const clockEl = document.getElementById('clock');
const notifications = document.getElementById('notifications');

const clickSound = document.getElementById('clickSound');
const errorSound = document.getElementById('errorSound');
const notifySound = document.getElementById('notifySound');
const bootSound = document.getElementById('bootSound');

let points = 0;
const maxLevel = 5;
const upgrades = {
  wallpaper: 0,
  blur: 0,
  cursor: 0,
  taskbarTransparency: 0,
  animations: 0,
  player: 0,
};

const musicFiles = [
  'sounds/music/track1.mp3',
  'sounds/music/track2.mp3',
  'sounds/music/track3.mp3'
];
const musicNames = [
  'Track 1',
  'Track 2',
  'Track 3',
];

// Controle janelas abertas (mantém as janelas abertas e controla foco)
const openWindows = new Map();
let zIndexCounter = 100;

// Função para capitalizar texto
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Tela boot: animar barra e esconder após 4s
const progressBar = bootScreen.querySelector('.progress');
progressBar.style.width = '0%';
progressBar.style.animation = 'progressAnim 4s linear forwards';

setTimeout(() => {
  bootSound.play().catch(() => {});
}, 4000);

setTimeout(() => {
  bootScreen.classList.add('hidden');
  desktop.classList.remove('hidden');
  updateUI();
}, 4100);

// Atualiza o relógio (sem segundos)
function updateClock() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  clockEl.textContent = `${h}:${m}`;
  setTimeout(updateClock, 60000);
}
updateClock();

// Atualiza a interface (pontos, wallpaper, efeitos, cursor, taskbar)
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

  // Cursor upgrades
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
  playSound('notify'); // Som de notificação tocando
  setTimeout(() => box.remove(), 4000);
}

// Som helper
function playSound(name) {
  try {
    if (name === 'click') {
      clickSound.currentTime = 0;
      clickSound.play();
    } else if (name === 'error') {
      errorSound.currentTime = 0;
      errorSound.play();
    } else if (name === 'notify') {
      notifySound.currentTime = 0;
      notifySound.play();
    }
  } catch {}
}

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
  openWindows.set(appName, win);  // Garantir controle janela

  focusWindow(win);

  // Drag and drop
  dragElement(win, header);
}

// Foco janela
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
  win.focus();
}

// Drag and drop para janelas
function dragElement(elmnt, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

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
    const touch = e.touches[0];
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementDragTouch;
    focusWindow(elmnt);
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    setPosition(elmnt, elmnt.offsetLeft - pos1, elmnt.offsetTop - pos2);
  }

  function elementDragTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    setPosition(elmnt, elmnt.offsetLeft - pos1, elmnt.offsetTop - pos2);
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }

  function setPosition(elmnt, x, y) {
    // limites para não sair da tela
    const desktopRect = desktop.getBoundingClientRect();
    const winRect = elmnt.getBoundingClientRect();
    if (x < 0) x = 0;
    else if (x + winRect.width > desktopRect.width) x = desktopRect.width - winRect.width;
    if (y < 0) y = 0;
    else if (y + winRect.height > desktopRect.height - taskbar.offsetHeight) y = desktopRect.height - taskbar.offsetHeight - winRect.height;

    elmnt.style.left = x + 'px';
    elmnt.style.top = y + 'px';
  }
}

// Atualiza botões compra loja
function updatePointsButtons() {
  document.querySelectorAll('.buyBtn').forEach(btn => {
    const price = Number(btn.getAttribute('data-price'));
    btn.disabled = points < price;
  });
}

// Abrir apps fixos barra
taskbarApps.querySelectorAll('.appIcon').forEach(btn => {
  btn.addEventListener('click', () => {
    const appName = btn.getAttribute('data-app');
    openApp(appName);
    playSound('click');
  });
});

// Abrir app principal
function openApp(name) {
  switch (name) {
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
    default:
      notify('App não implementado ainda!');
  }
}

// App Ganhar pontos
function openEarnApp() {
  const html = `
    <p>Clique no botão para ganhar pontos!</p>
    <button id="gainPointsBtn">Ganhar 1 ponto</button>
  `;
  createWindow('earn', 'Ganhar Pontos', html);
  const btn = document.querySelector('#gainPointsBtn');
  btn.onclick = () => {
    points++;
    notify('Você ganhou 1 ponto!');
    playSound('notify');
    updateUI();
  };
}

// App Loja upgrades
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

  if (openWindows.has('store')) {
    const win = openWindows.get('store');
    const body = win.querySelector('.window-body');
    body.innerHTML = html;
    focusWindow(win);
  } else {
    createWindow('store', 'Loja de Upgrades', html);
  }

  document.querySelectorAll('.buyBtn').forEach(btn => {
    btn.disabled = points < Number(btn.getAttribute('data-price'));
    btn.onclick = () => {
      const upgrade = btn.getAttribute('data-upgrade');
      const price = Number(btn.getAttribute('data-price'));
      if (points >= price && upgrades[upgrade] < maxLevel) {
        points -= price;
        upgrades[upgrade]++;
        notify(`Upgrade de ${capitalize(upgrade)} para nível ${upgrades[upgrade]} comprado!`);
        playSound('notify');
        updateUI();
        openStoreApp();
        playSound('click');
      } else {
        playSound('error');
      }
    };
  });
}

// App Notepad
function openNotepadApp() {
  const html = `<textarea placeholder="Escreva suas notas aqui..."></textarea>`;
  createWindow('notepad', 'Notepad', html);
}

// App Winamp (player de música)
let currentTrackIndex = 0;
let audioPlayer;

function openWinampApp() {
  let html = `<div>
    <div>
      <button id="prevTrackBtn">⏮</button>
      <button id="playPauseBtn">▶️</button>
      <button id="nextTrackBtn">⏭</button>
    </div>
    <div class="music-list">`;

  musicNames.forEach((name, i) => {
    html += `<button data-index="${i}"${i === currentTrackIndex ? ' class="active"' : ''}>${name}</button>`;
  });
  html += '</div></div>';

  createWindow('winamp', 'Winamp - Player de Música', html);

  if (!audioPlayer) {
    audioPlayer = new Audio();
    audioPlayer.onended = () => {
      nextTrack();
    };
  }

  updateMusicPlayerUI();

  document.getElementById('playPauseBtn').onclick = () => {
    if (audioPlayer.paused) {
      audioPlayer.play().catch(() => {});
      playSound('click');
      updateMusicPlayerUI();
    } else {
      audioPlayer.pause();
      playSound('click');
      updateMusicPlayerUI();
    }
  };
  document.getElementById('prevTrackBtn').onclick = () => {
    prevTrack();
    playSound('click');
  };
  document.getElementById('nextTrackBtn').onclick = () => {
    nextTrack();
    playSound('click');
  };

  document.querySelectorAll('.music-list button').forEach(btn => {
    btn.onclick = () => {
      currentTrackIndex = Number(btn.getAttribute('data-index'));
      audioPlayer.src = musicFiles[currentTrackIndex];
      audioPlayer.play().catch(() => {});
      updateMusicPlayerUI();
      playSound('click');
    };
  });
}

function updateMusicPlayerUI() {
  const playPauseBtn = document.getElementById('playPauseBtn');
  if (!playPauseBtn) return;

  if (audioPlayer.paused) {
    playPauseBtn.textContent = '▶️';
  } else {
    playPauseBtn.textContent = '⏸';
  }

  const buttons = document.querySelectorAll('.music-list button');
  buttons.forEach((btn, i) => {
    if (i === currentTrackIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function nextTrack() {
  currentTrackIndex++;
  if (currentTrackIndex >= musicFiles.length) currentTrackIndex = 0;
  audioPlayer.src = musicFiles[currentTrackIndex];
  audioPlayer.play().catch(() => {});
  updateMusicPlayerUI();
}

function prevTrack() {
  currentTrackIndex--;
  if (currentTrackIndex < 0) currentTrackIndex = musicFiles.length - 1;
  audioPlayer.src = musicFiles[currentTrackIndex];
  audioPlayer.play().catch(() => {});
  updateMusicPlayerUI();
}

// Inicializa a UI e eventos
updateUI();
