
const bird = document.getElementById("bird");
const pipeTop = document.querySelector(".pipe-top");
const pipeBottom = document.querySelector(".pipe-bottom");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("play-again-button"); // nút "Chơi lại"
const backToMenuButton = document.getElementById("back-to-home-button"); // nút "Về màn hình chính"
const goToWelcomeButton = document.getElementById("go-to-welcome-button");
// Âm thanh
const bgMusic = new Audio("sounds/Background_Sound.mp3");
const jumpSound = new Audio("sounds/Jump_Sound.mp3");
const scoreSound = new Audio("sounds/Point_Sound.mp3");
const gameOverSound = new Audio("sounds/uhhh_Sound.mp3");

bgMusic.loop = true;
bgMusic.volume = 0.5; // Điều chỉnh âm lượng nếu cần




let bullets = [];
let bulletIntervalId = null;
let selectedSkin = 1;
let pipeWidth = 60;
let birdY = 200;
let velocity = 0;
let gravity = 0.5;
let pipeX = 400;
let pipeGap = 150;
let topHeight = 200;
let score = 0;
let isGameOver = false;
let pipeSpeed = 2;
let playerName = "";
let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
let currentDifficulty = "";
let gameLoopId = null;



const clearLeaderboardButton = document.getElementById("clear-leaderboard");

clearLeaderboardButton.addEventListener("click", () => {
  if (confirm("Bạn có chắc chắn muốn xóa bảng xếp hạng?")) {
    leaderboard = [];
    localStorage.removeItem("leaderboard");  // Xóa dữ liệu localStorage
    showLeaderboard(); // Cập nhật lại bảng (hiển thị rỗng)
  }
});


function resetGame() {
  cancelAnimationFrame(gameLoopId); // Hủy vòng lặp cũ nếu còn

  birdY = 200;
  velocity = 0;
  pipeX = 400;
  topHeight = 200;
  score = 0;
  isGameOver = false;
  scoreDisplay.textContent = `${playerName} - Score: ${score}`;
  restartButton.style.display = "none";
  bird.style.top = birdY + "px";
  pipeTop.style.width = pipeWidth + "px";
  pipeBottom.style.width = pipeWidth + "px";
  pipeTop.style.left = pipeX + "px";
  pipeBottom.style.left = pipeX + "px";
  pipeTop.style.height = topHeight + "px";
  pipeBottom.style.height = 600 - topHeight - pipeGap + "px";
  bird.style.backgroundImage = `url("Images/skin${selectedSkin}.png")`;
  bird.style.backgroundSize = "cover";
  bird.style.borderRadius = "50%"; // Làm tròn ảnh



  document.getElementById("leaderboard").style.display = "none";
  // 👉 Xóa đạn cũ
  bullets.forEach(b => b.remove());
  bullets = [];

  // 👉 Nếu là nightmare thì bắt đầu sinh đạn
  if (currentDifficulty === "nightmare") {
    bulletIntervalId = setInterval(spawnBullet, 1500); // mỗi 1.5s sinh viên đạn
  }
  bgMusic.currentTime = 0;
  bgMusic.play();
  setTimeout(() => {
    gameLoopId = requestAnimationFrame(gameLoop); // Gán ID mới
  }, 300);
}



function startGame() {

  const nameInput = document.getElementById("player-name").value.trim();
  const difficulty = document.getElementById("difficulty").value;
  selectedSkin = document.getElementById("skin-select").value;


  if (!nameInput) {
    alert("Vui lòng nhập tên của bạn!");
    return;
  }

  playerName = nameInput;
  currentDifficulty = difficulty;

  // Thay đổi thông số theo độ khó
  switch (difficulty) {
    case "easy":
      pipeSpeed = 2.5;
      pipeWidth = 60;
      pipeGap = 180; // dễ: khoảng trống lớn
      break;
    case "normal":
      pipeSpeed = 2.5;
      pipeWidth = 60;
      pipeGap = 150; // trung bình
      break;
    case "hard":
      pipeSpeed = 2.5;
      pipeWidth = 65;
      pipeGap = 130; // khó: khoảng trống hẹp
      break;
    case "nightmare":
      pipeSpeed = 3;
      pipeWidth = 70;
      pipeGap = 160;
      break;
    case "impossible":
      pipeSpeed = 3;
      pipeWidth = 10;
      pipeGap = 50;
      break;
  }
  bgMusic.currentTime = 0;
  bgMusic.play();
  startScreen.style.display = "none";
  gameContainer.style.display = "block";
  document.getElementById("leaderboard").style.display = "none";
  resetGame();
}

function spawnBullet() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.top = Math.random() * 500 + "px";
  bullet.style.left = "400px";
  gameContainer.appendChild(bullet);
  bullets.push(bullet);
}



function showLeaderboard() {
  const tbody = document.getElementById("leaderboard-body");
  tbody.innerHTML = "";

  const sorted = leaderboard
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5); // hiển thị top 5

  for (const entry of sorted) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.name}</td>
      <td>${entry.score}</td>
      <td>${entry.difficulty}</td>
    `;
    tbody.appendChild(row);
  }
}



function gameLoop() {
  if (isGameOver) {
    cancelAnimationFrame(gameLoopId);
    clearInterval(bulletIntervalId); // Dừng tạo đạn khi game over
    return;
  }

  velocity += gravity;
  birdY += velocity;
  bird.style.top = birdY + "px";

  pipeX -= pipeSpeed;
  pipeTop.style.left = pipeX + "px";
  pipeBottom.style.left = pipeX + "px";

  if (pipeX < -60) {
    pipeX = 400;
    topHeight = Math.floor(Math.random() * 250) + 50;
    pipeTop.style.height = topHeight + "px";
    pipeBottom.style.height = 600 - topHeight - pipeGap + "px";

    score++;
    scoreDisplay.textContent = `${playerName} - Score: ${score}`;
    scoreSound.currentTime = 0;
    scoreSound.play();

  }

  const birdRect = bird.getBoundingClientRect();
  const topRect = pipeTop.getBoundingClientRect();
  const bottomRect = pipeBottom.getBoundingClientRect();
  const gameRect = gameContainer.getBoundingClientRect();

  // 🟥 Kiểm tra va chạm với pipe hoặc rớt ra ngoài
  if (
    birdRect.top < 0 ||
    birdRect.bottom > gameRect.bottom ||
    (birdRect.right > topRect.left &&
      birdRect.left < topRect.right &&
      (birdRect.top < topRect.bottom || birdRect.bottom > bottomRect.top))
  ) {
    isGameOver = true;
    clearInterval(bulletIntervalId);
    bgMusic.pause();
    gameOverSound.play();

    leaderboard.push({
      name: playerName,
      score: score,
      difficulty: currentDifficulty
    });

    localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
    showLeaderboard();

    document.getElementById("leaderboard").style.display = "flex";
    restartButton.style.display = "block";
    return;
  }

  // 🔴 Nightmare Mode: kiểm tra va chạm với đạn
  if (currentDifficulty === "nightmare") {
    bullets.forEach((bullet, index) => {
      let bulletLeft = parseFloat(bullet.style.left);
      bulletLeft -= pipeSpeed + 2; // tốc độ đạn nhanh hơn pipe
      bullet.style.left = bulletLeft + "px";

      // Xóa đạn nếu ra khỏi màn hình
      if (bulletLeft < -20) {
        bullet.remove();
        bullets.splice(index, 1);
      }

      const bulletRect = bullet.getBoundingClientRect();

      if (
        bulletRect.left < birdRect.right &&
        bulletRect.right > birdRect.left &&
        bulletRect.top < birdRect.bottom &&
        bulletRect.bottom > birdRect.top
      ) {
        isGameOver = true;
        clearInterval(bulletIntervalId);

        leaderboard.push({
          name: playerName,
          score: score,
          difficulty: currentDifficulty
        });

        localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
        showLeaderboard();

        document.getElementById("leaderboard").style.display = "flex";
        restartButton.style.display = "block";
        return;
      }
    });
  }

  gameLoopId = requestAnimationFrame(gameLoop);
}





startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGame);
backToMenuButton.addEventListener("click", () => {
  cancelAnimationFrame(gameLoopId);
  isGameOver = false;
  startScreen.style.display = "block";
  gameContainer.style.display = "none";
  document.getElementById("leaderboard").style.display = "none";
});
startButton.addEventListener("click", startGame);
goToWelcomeButton.addEventListener("click", () => {
  window.location.href = "index.html"; // chuyển về trang welcome
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !isGameOver) {
    velocity = -8;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

gameContainer.addEventListener("click", () => {
  if (!isGameOver) {
    velocity = -8;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});

gameContainer.addEventListener("touchstart", () => {
  if (!isGameOver) {
    velocity = -8;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
});


