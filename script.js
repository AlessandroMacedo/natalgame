// JOGO NATALINO - PAPAI NOEL VS DRONES
// PC + Celular (controles laterais)
// Drones, aviões, passarinhos, explosões, níveis, etc.

// ======================================================================
// 🔧 CONFIGURAÇÃO DE IMAGENS
// ======================================================================
const ASSETS = {
  santa1: "images/santa1.png",
  santa2: "images/santa2.png",
  santa3: "images/santa3.png",

  drone1: "images/drone1.png",
  drone2: "images/drone2.png",

  plane1: "images/plane1.png",
  plane2: "images/plane2.png",

  bird1: "images/bird1.png",
  bird2: "images/bird2.png",

  explosion1: "images/explosion1.png",
  explosion2: "images/explosion2.png",
  explosion3: "images/explosion3.png",

  gift1: "images/gift1.png",
  gift2: "images/gift2.png",
  gift3: "images/gift3.png"
};

const ANIMATION = {
  santaFrameDuration: 150,
  droneFrameDuration: 120,
  planeFrameDuration: 100,
  birdFrameDuration: 140,
  explosionFrameDuration: 70,
  giftFrameDuration: 90
};

// ======================================================================
// 🎵 MÚSICA DE FUNDO
// ======================================================================
const bgMusic = new Audio("audio/natal_innova_theme.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4; // ajuste de volume (0.0 a 1.0)
let musicStarted = false;

function playBackgroundMusic() {
  if (musicStarted) return; // só inicia uma vez a partir do menu
  musicStarted = true;
  bgMusic.currentTime = 0;
  bgMusic.play().catch((err) => {
    console.log("Reprodução da música foi bloqueada pelo navegador:", err);
  });
}

function resumeBackgroundMusic() {
  if (!musicStarted) return;
  bgMusic.currentTime = 0;
  bgMusic.play().catch((err) => {
    console.log("Não foi possível retomar a música:", err);
  });
}

// ======================================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const heartsEl     = document.getElementById("hearts");
const scoreEl      = document.getElementById("score");
const menuEl       = document.getElementById("mainMenu");
const levelTextEl  = document.getElementById("levelText");
const levelBarFill = document.querySelector(".level-bar-fill");

// Modal de orientação mobile
const mobileOrientationModal = document.getElementById("mobileOrientationModal");
const btnOrientationOk       = document.getElementById("btnOrientationOk");

// Botões de modo
const btnPC     = document.getElementById("btnPC");
const btnMobile = document.getElementById("btnMobile");

// Botões mobile
const btnUp    = document.getElementById("btnUp");
const btnDown  = document.getElementById("btnDown");
const btnShoot = document.getElementById("btnShoot");
const mobileControlsEl = document.querySelector(".mobile-controls");
const mobileRestartBtn = document.getElementById("btnRestartMobile");

let currentTimeMs = 0;

// ======================================================================
// IMAGENS
// ======================================================================
const santaFrames = [new Image(), new Image(), new Image()];
santaFrames[0].src = ASSETS.santa1;
santaFrames[1].src = ASSETS.santa2;
santaFrames[2].src = ASSETS.santa3;

const droneFrames = [new Image(), new Image()];
droneFrames[0].src = ASSETS.drone1;
droneFrames[1].src = ASSETS.drone2;

const planeFrames = [new Image(), new Image()];
planeFrames[0].src = ASSETS.plane1;
planeFrames[1].src = ASSETS.plane2;

const birdFrames = [new Image(), new Image()];
birdFrames[0].src = ASSETS.bird1;
birdFrames[1].src = ASSETS.bird2;

const explosionFrames = [new Image(), new Image(), new Image()];
explosionFrames[0].src = ASSETS.explosion1;
explosionFrames[1].src = ASSETS.explosion2;
explosionFrames[2].src = ASSETS.explosion3;

const giftFrames = [new Image(), new Image(), new Image()];
giftFrames[0].src = ASSETS.gift1;
giftFrames[1].src = ASSETS.gift2;
giftFrames[2].src = ASSETS.gift3;

// ======================================================================
// ESTADO DO JOGO
// ======================================================================
const GAME = {
  mode: null, // "pc" ou "mobile"

  running: false,
  gameOver: false,
  lastTime: 0,

  baseSpawnInterval: 1300,
  spawnInterval: 1300,
  lastSpawn: 0,

  planeSpawnInterval: 2600,
  lastPlaneSpawn: 0,

  score: 0,
  lives: 3,
  invincible: false,
  invincibleTime: 1000,
  lastHit: 0,

  birdSpawnInterval: 2000,
  lastBirdSpawn: 0,

  level: 1,
  levelDuration: 30000,
  levelTimeLeft: 30000
};

// ======================================================================
// PAPAI NOEL
// ======================================================================
const santa = {
  x: 120,
  y: canvas.height / 2,
  w: 90,
  h: 70,
  speed: 5
};

function drawSantaImage() {
  const index =
    Math.floor(currentTimeMs / ANIMATION.santaFrameDuration) % santaFrames.length;
  const img = santaFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "#f97316";
    ctx.fillRect(santa.x, santa.y, santa.w, santa.h);
    return;
  }

  ctx.drawImage(img, santa.x, santa.y, santa.w, santa.h);
}

// ======================================================================
// DRONES
// ======================================================================
const drones = [];

function spawnDrone() {
  const w = 70;
  const h = 50;

  const altitudeChoice = Math.random();
  let y;

  if (altitudeChoice < 0.3) {
    // parte dos drones bem embaixo (perto dos prédios)
    y = canvas.height - h - 25;
  } else {
    const minY = 40;
    const maxY = canvas.height - h - 80;
    y = Math.random() * (maxY - minY) + minY;
  }

  const speedBase = 4;
  const speedExtra = GAME.level * 0.3;

  drones.push({
    x: canvas.width + 80,
    y,
    w,
    h,
    speed: speedBase + Math.random() * 2 + speedExtra
  });
}

function drawDrone(drone) {
  const index =
    Math.floor(currentTimeMs / ANIMATION.droneFrameDuration) % droneFrames.length;
  const img = droneFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "#0ea5e9";
    ctx.fillRect(drone.x, drone.y, drone.w, drone.h);
    return;
  }

  ctx.drawImage(img, drone.x, drone.y, drone.w, drone.h);
}

// ======================================================================
// AVIÕES CAÇA
// ======================================================================
const planes = [];

function spawnPlane() {
  const w = 90;
  const h = 55;
  const minY = 50;
  const maxY = canvas.height - h - 120;
  const y = Math.random() * (maxY - minY) + minY;

  const speedBase = 6;
  const speedExtra = GAME.level * 0.5;

  planes.push({
    x: canvas.width + 100,
    y,
    w,
    h,
    speed: speedBase + Math.random() * 2 + speedExtra
  });
}

function drawPlane(plane) {
  const index =
    Math.floor(currentTimeMs / ANIMATION.planeFrameDuration) % planeFrames.length;
  const img = planeFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "#a855f7";
    ctx.fillRect(plane.x, plane.y, plane.w, plane.h);
    return;
  }

  ctx.drawImage(img, plane.x, plane.y, plane.w, plane.h);
}

// ======================================================================
// PASSARINHOS
// ======================================================================
const birds = [];

function spawnBird() {
  const w = 40;
  const h = 30;
  const minY = 30;
  const maxY = canvas.height / 2;
  const y = Math.random() * (maxY - minY) + minY;

  birds.push({
    x: canvas.width + 20,
    y,
    w,
    h,
    speed: 2 + Math.random() * 1.5
  });
}

function drawBird(bird) {
  const index =
    Math.floor(currentTimeMs / ANIMATION.birdFrameDuration) % birdFrames.length;
  const img = birdFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(bird.x, bird.y, bird.w, bird.h);
    return;
  }

  ctx.drawImage(img, bird.x, bird.y, bird.w, bird.h);
}

// ======================================================================
// EXPLOSÕES
// ======================================================================
const explosions = [];

function spawnExplosion(x, y, w, h) {
  explosions.push({
    x,
    y,
    w,
    h,
    startTime: currentTimeMs,
    duration: 350
  });
}

function drawExplosion(expl) {
  const elapsed = currentTimeMs - expl.startTime;
  const index =
    Math.floor(elapsed / ANIMATION.explosionFrameDuration) % explosionFrames.length;
  const img = explosionFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = elapsed % 160 < 80 ? "#facc15" : "#ef4444";
    ctx.beginPath();
    ctx.arc(expl.x + expl.w / 2, expl.y + expl.h / 2, expl.w / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.drawImage(img, expl.x, expl.y, expl.w, expl.h);
}

// ======================================================================
// PRESENTES
// ======================================================================
const gifts = [];

function shootGift() {
  if (!GAME.running || GAME.gameOver) return;
  if (gifts.length > 10) return;

  gifts.push({
    x: santa.x + santa.w,
    y: santa.y + santa.h * 0.5 - 6,
    w: 24,
    h: 24,
    speed: 9
  });
}

function drawGift(g) {
  const index =
    Math.floor(currentTimeMs / ANIMATION.giftFrameDuration) % giftFrames.length;
  const img = giftFrames[index];

  if (!img.complete || img.naturalWidth === 0) {
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(g.x, g.y, g.w, g.h);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(g.x + g.w * 0.4, g.y, g.w * 0.2, g.h);
    ctx.fillRect(g.x, g.y + g.h * 0.4, g.w, g.h * 0.2);
    return;
  }

  ctx.drawImage(img, g.x, g.y, g.w, g.h);
}

// ======================================================================
// CONTROLES (TECLADO + MOBILE)
// ======================================================================
const keys = {};

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.key === " ") {
    e.preventDefault();
    shootGift();
  }

  if (e.key === "Enter" && GAME.gameOver) {
    resetGame();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

function setupHoldButton(button, onPress, onRelease) {
  if (!button) return;

  const start = (e) => {
    e.preventDefault();
    onPress();
  };

  const end = (e) => {
    e.preventDefault();
    onRelease();
  };

  button.addEventListener("mousedown", start);
  button.addEventListener("touchstart", start);

  ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach((evt) => {
    button.addEventListener(evt, end);
  });
}

// Liga botões mobile às "teclas virtuais"
setupHoldButton(
  btnUp,
  () => { keys["ArrowUp"] = true; },
  () => { keys["ArrowUp"] = false; }
);

setupHoldButton(
  btnDown,
  () => { keys["ArrowDown"] = true; },
  () => { keys["ArrowDown"] = false; }
);

if (btnShoot) {
  const shoot = (e) => {
    e.preventDefault();
    shootGift();
  };
  btnShoot.addEventListener("mousedown", shoot);
  btnShoot.addEventListener("touchstart", shoot);
}

// Botões de modo (menu)
btnPC.addEventListener("click", () => {
  selectMode("pc");
});

btnMobile.addEventListener("click", () => {
  selectMode("mobile");
});

// Botão de reiniciar no mobile (aparece só no game over)
if (mobileRestartBtn) {
  mobileRestartBtn.addEventListener("click", (e) => {
    e.preventDefault();
    resetGame();
  });
}

// Botão OK do aviso de orientação
if (btnOrientationOk) {
  btnOrientationOk.addEventListener("click", (e) => {
    e.preventDefault();
    hideOrientationModal();
  });
}

// ======================================================================
// FUNÇÕES AUXILIARES DO BOTÃO REINICIAR MOBILE E MODAL
// ======================================================================
function showMobileRestart() {
  if (GAME.mode === "mobile" && mobileRestartBtn) {
    mobileRestartBtn.style.display = "inline-flex";
  }
}

function hideMobileRestart() {
  if (mobileRestartBtn) {
    mobileRestartBtn.style.display = "none";
  }
}

function showOrientationModal() {
  if (mobileOrientationModal) {
    mobileOrientationModal.classList.remove("hidden");
  }
}

function hideOrientationModal() {
  if (mobileOrientationModal) {
    mobileOrientationModal.classList.add("hidden");
  }
}

// ======================================================================
// COLISÃO
// ======================================================================
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ======================================================================
// BACKGROUND
// ======================================================================
function drawBackground() {
  ctx.save();

  for (let i = 0; i < 40; i++) {
    const x = (i * 50 + Date.now() * 0.02) % canvas.width;
    const y = ((i * 30) % canvas.height) * 0.5;
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.fillStyle = "#020617";
  ctx.fillRect(0, canvas.height - 80, canvas.width, 80);

  for (let i = 0; i < canvas.width; i += 80) {
    const buildingHeight = 40 + (i % 120);
    ctx.fillStyle = "#020617";
    ctx.fillRect(i, canvas.height - 80 - buildingHeight, 60, buildingHeight);
  }

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

  ctx.restore();
}

// ======================================================================
// NÍVEIS
// ======================================================================
function updateLevel(delta) {
  GAME.levelTimeLeft -= delta;
  if (GAME.levelTimeLeft < 0) GAME.levelTimeLeft = 0;

  const ratio = GAME.levelTimeLeft / GAME.levelDuration;
  levelBarFill.style.width = (ratio * 100) + "%";
  levelTextEl.textContent = "Nível: " + GAME.level;

  if (GAME.levelTimeLeft === 0 && !GAME.gameOver) {
    nextLevel();
  }
}

function nextLevel() {
  GAME.level += 1;
  GAME.levelDuration = Math.max(15000, GAME.levelDuration - 2000);
  GAME.levelTimeLeft = GAME.levelDuration;

  GAME.spawnInterval = Math.max(500, GAME.spawnInterval - 150);
  GAME.planeSpawnInterval = Math.max(1200, GAME.planeSpawnInterval - 200);
}

// ======================================================================
// UPDATE
// ======================================================================
function update(delta) {
  if (!GAME.running) return;

  updateLevel(delta);

  // movimento do Papai Noel
  if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
    santa.y -= santa.speed;
  }
  if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
    santa.y += santa.speed;
  }
  if (santa.y < 0) santa.y = 0;
  if (santa.y + santa.h > canvas.height) santa.y = canvas.height - santa.h;

  // spawns
  if (Date.now() - GAME.lastSpawn > GAME.spawnInterval) {
    spawnDrone();
    GAME.lastSpawn = Date.now();
  }

  if (
    GAME.level >= 2 &&
    Date.now() - GAME.lastPlaneSpawn > GAME.planeSpawnInterval
  ) {
    spawnPlane();
    GAME.lastPlaneSpawn = Date.now();
  }

  if (Date.now() - GAME.lastBirdSpawn > GAME.birdSpawnInterval) {
    spawnBird();
    GAME.lastBirdSpawn = Date.now();
  }

  // drones
  for (let i = drones.length - 1; i >= 0; i--) {
    const d = drones[i];
    d.x -= d.speed;

    if (d.x + d.w < 0) {
      drones.splice(i, 1);
      continue;
    }

    if (!GAME.invincible && isColliding(santa, d)) {
      takeDamage();
      drones.splice(i, 1);
      continue;
    }
  }

  // aviões
  for (let i = planes.length - 1; i >= 0; i--) {
    const p = planes[i];
    p.x -= p.speed;

    if (p.x + p.w < -50) {
      planes.splice(i, 1);
      continue;
    }

    if (!GAME.invincible && isColliding(santa, p)) {
      takeDamage();
      planes.splice(i, 1);
      continue;
    }
  }

  // passarinhos
  for (let i = birds.length - 1; i >= 0; i--) {
    const b = birds[i];
    b.x -= b.speed;

    if (b.x + b.w < -50) {
      birds.splice(i, 1);
    }
  }

  // presentes
  for (let i = gifts.length - 1; i >= 0; i--) {
    const g = gifts[i];
    g.x += g.speed;

    if (g.x > canvas.width + 50) {
      gifts.splice(i, 1);
      continue;
    }

    let giftRemoved = false;

    // drones
    for (let j = drones.length - 1; j >= 0; j--) {
      const d = drones[j];
      if (isColliding(g, d)) {
        spawnExplosion(d.x, d.y, d.w, d.h);
        drones.splice(j, 1);
        gifts.splice(i, 1);
        giftRemoved = true;
        GAME.score += 1;
        updateScore();
        break;
      }
    }

    if (giftRemoved) continue;

    // aviões
    for (let j = planes.length - 1; j >= 0; j--) {
      const p = planes[j];
      if (isColliding(g, p)) {
        spawnExplosion(p.x, p.y, p.w, p.h);
        planes.splice(j, 1);
        gifts.splice(i, 1);
        giftRemoved = true;
        GAME.score += 1;
        updateScore();
        break;
      }
    }

    if (giftRemoved) continue;

    // passarinhos (erro = perde vida)
    for (let k = birds.length - 1; k >= 0; k--) {
      const b = birds[k];
      if (isColliding(g, b)) {
        spawnExplosion(b.x, b.y, b.w, b.h);
        birds.splice(k, 1);
        gifts.splice(i, 1);
        giftRemoved = true;

        if (!GAME.invincible) {
          takeDamage();
        }
        break;
      }
    }
  }

  // explosões
  for (let i = explosions.length - 1; i >= 0; i--) {
    const e = explosions[i];
    if (currentTimeMs - e.startTime > e.duration) {
      explosions.splice(i, 1);
    }
  }

  if (GAME.invincible && Date.now() - GAME.lastHit > GAME.invincibleTime) {
    GAME.invincible = false;
  }
}

// ======================================================================
// VIDA / PONTUAÇÃO
// ======================================================================
function takeDamage() {
  GAME.lives -= 1;
  updateHearts();
  GAME.invincible = true;
  GAME.lastHit = Date.now();

  if (GAME.lives <= 0) {
    GAME.lives = 0;
    GAME.running = false;
    GAME.gameOver = true;
    showMobileRestart(); // aparece só no game over (mobile)

    if (!bgMusic.paused) {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }
}

function updateHearts() {
  const hearts = ["❤️", "❤️", "❤️"];
  heartsEl.textContent = hearts.slice(0, GAME.lives).join("");
}

function updateScore() {
  scoreEl.textContent = "Inimigos destruídos: " + GAME.score;
}

// ======================================================================
// DESENHO
// ======================================================================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  birds.forEach((b) => drawBird(b));
  drones.forEach((d) => drawDrone(d));
  planes.forEach((p) => drawPlane(p));
  gifts.forEach((g) => drawGift(g));
  explosions.forEach((e) => drawExplosion(e));

  if (GAME.invincible && Math.floor(currentTimeMs / 100) % 2 === 0) {
    // pisca
  } else {
    drawSantaImage();
  }

  if (GAME.gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f9fafb";
    ctx.font = "bold 40px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

    ctx.font = "20px system-ui";
    ctx.fillText(
      "Inimigos destruídos: " + GAME.score,
      canvas.width / 2,
      canvas.height / 2 + 20
    );
    ctx.fillText(
      "Pressione ENTER ou toque em ⟳",
      canvas.width / 2,
      canvas.height / 2 + 60
    );
  }
}

// ======================================================================
// LOOP
// ======================================================================
function gameLoop(timestamp) {
  if (!GAME.lastTime) GAME.lastTime = timestamp;
  const delta = timestamp - GAME.lastTime;
  GAME.lastTime = timestamp;

  currentTimeMs = timestamp;

  if (GAME.running) {
    update(delta);
  }
  draw();

  requestAnimationFrame(gameLoop);
}

// ======================================================================
// MODO / RESET
// ======================================================================
function selectMode(mode) {
  GAME.mode = mode;

  if (mode === "pc") {
    canvas.width = 900;
    canvas.height = 450;
    mobileControlsEl.classList.remove("show");
    hideOrientationModal();      // no PC não precisa do aviso
  } else {
    // modo celular
    canvas.width = 900;
    canvas.height = 450;
    mobileControlsEl.classList.add("show");
    showOrientationModal();      // mostra o aviso com GIF
  }

  playBackgroundMusic();  // inicia a trilha após clique no menu

  hideMobileRestart();  // sempre começa sem botão de restart
  resetGame();
  menuEl.classList.add("hidden");
}

function resetGame() {
  GAME.running = true;
  GAME.gameOver = false;
  GAME.score = 0;
  GAME.lives = 3;
  GAME.invincible = false;
  GAME.lastHit = 0;

  hideMobileRestart();

  santa.x = 120;
  santa.y = canvas.height / 2 - santa.h / 2;

  drones.length = 0;
  planes.length = 0;
  gifts.length = 0;
  birds.length = 0;
  explosions.length = 0;

  GAME.level = 1;
  GAME.levelDuration = 30000;
  GAME.levelTimeLeft = GAME.levelDuration;
  GAME.spawnInterval = GAME.baseSpawnInterval;
  GAME.planeSpawnInterval = 2600;
  GAME.lastPlaneSpawn = 0;

  updateHearts();
  updateScore();
  levelBarFill.style.width = "100%";
  levelTextEl.textContent = "Nível: " + GAME.level;
  GAME.lastTime = 0;
  currentTimeMs = 0;

  // Se a música já tiver sido iniciada antes, retoma ao reiniciar o jogo
  if (musicStarted) {
    resumeBackgroundMusic();
  }
}

// Inicialização
updateHearts();
updateScore();
levelBarFill.style.width = "100%";
levelTextEl.textContent = "Nível: " + GAME.level;
requestAnimationFrame(gameLoop);
