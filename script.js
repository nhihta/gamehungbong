// Kích thước game
const gameW = 350, gameH = 600;
const catcherW = 90, catcherH = 18;
const ballR = 16;
let catcherX = (gameW - catcherW)/2;
let ballX, ballY, ballSpeed, score, playing, started = false;

const catcher = document.getElementById('catcher');
const ball = document.getElementById('ball');
const scoreEl = document.getElementById('score');
const gameover = document.getElementById('gameover');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

function resetGame() {
  catcherX = (gameW - catcherW)/2;
  ballX = Math.random() * (gameW - 2*ballR) + ballR;
  ballY = 30;
  ballSpeed = 3.2;
  score = 0;
  playing = true;
  scoreEl.textContent = "Điểm: 0";
  gameover.style.display = 'none';
  moveCatcher();
  moveBall();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!playing) return;
  ballY += ballSpeed;
  moveBall();

  // Kiểm tra bắt bóng
  if (
    ballY + ballR >= gameH - catcherH - 30 &&
    ballY + ballR <= gameH - 30 &&
    ballX + ballR > catcherX &&
    ballX - ballR < catcherX + catcherW
  ) {
    score++;
    scoreEl.textContent = "Điểm: " + score;
    ballSpeed += 0.12; // Tăng tốc
    // Bóng mới
    ballX = Math.random() * (gameW - 2*ballR) + ballR;
    ballY = 30;
  } else if (ballY > gameH) {
    // Game over
    playing = false;
    gameover.style.display = 'block';
  }
  if (playing) requestAnimationFrame(gameLoop);
}

function moveCatcher() {
  catcher.style.left = catcherX + "px";
}
function moveBall() {
  ball.style.left = (ballX - ballR) + "px";
  ball.style.top = ballY + "px";
}

// Điều khiển trên mobile (vuốt)
let touchStartX = null, catcherStartX = null;
document.getElementById('game').addEventListener('touchstart', e => {
  if (!playing) return;
  touchStartX = e.touches[0].clientX;
  catcherStartX = catcherX;
});
document.getElementById('game').addEventListener('touchmove', e => {
  if (!playing) return;
  let dx = e.touches[0].clientX - touchStartX;
  let newX = catcherStartX + dx;
  // Giới hạn trong khung
  if (newX < 0) newX = 0;
  if (newX > gameW - catcherW) newX = gameW - catcherW;
  catcherX = newX;
  moveCatcher();
});

// Điều khiển trên PC (kéo chuột)
let isDragging = false, mouseStartX = null, catcherStartMouse = null;
document.getElementById('game').addEventListener('mousedown', e => {
  if (!playing) return;
  isDragging = true;
  mouseStartX = e.clientX;
  catcherStartMouse = catcherX;
});
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', e => {
  if (!isDragging || !playing) return;
  let dx = e.clientX - mouseStartX;
  let newX = catcherStartMouse + dx;
  if (newX < 0) newX = 0;
  if (newX > gameW - catcherW) newX = gameW - catcherW;
  catcherX = newX;
  moveCatcher();
});

restartBtn.onclick = function(){
  resetGame();
};

startBtn.onclick = function(){
  startScreen.style.display = 'none';
  started = true;
  resetGame();
};

// Hiện màn hình bắt đầu khi load
window.onload = function(){
  startScreen.style.display = 'block';
  gameover.style.display = 'none';
  moveCatcher();
  moveBall();
  playing = false;
  started = false;
};
