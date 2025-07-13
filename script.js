// Variáveis globais
let points = 0;
const maxLevel = 5;
const upgrades = {
  wallpaper: 0,
  blur: 0,
  cursor: 0,
  player: 0,
  taskbarTransparency: 0,
  systemSounds: 0,
  animations: 0,
};

const musicFiles = [
  'sounds/music/song1.mp3',
  'sounds/music/song2.mp3',
  'sounds/music/song3.mp3'
];
const musicNames = [
  'Fruitger Song 1',
  'Fruitger Song 2',
  'Fruitger Song 3'
];

// Sons
const clickSound = document.getElementById('clickSound');
const errorSound = document.getElementById('errorSound');
const notifySound = document.getElementById('notifySound');
const bootSound = document.getElementById('bootSound');
const systemSound = document.getElementById('systemSound');

const pointsDisplay = document.getElementById('points');
const wallpaper = document.getElementById('wallpaper');
const windowsContainer = document.getElementById('windowsContainer');
const taskbarApps = document.getElementById('taskbarApps');
const startButton = document.getElementById('startButton');
const notifications = document.getElementById('notifications');
const taskbar = document.getElementById('taskbar');

let firstInteraction = false;

// Controle do boot
window.addEventListener('click', () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound('boot');
  }
});

// Tela boot some após 3.1s
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const boot = document.getElementById('bootScreen');
    if (boot) boot.style.display = 'none';
    document.getElementById('desktop').classList.remove('hidden');
    updateUI();
    updateClock();
  }, 3100);
});

// Função para tocar sons
function playSound(type) {
  if (!firstInteraction && type !== 'boot') return;
  try {
    if (type === 'click') clickSound.play();
    else if (type === 'error') errorSound.play();
    else if (type === 'notify') notifySound.play();
    else if (type === 'boot') bootSound.play();
    else if (type === 'system' && upgrades.systemSounds > 0) systemSound.play();
  } catch (e) {
    // Ignora erros de reprodução
  }
}

// Atualiza a UI geral
function updateUI() {
  pointsDisplay.textContent = points;

  // Atualiza wallpaper conforme nível
  const level = upgrades.wallpaper;
  if (level === 0) {
    wallpaper.style.backgroundImage = 'none';
  } else if (level === 1) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2708044.jpg')";
  } else if (level === 2) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2368959.jpg')";
  } else if (level === 3) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2579277.jpg')";
  } else if (level === 4) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp1854874.jpg')";
  } else if (level >= 5) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  }

  // Atualiza janelas com nível wallpaper para efeito
  const windows = document.querySelectorAll('.window');
  windows.forEach(win => {
    win.dataset.upgradeWallpaperLevel = level;
  });

  // Aplica blur aero nas janelas se upgrade ativo
  if (upgrades.blur > 0) {
    windows.forEach(win => {
      win.classList.add('blur');
    });
  } else {
    windows.forEach(win => {
      win.classList.remove('blur');
    });
  }

  // Atualiza cursor conforme nível
  document.body.classList.remove('cursor-level-1', 'cursor-level-2', 'cursor-level-3', 'cursor-level-4', 'cursor-level-5');
  if (upgrades.cursor > 0) {
    document.body.classList.add(`cursor-level-${upgrades.cursor}`);
  }

  // Atualiza transparência da taskbar
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

  // Atualiza animações
  if (upgrades.animations > 0) {
    taskbar.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
    taskbar.style.boxShadow = '0 0 10px #00d8ff';
  } else {
    taskbar.style.boxShadow = 'none';
  }

  updateMusicPlayerUI();
  updatePointsButtons();
}

// Atualiza o relógio digital na taskbar
function updateClock() {
  const clock = document.getElementById('clock');
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  let s = now.getSeconds();
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  s = s < 10 ? '0' + s : s;
  clock.textContent = `${h}:${m}:${s}`;
  setTimeout(updateClock, 1000);
}

// Criar notificações visuais
function notify(text) {
  const box = document.createElement('div');
  box.className = 'notification';
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Abertura e controle dos apps
const openWindows = new Map();

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
let zIndexCounter = 100;
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
    const desktopRect = document.getElementById('desktop').getBoundingClientRect();
    const winRect = elmnt.getBoundingClientRect();

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + winRect.width > desktopRect.right) newLeft = desktopRect.right - winRect.width;
    if (newTop + winRect.height > desktopRect.bottom - 40) newTop = desktopRect.bottom - 40 - winRect.height;

    elmnt.style.left = newLeft + 'px';
    elmnt.style.top = newTop + 'px';
  }
}

// Eventos dos ícones na barra e área de trabalho
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

  // Botão ganhar pontos
  setTimeout(() => {
    const earnBtn = document.querySelector('[data-app="earn"] .window-body #earnBtn') || document.querySelector('.window[data-app="earn"] #earnBtn');
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

  // Botões comprar
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

// App Notepad (simples)
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

  setTimeout(setupMusicPlayer, 100);
}

function setupMusicPlayer() {
  const win = openWindows.get('winamp');
  if (!win) return;
  const body = win.querySelector('.window-body');
  const musicListDiv = body.querySelector('.music-list');
  const playPauseBtn = body.querySelector('#playPauseBtn');
  const prevBtn = body.querySelector('#prevBtn');
  const nextBtn = body.querySelector('#nextBtn');
  const currentTrackLabel = body.querySelector('#currentTrack');

  musicListDiv.innerHTML = '';
  musicFiles.forEach((file, idx) => {
    const btn = document.createElement('button');
    btn.textContent = musicNames[idx];
    btn.setAttribute('role', 'listitem');
    btn.onclick = () => {
      currentTrackIndex = idx;
      playTrack();
    };
    musicListDiv.appendChild(btn);
  });

  if (!audio) audio = new Audio();

  function playTrack() {
    if (upgrades.player === 0) {
      notify('Compre o upgrade do player para usar!');
      playSound('error');
      return;
    }
    audio.src = musicFiles[currentTrackIndex];
    audio.play().catch(() => {});
    isPlaying = true;
    updateMusicPlayerUI();
    playPauseBtn.textContent = '⏸';
    highlightActiveSong();
  }

  function pauseTrack() {
    audio.pause();
    isPlaying = false;
    updateMusicPlayerUI();
    playPauseBtn.textContent = '▶️';
  }

  function highlightActiveSong() {
    const buttons = musicListDiv.querySelectorAll('button');
    buttons.forEach((b, i) => {
      if (i === currentTrackIndex) b.classList.add('active');
      else b.classList.remove('active');
    });
  }

  playPauseBtn.onclick = () => {
    if (!firstInteraction) {
      notify('Clique na tela para ativar o áudio.');
      return;
    }
    if (isPlaying) pauseTrack();
    else playTrack();
  };

  prevBtn.onclick = () => {
    currentTrackIndex--;
    if (currentTrackIndex < 0) currentTrackIndex = musicFiles.length - 1;
    playTrack();
  };

  nextBtn.onclick = () => {
    currentTrackIndex++;
    if (currentTrackIndex >= musicFiles.length) currentTrackIndex = 0;
    playTrack();
  };

  audio.onended = () => {
    currentTrackIndex++;
    if (currentTrackIndex >= musicFiles.length) currentTrackIndex = 0;
    if (upgrades.player > 0) playTrack();
  };

  updateMusicPlayerUI();

  function updateMusicPlayerUI() {
    currentTrackLabel.textContent = musicNames[currentTrackIndex] || 'Nenhuma música';
    playPauseBtn.disabled = upgrades.player === 0;
    prevBtn.disabled = upgrades.player === 0;
    nextBtn.disabled = upgrades.player === 0;
  }
}

// Atualiza UI do player (para mudar botão play/stop e etc)
function updateMusicPlayerUI() {
  const win = openWindows.get('winamp');
  if (!win) return;
  const body = win.querySelector('.window-body');
  if (!body) return;

  const playPauseBtn = body.querySelector('#playPauseBtn');
  if (playPauseBtn) {
    playPauseBtn.disabled = upgrades.player === 0;
  }
}

// Atualiza o botão ganhar pontos para refletir upgrade (exemplo)
function updatePointsButtons() {
  const earnWin = openWindows.get('earn');
  if (!earnWin) return;
  const btn = earnWin.querySelector('#earnBtn');
  if (!btn) return;

  // Ganho de pontos por clique aumenta com nível do upgrade "earn"
  const earnLevel = upgrades.earn || 0;
  btn.textContent = `Ganhar ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}`;
  btn.onclick = () => {
    points += earnLevel + 1;
    playSound('click');
    notify(`Você ganhou ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}!`);
    updateUI();
  };
}

// Capitalizar nomes
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Inicialização upgrades que faltavam
if (!('earn' in upgrades)) upgrades.earn = 0;

// Evento start button (menu iniciar)
startButton.onclick = () => {
  const startMenu = document.getElementById('startMenu');
  if (startMenu.classList.contains('hidden')) {
    startMenu.classList.remove('hidden');
  } else {
    startMenu.classList.add('hidden');
  }
  playSound('click');
};

// Fecha menu iniciar clicando fora
document.addEventListener('click', (e) => {
  const startMenu = document.getElementById('startMenu');
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add('hidden');
  }
});

// Atualiza o relógio
updateClock();

// Atualiza UI geral
updateUI();
