// Variáveis globais
const bootScreen = document.getElementById('bootScreen');
const desktop = document.getElementById('desktop');
const wallpaper = document.getElementById('wallpaper');
const windowsContainer = document.getElementById('windowsContainer');
const taskbar = document.getElementById('taskbar');
const taskbarApps = document.getElementById('taskbarApps');
const pointsLabel = document.getElementById('points');
const notifications = document.getElementById('notifications');
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
const startGameBtn = document.getElementById('startGameBtn');

let points = 0;
const maxLevel = 5;
let upgrades = {
  wallpaper: 0,
  blur: 0,
  cursor: 0,
  player: 0,
  taskbarTransparency: 0,
  systemSounds: 0,
  animations: 0,
  earn: 0,
};

let openWindows = new Map();
let zIndexCounter = 100;
let firstInteraction = false;

const musicFiles = [
  'sounds/music/song1.mp3',
  'sounds/music/song2.mp3',
  'sounds/music/song3.mp3',
];
const musicNames = [
  'Song 1',
  'Song 2',
  'Song 3',
];

let currentTrackIndex = 0;
let isPlaying = false;
let audio = null;

// Botão para iniciar boot, pois o Chrome bloqueia autoplay de áudio
startGameBtn.onclick = () => {
  startGameBtn.disabled = true;
  boot();
};

// Boot screen (3 segundos) e inicia o sistema
function boot() {
  const progress = document.querySelector('#bootBar .progress');
  progress.style.width = '0%';

  // Play som de boot após 0.5s
  const bootSound = document.getElementById('bootSound');
  setTimeout(() => {
    bootSound.play().catch(() => {});
  }, 500);

  // Anima barra de boot e esconde a tela após 3s
  progress.style.animation = 'bootload 3s forwards';

  setTimeout(() => {
    bootScreen.classList.add('hidden');
    desktop.classList.remove('hidden');
    updateUI();
  }, 3000);
}

// Atualiza UI conforme upgrades e pontos
function updateUI() {
  pointsLabel.textContent = points;

  // Atualiza wallpaper
  if (upgrades.wallpaper === 0) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2023696.jpg')";
  } else if (upgrades.wallpaper === 1) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2566920.jpg')";
  } else if (upgrades.wallpaper === 2) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2558854.jpg')";
  } else if (upgrades.wallpaper === 3) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  } else if (upgrades.wallpaper >= 4) {
    wallpaper.style.backgroundImage = "url('https://wallpapercave.com/wp/wp2578814.jpg')";
  }

  // Atualiza janelas com nível wallpaper para efeito
  document.querySelectorAll('.window').forEach(win => {
    win.dataset.upgradeWallpaperLevel = upgrades.wallpaper;
  });

  // Aplica blur aero nas janelas se upgrade ativo
  if (upgrades.blur > 0) {
    document.querySelectorAll('.window').forEach(win => win.classList.add('blur'));
  } else {
    document.querySelectorAll('.window').forEach(win => win.classList.remove('blur'));
  }

  // Atualiza cursor conforme nível
  document.body.classList.remove(
    'cursor-level-1',
    'cursor-level-2',
    'cursor-level-3',
    'cursor-level-4',
    'cursor-level-5'
  );
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

  // Atualiza animações na taskbar
  if (upgrades.animations > 0) {
    taskbar.style.transition = 'background-color 0.3s ease, box-shadow 0.3s ease';
    taskbar.style.boxShadow = '0 0 10px #00d8ff';
  } else {
    taskbar.style.boxShadow = 'none';
  }

  updateMusicPlayerUI();
  updatePointsButtons();
}

// Atualiza relógio - só horas e minutos
function updateClock() {
  const clock = document.getElementById('clock');
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes();
  h = h < 10 ? '0' + h : h;
  m = m < 10 ? '0' + m : m;
  clock.textContent = `${h}:${m}`;
  setTimeout(updateClock, 1000);
}

// Cria notificações na tela
function notify(text) {
  const box = document.createElement('div');
  box.className = 'notification';
  box.textContent = text;
  notifications.appendChild(box);
  setTimeout(() => box.remove(), 4000);
}

// Cria janela de app
function createWindow(appName, title, contentHTML) {
  // Se já aberto, foca janela
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

  // Cabeçalho com título e fechar
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

  // Corpo da janela
  const body = document.createElement('div');
  body.className = 'window-body';
  body.innerHTML = contentHTML;
  win.appendChild(body);

  windowsContainer.appendChild(win);
  openWindows.set(appName, win);
  focusWindow(win);

  // Permitir arrastar pela barra do título
  dragElement(win, header);
}

// Focar janela em primeiro plano
function focusWindow(win) {
  zIndexCounter++;
  win.style.zIndex = zIndexCounter;
}

// Função para arrastar janela pelo header
function dragElement(elmnt, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  dragHandle.style.cursor = 'move';

  dragHandle.onmousedown = dragMouseDown;
  dragHandle.ontouchstart = dragTouchStart;

  function dragMouseDown(e) {
    e.preventDefault();
    focusWindow(elmnt);
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function dragTouchStart(e) {
    e.preventDefault();
    focusWindow(elmnt);
    const touch = e.touches[0];
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    document.ontouchend = closeDragElement;
    document.ontouchmove = elementDragTouch;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    // Impede que saia da tela (horizontal)
    newLeft = Math.min(Math.max(0, newLeft), window.innerWidth - elmnt.offsetWidth);
    newTop = Math.min(Math.max(0, newTop), window.innerHeight - elmnt.offsetHeight - taskbar.offsetHeight);

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
  }

  function elementDragTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    pos1 = pos3 - touch.clientX;
    pos2 = pos4 - touch.clientY;
    pos3 = touch.clientX;
    pos4 = touch.clientY;
    let newTop = elmnt.offsetTop - pos2;
    let newLeft = elmnt.offsetLeft - pos1;

    // Impede que saia da tela (horizontal)
    newLeft = Math.min(Math.max(0, newLeft), window.innerWidth - elmnt.offsetWidth);
    newTop = Math.min(Math.max(0, newTop), window.innerHeight - elmnt.offsetHeight - taskbar.offsetHeight);

    elmnt.style.top = newTop + "px";
    elmnt.style.left = newLeft + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
    document.ontouchend = null;
    document.ontouchmove = null;
  }
}

// Abrir app Ganhar Pontos
function openEarnApp() {
  const earnLevel = upgrades.earn || 0;
  const html = `
    <button id="earnBtn" style="font-size:18px; padding:10px; width: 100%;">Ganhar ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}</button>
  `;
  createWindow('earn', 'Ganhar Pontos', html);

  // Botão ganhar pontos funciona com upgrades
  setTimeout(() => {
    const earnBtn = document.querySelector('.window[data-app="earn"] #earnBtn');
    if (!earnBtn) return;
    earnBtn.onclick = () => {
      points += earnLevel + 1;
      playSound('click');
      notify(`Você ganhou ${earnLevel + 1} ponto${earnLevel + 1 > 1 ? 's' : ''}!`);
      updateUI();
    };
  }, 100);
}

// Abrir app Loja
function openStoreApp() {
  let html = '<div><h3>Loja de Upgrades</h3><p>Pontos: <span id="storePoints">' + points + '</span></p><ul>';
  const upgradesList = [
    { key: 'wallpaper', label: 'Papel de Parede' },
    { key: 'blur', label: 'Efeito Aero Blur' },
    { key: 'cursor', label: 'Cursor Personalizado' },
    { key: 'player', label: 'Player de Música' },
    { key: 'taskbarTransparency', label: 'Transparência da Barra' },
    { key: 'systemSounds', label: 'Sons do Sistema' },
    { key: 'animations', label: 'Animações' },
    { key: 'earn', label: 'Ganhar Pontos' }
  ];
  upgradesList.forEach(({ key, label }) => {
    const level = upgrades[key] || 0;
    const cost = (level + 1) * 10;
    const disabled = level >= maxLevel || points < cost ? 'disabled' : '';
    html += `<li>
      ${label} (Nível ${level}/${maxLevel}) - Custo: ${cost} pontos
      <button class="buyBtn" data-key="${key}" ${disabled}>Comprar</button>
    </li>`;
  });
  html += '</ul></div>';
  createWindow('store', 'Loja', html);

  // Botões comprar upgrade
  setTimeout(() => {
    const storePoints = document.getElementById('storePoints');
    const buyBtns = document.querySelectorAll('.buyBtn');
    buyBtns.forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.key;
        const level = upgrades[key] || 0;
        const cost = (level + 1) * 10;
        if (points >= cost && level < maxLevel) {
          points -= cost;
          upgrades[key] = level + 1;
          playSound('click');
          notify(`Upgrade ${capitalize(key)} para nível ${level + 1} comprado!`);
          updateUI();
          openStoreApp(); // Reabre loja para atualizar botões e pontos
        } else {
          playSound('error');
          notify('Pontos insuficientes ou nível máximo atingido.');
        }
      };
    });
    if (storePoints) storePoints.textContent = points;
  }, 200);
}

// Abrir app Notepad simples
function openNotepadApp() {
  const html = `
    <textarea style="width:100%; height: 200px; resize:none;" aria-label="Bloco de notas"></textarea>
  `;
  createWindow('notepad', 'Notepad', html);
}

// Abrir app Winamp (player de música)
function openWinampApp() {
  if (audio) {
    audio.pause();
    audio = null;
  }

  let html = `
    <div class="music-player" role="region" aria-label="Player de música">
      <div class="music-controls">
        <button id="prevBtn" aria-label="Música anterior">⏮️</button>
        <button id="playPauseBtn" aria-label="Play/Pause">▶️</button>
        <button id="nextBtn" aria-label="Próxima música">⏭️</button>
      </div>
      <div class="music-list" role="list" aria-label="Lista de músicas">
  `;

  musicNames.forEach((name, i) => {
    html += `<button class="musicItem" data-index="${i}" role="listitem">${name}</button>`;
  });
  html += '</div></div>';

  createWindow('winamp', 'Winamp', html);

  setTimeout(() => {
    const playPauseBtn = document.querySelector('.window[data-app="winamp"] #playPauseBtn');
    const prevBtn = document.querySelector('.window[data-app="winamp"] #prevBtn');
    const nextBtn = document.querySelector('.window[data-app="winamp"] #nextBtn');
    const musicItems = document.querySelectorAll('.window[data-app="winamp"] .musicItem');

    function updatePlayPauseIcon() {
      playPauseBtn.textContent = isPlaying ? '⏸️' : '▶️';
    }

    function playTrack(index) {
      if (audio) {
        audio.pause();
        audio = null;
      }
      currentTrackIndex = index;
      audio = new Audio(musicFiles[index]);
      audio.volume = 0.7;
      audio.play().catch(() => {});
      isPlaying = true;
      updatePlayPauseIcon();
      updateMusicListHighlight();
      audio.onended = () => {
        nextTrack();
      };
    }

    function pauseTrack() {
      if (audio) {
        audio.pause();
        isPlaying = false;
        updatePlayPauseIcon();
      }
    }

    function togglePlayPause() {
      if (!audio) {
        playTrack(currentTrackIndex);
      } else if (isPlaying) {
        pauseTrack();
      } else {
        audio.play().catch(() => {});
        isPlaying = true;
        updatePlayPauseIcon();
      }
    }

    function nextTrack() {
      let nextIndex = currentTrackIndex + 1;
      if (nextIndex >= musicFiles.length) nextIndex = 0;
      playTrack(nextIndex);
    }

    function prevTrack() {
      let prevIndex = currentTrackIndex - 1;
      if (prevIndex < 0) prevIndex = musicFiles.length - 1;
      playTrack(prevIndex);
    }

    function updateMusicListHighlight() {
      musicItems.forEach(item => {
        item.classList.remove('active');
      });
      if (musicItems[currentTrackIndex]) {
        musicItems[currentTrackIndex].classList.add('active');
      }
    }

    playPauseBtn.onclick = togglePlayPause;
    nextBtn.onclick = nextTrack;
    prevBtn.onclick = prevTrack;

    musicItems.forEach(item => {
      item.onclick = () => {
        const idx = Number(item.getAttribute('data-index'));
        playTrack(idx);
      };
    });
  }, 100);
}

// Atualiza UI do player (desabilita botões se upgrade zero)
function updateMusicPlayerUI() {
  const win = openWindows.get('winamp');
  if (!win) return;
  const playPauseBtn = win.querySelector('#playPauseBtn');
  if (!playPauseBtn) return;

  playPauseBtn.disabled = upgrades.player === 0;
}

// Atualiza botão ganhar pontos com upgrade
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

// Play sons
function playSound(name) {
  const sound = document.getElementById(name + 'Sound');
  if (!sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

// Capitaliza a primeira letra
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Eventos para abrir apps via barra
taskbarApps.querySelectorAll('button').forEach(btn => {
  btn.onclick = () => {
    const app = btn.dataset.app;
    if (app === 'earn') openEarnApp();
    else if (app === 'store') openStoreApp();
    else if (app === 'notepad') openNotepadApp();
    else if (app === 'winamp') openWinampApp();
  };
});

// Toggle menu iniciar
startButton.onclick = (e) => {
  e.stopPropagation();
  startMenu.classList.toggle('hidden');
  playSound('click');
};

// Fecha menu iniciar ao clicar fora
document.addEventListener('click', e => {
  if (!startMenu.contains(e.target) && e.target !== startButton) {
    startMenu.classList.add('hidden');
  }
});

// Atualiza relógio e UI na inicialização
updateClock();
updateUI();
