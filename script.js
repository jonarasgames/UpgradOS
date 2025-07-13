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

// ✅ BOOT SCREEN com DOMContentLoaded seguro
window.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    document.getElementById("bootScreen").classList.add("hidden");
    document.getElementById("desktop").classList.remove("hidden");
    updateUI();
    playSound("boot");
  }, 3100); // duração da barra de loading
});

function playSound(type) {
  try {
    if (type === "click") clickSound.play();
    if (type === "error") errorSound.play();
    if (type === "notify") notifySound.play();
    if (type === "boot") bootSound.play();
  } catch (e) {
    console.warn("Erro ao tocar som:", type);
  }
}

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
    document.getElementById("achievement").classList.remove("hidden");
  }
}

function saveGame() {
  localStorage.setItem("points", points);
  localStorage.setItem("upgrades", JSON.stringify(upgrades));
}

earnBtn.onclick = () => {
  points += 1;
  playSound("click");
  updateUI();
  saveGame();
};

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

document.querySelectorAll(".closeBtn").forEach(btn => {
  btn.onclick = () => {
    btn.closest(".window").classList.add("hidden");
    playSound("click");
  };
});

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

function notify(text) {
  const box = document.createElement("div");
  box.className = "notification";
  box.textContent = text;
  notificationArea.appendChild(box);

  setTimeout(() => {
    box.remove();
  }, 4000);
}
