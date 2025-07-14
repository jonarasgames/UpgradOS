// script.js - completo com janelas, upgrades, calculadora, blur, wallpaper animado, arrastar e redimensionar

document.addEventListener("DOMContentLoaded", () => {
  const bootScreen = document.getElementById("bootScreen");
  const desktop = document.getElementById("desktop");
  const wallpaper = document.getElementById("wallpaper");
  const windowsContainer = document.getElementById("windowsContainer");
  const pointsLabel = document.getElementById("points");
  const notifications = document.getElementById("notifications");
  const clickSound = document.getElementById("clickSound");
  const errorSound = document.getElementById("errorSound");
  const notifySound = document.getElementById("notifySound");
  const bootSound = document.getElementById("bootSound");

  const taskbarApps = document.getElementById("taskbarApps");

  // Estado do sistema
  let points = 0;
  let upgradeLevel = 0; // 0 a 5
  let windows = {};
  let zIndexCounter = 100;

  // Map app para funções de criação janela
  const appCreators = {
    earn: createEarnWindow,
    store: createStoreWindow,
    notepad: createNotepadWindow,
    winamp: createWinampWindow,
    bet: createBetWindow,
    calculator: createCalculatorWindow
  };

  // Atualiza pontos no display
  function updatePoints(amount) {
    points += amount;
    if (points < 0) points = 0;
    pointsLabel.textContent = points;
  }

  // Notificação temporária
  function notify(msg) {
    notifications.textContent = msg;
    notifications.style.opacity = "1";
    notifySound.play();
    setTimeout(() => {
      notifications.style.opacity = "0";
    }, 3000);
  }

  // Atualiza relógio na barra
  function updateClock() {
    const clock = document.getElementById("clock");
    const now = new Date();
    clock.textContent = now.toLocaleTimeString();
  }
  setInterval(updateClock, 1000);
  updateClock();

  // Função para atualizar wallpaper e blur baseado no upgradeLevel
  function updateVisuals() {
    // Wallpaper
    wallpaper.className = "";
    wallpaper.classList.add(`wallpaper-level-${upgradeLevel}`);

    // Atualiza todas as janelas abertas com o blur
    Object.values(windows).forEach(win => {
      const content = win.querySelector(".window-content");
      // Remove todas as blur classes antigas
      for (let i = 0; i <= 5; i++) {
        content.classList.remove(`blur-level-${i}`);
      }
      content.classList.add(`blur-level-${upgradeLevel}`);
    });
  }

  // Chama updateVisuals no começo
  updateVisuals();

  // Cria janela base com header e conteúdo
  function createWindow(appId, title) {
    if (windows[appId]) {
      bringToFront(windows[appId]);
      return windows[appId];
    }

    const win = document.createElement("div");
    win.classList.add("window");
    win.style.top = "100px";
    win.style.left = "100px";
    win.style.zIndex = ++zIndexCounter;

    // Header
    const header = document.createElement("div");
    header.classList.add("window-header");
    header.textContent = title;

    // Controles fechar e minimizar (minimizar fecha janela aqui)
    const controls = document.createElement("div");
    controls.classList.add("controls");

    const btnClose = document.createElement("button");
    btnClose.textContent = "×";
    btnClose.title = "Fechar";
    btnClose.onclick = () => {
      win.remove();
      delete windows[appId];
    };

    controls.appendChild(btnClose);
    header.appendChild(controls);
    win.appendChild(header);

    // Conteúdo
    const content = document.createElement("div");
    content.classList.add("window-content");
    content.style.flex = "1";
    content.style.padding = "15px";
    content.style.overflow = "auto";

    // Blur level
    content.classList.add(`blur-level-${upgradeLevel}`);

    win.appendChild(content);

    // Drag funcionalidade
    dragElement(win, header);

    // Resizable pelo CSS (resize: both) já no CSS

    windowsContainer.appendChild(win);
    windows[appId] = win;

    // Atualiza wallpaper e blur caso necessário
    updateVisuals();

    // Trazer para frente
    win.addEventListener("mousedown", () => bringToFront(win));

    return win;
  }

  // Função para trazer janela para frente
  function bringToFront(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
  }

  // --------------------------
  // Apps

  // 1. Ganhar Pontos (simples)
  function createEarnWindow() {
    const win = createWindow("earn", "Ganhar Pontos");
    const content = win.querySelector(".window-content");
    content.innerHTML = "";

    const btn = document.createElement("button");
    btn.textContent = "Clique para ganhar 10 pontos";
    btn.style.fontSize = "18px";
    btn.style.padding = "12px 24px";
    btn.style.cursor = "pointer";
    btn.style.borderRadius = "12px";
    btn.style.border = "none";
    btn.style.background = "#00aaff";
    btn.style.color = "#fff";
    btn.style.userSelect = "none";

    btn.onclick = () => {
      updatePoints(10);
      clickSound.play();
      notify("Você ganhou 10 pontos!");
      checkUpgrade();
    };

    content.appendChild(btn);
    return win;
  }

  // 2. Loja (Upgrades)
  function createStoreWindow() {
    const win = createWindow("store", "Loja - Upgrades");
    const content = win.querySelector(".window-content");
    content.innerHTML = "";

    // Upgrades dados fixos
    const upgrades = [
      { level: 1, cost: 50, description: "Atualização Flat Minimalista → Frutiger Aero nível 1" },
      { level: 2, cost: 100, description: "Frutiger Aero nível 2" },
      { level: 3, cost: 200, description: "Frutiger Aero nível 3" },
      { level: 4, cost: 400, description: "Frutiger Aero nível 4" },
      { level: 5, cost: 800, description: "Frutiger Aero nível 5 - Final" }
    ];

    upgrades.forEach(upg => {
      const div = document.createElement("div");
      div.style.marginBottom = "10px";

      const desc = document.createElement("span");
      desc.textContent = `${upg.description} (Custo: ${upg.cost} pontos)`;
      div.appendChild(desc);

      const btn = document.createElement("button");
      btn.textContent = "Upgrade";
      btn.disabled = upgradeLevel >= upg.level || points < upg.cost;
      btn.style.marginLeft = "12px";
      btn.style.padding = "6px 14px";
      btn.style.borderRadius = "10px";
      btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
      btn.style.background = btn.disabled ? "#555" : "#0080ff";
      btn.style.color = "white";
      btn.style.border = "none";

      btn.onclick = () => {
        if (points >= upg.cost && upgradeLevel < upg.level) {
          updatePoints(-upg.cost);
          upgradeLevel = upg.level;
          notify(`Você fez o upgrade para nível ${upgradeLevel}!`);
          clickSound.play();
          updateVisuals();
          // Atualiza botões da loja
          createStoreWindow();
        } else {
          errorSound.play();
          notify("Você não tem pontos suficientes ou já possui esse upgrade.");
        }
      };

      div.appendChild(btn);
      content.appendChild(div);
    });

    return win;
  }

  // 3. Notepad simples
  function createNotepadWindow() {
    const win = createWindow("notepad", "Notepad");
    const content = win.querySelector(".window-content");
    content.innerHTML = "";

    const textarea = document.createElement("textarea");
    textarea.style.width = "100%";
    textarea.style.height = "calc(100% - 10px)";
    textarea.style.borderRadius = "10px";
    textarea.style.border = "1px solid #aaa";
    textarea.style.padding = "8px";
    textarea.style.fontSize = "16px";
    textarea.style.fontFamily = "monospace";
    content.appendChild(textarea);

    return win;
  }

  // 4. Winamp (simples - só a interface)
  function createWinampWindow() {
    const win = createWindow("winamp", "Winamp");
    const content = win.querySelector(".window-content");
    content.innerHTML = "<p>Player de música em desenvolvimento...</p>";
    return win;
  }

  // 5. Bet app simples
  function createBetWindow() {
    const win = createWindow("bet", "Bahze - Apostas");
    const content = win.querySelector(".window-content");
    content.innerHTML = "";

    const btnBet = document.createElement("button");
    btnBet.textContent = "Fazer aposta (chance 50%)";
    btnBet.style.padding = "12px 24px";
    btnBet.style.fontSize = "18px";
    btnBet.style.cursor = "pointer";
    btnBet.style.borderRadius = "12px";
    btnBet.style.border = "none";
    btnBet.style.background = "#cc3300";
    btnBet.style.color = "#fff";

    btnBet.onclick = () => {
      if (points < 20) {
        errorSound.play();
        notify("Você precisa de pelo menos 20 pontos para apostar.");
        return;
      }
      updatePoints(-20);
      const winBet = Math.random() < 0.5;
      if (winBet) {
        updatePoints(40);
        notify("Você ganhou a aposta e ganhou 40 pontos!");
      } else {
        notify("Você perdeu a aposta. Tente novamente.");
      }
      clickSound.play();
      checkUpgrade();
    };

    content.appendChild(btnBet);
    return win;
  }

  // 6. Calculadora estilo Frutiger Aero
  function createCalculatorWindow() {
    const win = createWindow("calculator", "Calculadora");
    const content = win.querySelector(".window-content");
    content.innerHTML = "";

    // Criar layout calculadora
    const calcDiv = document.createElement("div");
    calcDiv.classList.add("calculator");

    const display = document.createElement("input");
    display.type = "text";
    display.id = "calcDisplay";
    display.readOnly = true;
    display.value = "";

    calcDiv.appendChild(display);

    const buttonsLayout = [
      "7","8","9","/",
      "4","5","6","*",
      "1","2","3","-",
      "0",".","C","+",
      "="
    ];

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("calc-buttons");

    buttonsLayout.forEach(btnText => {
      const btn = document.createElement("button");
      btn.textContent = btnText;
      btn.dataset.val = btnText;
      buttonsContainer.appendChild(btn);
    });

    calcDiv.appendChild(buttonsContainer);
    content.appendChild(calcDiv);

    // Eventos dos botões
    buttonsContainer.addEventListener("click", e => {
      if (!e.target.matches("button")) return;
      const val = e.target.dataset.val;
      if (!val) return;

      if (val === "C") {
        display.value = "";
      } else if (val === "=") {
        try {
          // Avalia a expressão no display
          display.value = eval(display.value) ?? "";
        } catch {
          display.value = "Erro";
        }
      } else {
        if (display.value === "Erro") display.value = "";
        display.value += val;
      }
    });

    return win;
  }

  // --------------------------
  // Drag funcionalidade simples
  function dragElement(elmnt, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;

      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;

      bringToFront(elmnt);
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      const newTop = elmnt.offsetTop - pos2;
      const newLeft = elmnt.offsetLeft - pos1;

      // Mantém dentro da tela
      const maxLeft = window.innerWidth - elmnt.offsetWidth;
      const maxTop = window.innerHeight - elmnt.offsetHeight - 48; // barra tarefa

      elmnt.style.top = Math.min(Math.max(0, newTop), maxTop) + "px";
      elmnt.style.left = Math.min(Math.max(0, newLeft), maxLeft) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // Verifica se pode fazer upgrade automaticamente para desbloquear botões sem precisar fechar janela
  function checkUpgrade() {
    const storeWin = windows["store"];
    if (!storeWin) return;

    const buttons = storeWin.querySelectorAll("button");
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (!text.includes("upgrade")) return;

      const div = btn.parentElement;
      // tenta pegar o custo do texto
      const costMatch = div.textContent.match(/Custo: (\d+)/);
      if (!costMatch) return;
      const cost = parseInt(costMatch[1], 10);

      // qual o level deste upgrade?
      const levelMatch = div.textContent.match(/nível (\d)/i);
      if (!levelMatch) return;
      const level = parseInt(levelMatch[1], 10);

      if (points >= cost && upgradeLevel < level) {
        btn.disabled = false;
        btn.style.cursor = "pointer";
        btn.style.background = "#0080ff";
      } else {
        btn.disabled = upgradeLevel >= level || points < cost;
        btn.style.cursor = btn.disabled ? "not-allowed" : "pointer";
        btn.style.background = btn.disabled ? "#555" : "#0080ff";
      }
    });
  }

  // Inicialização Boot Screen simulada
  let bootProgress = 0;
  const bootBarProgress = document.querySelector("#bootBar .progress");

  function bootStep() {
    bootProgress += 2;
    bootBarProgress.style.width = bootProgress + "%";

    if (bootProgress >= 100) {
      bootScreen.style.display = "none";
      desktop.classList.remove("hidden");
      bootSound.play();
      // Cria janelas iniciais
      createEarnWindow();
      createStoreWindow();
      updatePoints(0);
    } else {
      setTimeout(bootStep, 40);
    }
  }

  bootStep();

  // Abrir apps ao clicar na barra de tarefas
  taskbarApps.addEventListener("click", (e) => {
    if (!e.target.classList.contains("appIcon")) return;
    const appId = e.target.dataset.app;
    if (!appId) return;

    if (appCreators[appId]) {
      appCreators[appId]();
      clickSound.play();
    }
  });

  // Atualizar estado dos upgrades em tempo real
  setInterval(checkUpgrade, 500);

});
