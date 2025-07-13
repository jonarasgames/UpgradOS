// Variáveis principais
let points = parseInt(localStorage.getItem("points")) || 0;
let upgrades = JSON.parse(localStorage.getItem("upgrades")) || [];

const pointsDisplay = document.getElementById("points");
const earnBtn = document.getElementById("earnBtn");
const storeBtn = document.getElementById("storeBtn");
const notepadBtn = document.getElementById("notepadBtn");
const winampBtn = document.getElementById("winampBtn");

const storeWindow = document.getElementById("storeWindow");
const notepadWindow = document.getElementById("notepad");
const winampWindow = document.getElementById("winamp");
const notificationArea = document.getElementById("notifications");
const achievementPopup = document.getElementById("achievement");

const clickSound = document.getElementById("clickSound");
const errorSound = document.getElementById("errorSound");
const notifySound = document.getElementById("notifySound");
const bootSound = document.getElementById("bootSound");

// Controle para tocar som só após clique do usuário
let firstInteraction = false;

window.addEventListener("click", () => {
  if (!firstInteraction) {
    firstInteraction = true;
    playSound("boot");
  }
});

// Tela de boot
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("bootScreen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
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

// Atualiza UI com pontos e upgrades
function updateUI() {
  pointsDisplay.textContent = points;

  if (upgrades.includes("wallpaper")) {
    document.getElementById("desktop").style.backgroundImage =
      "url('https://wallpapercave.com/wp/wp2708044.jpg')";
  }

  if (upgrades.includes("blur")) {
    document.querySelectorAll(".window").forEach(w => w.classList.add("blur"));
  }

  if (upgrades.includes("cursor")) {
    document.body.classList.add("custom-cursor");
  }

  if (upgrades.length >= 3) {
    achievementPopup.classList.remove("hidden");
  }
}

// Salvar progresso no localStorage
function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

// Botão para ganhar pontos
earnBtn.onclick = () => {
  points += 1;
  playSound("click");
  updateUI();
  saveGame();
};

// Abrir janelas
storeBtn.onclick = () => {
  storeWindow.classList.remove("hidden");
  playSound("click");
};

notepadBtn.onclick = () => {
  notepadWindow.classList.remove("hidden");
  playSound("click");
};

winampBtn.onclick = () => {
  winampWindow.classList.remove("hidden");
  playSound("click");
};

// Fechar janelas
document.querySelectorAll(".closeBtn").forEach(btn => {
  btn.onclick = () => {
    btn.closest(".window").classList.add("hidden");
    playSound("click");
  };
});

// Comprar upgrades
document.querySelectorAll(".upgrade").forEach(btn => {
  btn.onclick = () => {
    const cost = parseInt(btn.dataset.cost);
    const upgrade = btn.dataset.upgrade;

    if (points >= cost && !upgrades.includes(upgrade)) {
      points -= cost;
      upgrades.push(upgrade);
      updateUI();
      saveGame();
      notify(`Upgrade "${upgrade}" instalado!`);
      playSound("notify");
    } else {
      playSound("error");
    }
  };
});

// Mostrar notificações
function notify(text) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = text;
  notificationArea.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 4000);
}
