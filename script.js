// Variáveis globais e constantes
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
// const systemSound = document.getElementById('systemSound'); // removido para evitar erro

const bootSound = document.getElementById('bootSound');

let points = 0;
const maxLevel = 5;

// Upgrades com níveis de 0 a 5
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

let firstInteraction = false; // para o autoplay do áudio

// Boot sequence
bootSound.play().catch(() => {});
setTimeout(() => {
  bootScreen.classList.add('hidden');
  desktop.classList.remove('hidden');
  bootSound.pause();
  bootSound.currentTime = 0;
  updateUI();
}, 3000);

// Som play helper
function playSound(name) {
  try {
    if (name === 'click') clickSound.play();
    else if (name === 'error') errorSound.play();
    else if (name === 'notify') notifySound.play();
    // else if (name === 'system') systemSound.play(); // removido
  } catch {}
}

// Atualiza a UI geral
function updateUI() {
  pointsLabel.textContent = points;

  // Atualiza wallpaper conforme nível
  if (upgrades.wallpaper === 0) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp1854874.jpg')";
  else if (upgrades.wallpaper === 1) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  else if (upgrades.wallpaper === 2) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp10192012.jpg')";
  else if (upgrades.wallpaper === 3) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp9052173.jpg')";
  else if (upgrades.wallpaper >= 4) wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp5863691.jpg')";

  // Aplica blur aero nas janelas se upgrade ativo
  const windows = document.querySelectorAll('.window');
  if (upgrades.blur > 0) {
    windows.forEach(win => win.classList.add('blur'));
  } else {
    windows.forEach(win => win.classList.remove('blur'));
  }

  // Cursor customizado por nível
  document.body.classList.remove('cursor-level-1', 'cursor-level-2', 'cursor-level-3', 'cursor-level-4', 'cursor-level-5');
  if (upgrades.cursor > 0) {
    document.body.classList.add(`cursor-level-${upgrades.cursor}`);
  } else {
    document.body.style.cursor = 'auto';
  }

  // Transparência da taskbar
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

// Função para atualizar o player de música e evitar erro
function updateMusicPlayerUI() {
  const win = openWindows.get('winamp');
  if (!win) return;
  // Aqui pode atualizar UI do player se quiser, por enquanto vazio
}

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

// Notificações visuais
function notify(text) {
  const box = document.createElement('div');
  box.className = 'notification';
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Controle das janelas abertas
const openWindows = new Map();
let zIndexCounter = 100;

// Cria e abre janela do app
function createWindow(appName, title, contentHTML) {
  if (openWindows.has(appName)) {
    focusWindow(openWindows.get(appName));
    return;
  }
  const win = document.createElement('div');
  win.className = 'window';
  win.dataset.app = appName;
  win.dataset.upgradeWallpaperLevel = upgrades.wallpaper;
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

  // Drag and drop da janela
  dragElement(win, header);
}

// Focar janela para frente
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

// Função para arrastar janela
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
    setPosition();
  }

  function elementTouchDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.touches[0].clientX;
    pos2 = pos4 - e.touches[0].clientY;
    pos3 = e.touches[0].clientX;
    pos4 = e.touches[0].clientY;
    setPosition();
  }

  function setPosition() {
    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    // Limites da área de trabalho
    const desktopRect = desktop.getBoundingClientRect();
    const winRect = elmnt.getBoundingClientRect();

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + winRect.width > desktopRect.width) newLeft = desktopRect.width - winRect.width;
    if (newTop + winRect.height > desktopRect.height - taskbar.offsetHeight) newTop = desktopRect.height - taskbar.offsetHeight - winRect.height;

    elmnt.style.left = newLeft + 'px';
    elmnt.style.top = newTop + 'px';
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// Eventos dos ícones na barra
taskbarApps.querySelectorAll('.appIcon').forEach(btn => {
  btn.addEventListener('click', () => {
    playSound('click');
    const app = btn.getAttribute('data-app');
    openApp(app);
    // Marca ativo na barra
    taskbarApps.querySelectorAll('.appIcon').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

function openApp(appName) {
  if (appName === 'earn') openEarnApp();
  else if (appName === 'store') openStoreApp();
  else if (appName === 'notepad') openNotepadApp();
  else if (appName === 'winamp') openWinampApp();
  else notify('Aplicativo não encontrado.');
}

// App Ganhar Pontos
function openEarnApp() {
  const html = `
    <p>Clique no botão para ganhar pontos:</p>
    <button id="earnBtn">Ganhar 1 ponto</button>
  `;
  createWindow('earn', 'Ganhar Pontos', html);

  setTimeout(() => {
    const earnBtn = document.querySelector('.window[data-app="earn"] #earnBtn');
    if (!earnBtn) return;
    earnBtn.onclick = () => {
      points++;
      playSound('click');
      notify('Você ganhou 1 ponto!');
      updateUI();
    };
  }, 100);
}

// App Loja
function openStoreApp() {
  let html = '<p>Loja de Upgrades:</p><ul>';
  const pricesBase = {
    wallpaper: 10,
    blur: 15,
    cursor: 20,
    player: 25,
    taskbarTransparency: 15,
    systemSounds: 15,
    animations: 20,
  };

  Object.keys(upgrades).forEach(upg => {
    const lvl = upgrades[upg];
    if (lvl >= maxLevel) {
      html += `<li>${capitalize(upg)} (nível máximo)</li>`;
    } else {
      const price = pricesBase[upg] * (lvl + 1);
      html += `<li>${capitalize(upg)} - Nível ${lvl} <button class="buyBtn" data-upgrade="${upg}" data-price="${price}">Comprar por ${price} pontos</button></li>`;
    }
  });
  html += '</ul>';

  createWindow('store', 'Loja', html);

  setTimeout(() => {
    document.querySelectorAll('.buyBtn').forEach(btn => {
      btn.onclick = () => {
        const upg = btn.getAttribute('data-upgrade');
        const price = Number(btn.getAttribute('data-price'));
        if (points >= price) {
          points -= price;
          upgrades[upg]++;
          playSound('notify');
          notify(`Upgrade ${capitalize(upg)} comprado! Agora no nível ${upgrades[upg]}`);
          updateUI();
          openStoreApp(); // atualiza a loja
        } else {
          playSound('error');
          notify('Pontos insuficientes!');
        }
      };
    });
  }, 100);
}

// App Notepad simples
function openNotepadApp() {
  const html = `
    <p>Escreva algo aqui:</p>
    <textarea style="width:100%; height: 150px;"></textarea>
  `;
  createWindow('notepad', 'Notepad', html);
}

// Player de música
let currentTrackIndex = 0;
let isPlaying = false;
let audio = null;

function openWinampApp() {
  const html = `
    <div class="music-player">
      <div class="music-controls">
        <button id="prevBtn" aria-label="Música anterior">⏮</button>
        <button id="playPauseBtn" aria-label="Tocar/Pausar">▶️</button>
        <button id="nextBtn" aria-label="Próxima música">⏭</button>
      </div>
      <div id="currentTrack" aria-live="polite" style="text-align:center; margin-bottom: 6px;">Nenhuma música</div>
      <div class="music-list" role="list"></div>
    </div>
  `;
  createWindow('winamp', 'Winamp', html);

  setTimeout(() => {
    audio = new Audio();
    audio.src = musicFiles[currentTrackIndex];
    audio.preload = 'auto';

    const currentTrackEl = document.getElementById('currentTrack');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const musicListDiv = document.querySelector('.music-list');

    function updateCurrentTrack() {
      currentTrackEl.textContent = musicNames[currentTrackIndex];
      audio.src = musicFiles[currentTrackIndex];
      if (isPlaying) audio.play().catch(() => {});
      updateMusicListHighlight();
    }

    function updateMusicListHighlight() {
      const buttons = musicListDiv.querySelectorAll('button');
      buttons.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === currentTrackIndex);
      });
    }

    playPauseBtn.onclick = () => {
      if (!firstInteraction) {
        firstInteraction = true; // usuário interagiu
      }
      if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playPauseBtn.textContent = '▶️';
      } else {
        audio.play().catch(() => {});
        isPlaying = true;
        playPauseBtn.textContent = '⏸';
      }
    };

    prevBtn.onclick = () => {
      currentTrackIndex = (currentTrackIndex - 1 + musicFiles.length) % musicFiles.length;
      updateCurrentTrack();
    };
    nextBtn.onclick = () => {
      currentTrackIndex = (currentTrackIndex + 1) % musicFiles.length;
      updateCurrentTrack();
    };

    musicListDiv.innerHTML = '';
    musicNames.forEach((name, i) => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.setAttribute('role', 'listitem');
      btn.onclick = () => {
        currentTrackIndex = i;
        updateCurrentTrack();
      };
      musicListDiv.appendChild(btn);
    });

    updateCurrentTrack();
  }, 100);
}

// Atualiza botão ganhar pontos (com upgrade)
function updatePointsButtons() {
  const earnWin = openWindows.get('earn');
  if (!earnWin) return;
  const btn = earnWin.querySelector('#earnBtn');
  if (!btn) return;

  const earnLevel = upgrades.earn || 0;
  btn.textContent = `Ganhar ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}`;
  btn.onclick = () => {
    points += earnLevel + 1;
    playSound('click');
    notify(`Você ganhou ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}!`);
    updateUI();
  };
}

// Capitaliza string
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Eventos do botão iniciar menu
startButton.onclick = () => {
  const startMenu = document.getElementById('startMenu');
  startMenu.classList.toggle('hidden');
  playSound('click');
};

// Fecha menu iniciar ao clicar fora
document.addEventListener('click', (e) => {
  const startMenu = document.getElementById('startMenu');
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add('hidden');
  }
});

// Atualiza relógio inicial
updateClock();
// Atualiza UI inicial
updateUI();
