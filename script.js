// Kích thước game
const gameW = 350, gameH = 600;
const ballR = 16;
let gameTimer = null;
let playTime = 30; // số giây chơi mỗi game
let timeLeft = playTime;
const FOOD_SIZE = 60;            // trùng với .falling-food width/height
const HALF = FOOD_SIZE / 2;

const catcherW = 90, catcherH = 90;  // size con vịt/khung bạn đang dùng

// Hitbox miệng giỏ so với góc trái-trên của con vịt
const BASKET = {
    offsetX: 7,    // cách mép trái con vịt (px)
    offsetY: 5,    // cách mép trên con vịt (px)
    width: 74,     // bề rộng miệng giỏ (px)
    height: 34     // bề cao vùng bắt (px)
};

// Danh sách món ăn, điểm số và tỉ lệ xuất hiện (weight càng cao càng dễ ra)
const foodList = [
    { img: 'food1.png', name: 'Mỳ Trộn', point: 1, weight: 40 },
    { img: 'food2.png', name: 'Lòng Xào nghệ', point: 2, weight: 25 },
    { img: 'food3.png', name: 'Bún đậu mắm tôm', point: 3, weight: 15 },
    { img: 'food4.png', name: 'Cháo', point: 4, weight: 8 },
    { img: 'food5.png', name: 'Cơm Gà', point: 5, weight: 5 },
    { img: 'food6.png', name: 'Mì Xíu', point: 6, weight: 3 },
    { img: 'food7.png', name: 'Bún', point: 7, weight: 2 },
    { img: 'food8.png', name: 'Mỳ Quảng', point: 8, weight: 1 },
];
// Hàm random món ăn theo trọng số (weight)
function getRandomFood() {
    const totalWeight = foodList.reduce((acc, f) => acc + f.weight, 0);
    let r = Math.random() * totalWeight;
    for (const food of foodList) {
        if (r < food.weight) return food;
        r -= food.weight;
    }
    return foodList[0]; // fallback, thực tế không xảy ra
}
function spawnFoods() {
    const num = Math.floor(Math.random() * 3) + 1; // Random 1-3 món ăn rơi
    for (let i = 0; i < num; i++) {
        const food = getRandomFood();
        let fx = Math.random() * (gameW - 40) + 20; // tránh sát mép
        fallingFoods.push({
            x: fx,
            y: 30,
            speed: 2.5 + Math.random() * 1.5,
            img: food.img,
            point: food.point
        });
    }
}
function renderFoods() {
    const cont = document.getElementById('foodContainer');
    cont.innerHTML = '';
    for (const f of fallingFoods) {
        let img = document.createElement('img');
        img.src = f.img;
        img.className = 'falling-food';
        img.style.left = (f.x - 20) + 'px';
        img.style.top = f.y + 'px';
        cont.appendChild(img);
    }
}


let catcherX = (gameW - catcherW) / 2;
let fallingFoods = []; // mỗi phần tử: {x, y, speed, img, point}
let caughtFoodsCount = new Array(foodList.length).fill(0);



const catcher = document.getElementById('catcher');
const ball = document.getElementById('ball');
const scoreEl = document.getElementById('score');
const gameover = document.getElementById('gameover');
const restartBtn = document.getElementById('restartBtn');
const startScreen = document.getElementById('startScreen');
const startBtn = document.getElementById('startBtn');

function resetGame() {
    playBGM();
    catcher.style.display = 'block';
    caughtFoodsCount = new Array(foodList.length).fill(0);
    catcherX = (gameW - catcherW) / 2;
    score = 0;
    playing = true;
    scoreEl.textContent = "Điểm: 0";
    gameover.style.display = 'none';
    fallingFoods = []; // Xóa sạch món ăn cũ
    moveCatcher();
    renderFoods();
    spawnFoods();
    timeLeft = playTime;
    document.getElementById('timer').textContent = `⏱️ ${timeLeft}s`;

    if (gameTimer) clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `⏱️ ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(gameTimer);
            playing = false;
            showResult(); // Sẽ làm bước sau
        }
    }, 1000);

    requestAnimationFrame(gameLoop);
}


function gameLoop() {
    if (!playing) return;

    // Rơi xuống
    for (const f of fallingFoods) f.y += f.speed;

    // === VA CHẠM: chỉ tính vùng miệng giỏ ===
    const catcherTop = gameH - catcherH - 80;   // vì #catcher đang bottom:10px
    // Tùy ảnh con vịt của bạn, tinh chỉnh 4 số dưới cho khớp MIỆNG GIỎ
    const basket = {
        offsetX: 7,     // cách mép trái con vịt (px)
        offsetY: 5,     // cách mép trên con vịt (px)
        width: 54,      // bề rộng miệng giỏ (px)
        height: 34      // bề cao vùng bắt (px)
    };
    const basketLeft = catcherX + basket.offsetX;
    const basketTop = catcherTop + basket.offsetY;
    const basketRight = basketLeft + basket.width;
    const basketBottom = basketTop + basket.height;

    // Nếu ảnh món ăn là 40x40 -> HALF = 20; nếu 60x60 -> HALF = 30
    const HALF = 30; // <<< đổi giá trị này nếu bạn đã tăng .falling-food lên 60px

    for (let i = fallingFoods.length - 1; i >= 0; i--) {
        const f = fallingFoods[i];

        // hitbox món ăn (vuông FOOD_SIZE x FOOD_SIZE, tâm tại f.x,f.y)
        const foodLeft = f.x - HALF;
        const foodRight = f.x + HALF;
        const foodTop = f.y - HALF;
        const foodBottom = f.y + HALF;

        const overlap =
            foodRight > basketLeft &&
            foodLeft < basketRight &&
            foodBottom > basketTop &&
            foodTop < basketBottom;

        if (overlap) {
            playCatch();
            score += f.point;
            scoreEl.textContent = "Điểm: " + score;

            const idx = foodList.findIndex(it => it.img === f.img);
            if (idx >= 0) caughtFoodsCount[idx]++;

            fallingFoods.splice(i, 1);
            showWowAtBasket(basketLeft, basketTop, basket.width, basket.height);         // món biến mất ngay khi chạm giỏ
        } else if (f.y > gameH) {
            fallingFoods.splice(i, 1);          // rơi khỏi khung
        }
    }

    // Vẽ lại sau khi xử lý va chạm để đỡ nhấp nháy
    renderFoods();

    // Hết món thì sinh lượt mới (1–3 món)
    if (fallingFoods.length === 0) spawnFoods();

    if (playing) requestAnimationFrame(gameLoop);
}




function moveCatcher() {
    catcher.style.left = catcherX + "px";
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

restartBtn.onclick = function () {
    resetGame();
};

startBtn.onclick = function () {
    startScreen.style.display = 'none';
    started = true;
    playBGM();
    resetGame();
};

// Hiện màn hình bắt đầu khi load
window.onload = function () {
    startScreen.style.display = 'block';
    gameover.style.display = 'none';
    moveCatcher();
    renderFoods();   // Thay vì moveBall()
    playing = false;
    started = false;
};

function showResult() {
    // 1) Tìm món ăn được bắt nhiều nhất
    stopBGM();   // <-- tắt nhạc khi hiện overlay kết quả

    let maxCount = 0, maxIdx = 0;
    for (let i = 0; i < caughtFoodsCount.length; i++) {
        if (caughtFoodsCount[i] > maxCount) {
            maxCount = caughtFoodsCount[i];
            maxIdx = i;
        }
    }
    const bestFood = foodList[maxIdx];

    // 2) Dừng game + dọn màn
    playing = false;
    if (gameTimer) clearInterval(gameTimer);
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = "";

    // Ẩn vịt + xoá toàn bộ món ăn đang rơi
    catcher.style.display = 'none';
    fallingFoods = [];
    const foodCont = document.getElementById('foodContainer');
    if (foodCont) foodCont.innerHTML = '';

    // 3) Render overlay kết quả (căn giữa bằng flex)
    const msg = `
    <div class="result-card">
      <div style="font-size:1.4rem;color:#0076b6;font-weight:800;">KẾT THÚC!</div>
      <div style="margin-top:8px;font-size:1.1rem">
        Điểm của bạn: <b>${score}</b>
      </div>
      <div style="margin:12px 0 8px;color:#e53935;font-size:1.2rem;font-weight:800;">
        Bạn hứng được nhiều nhất là:
      </div>
      <img src="${bestFood.img}" style="width:72px;height:72px;border-radius:14px;box-shadow:0 6px 16px #00000012;">
      <div style="margin-top:8px;font-weight:800;font-size:1.15rem;">
        ${bestFood.name}
      </div>
      <div style="margin-top:4px;">Số lần: <b>${maxCount}</b></div>
      <div style="margin:14px 0 8px;text-align:center;">
  <div style="color:#e53935;font-size:18px;font-weight:700;line-height:1.25;">
    Hãy đặt ngay món này trên
  </div>
  <a href="https://ahafood.ai/store" target="_blank" style="display:inline-block;margin-top:6px;">
    <img src="logo.png" alt="AhaFood.AI" style="height:65px;display:block;">
  </a>
</div>

      <button id="restartBtn" style="margin-top:6px;padding:10px 24px;font-size:1.05rem;background:#0076b6;color:#fff;border:none;border-radius:8px;cursor:pointer;">
        Chơi lại
      </button>
            <a href="https://ahafood.ai/store" target="_blank" 
   style="margin-top:6px;padding:10px 24px;font-size:1.05rem;
          background:#e53935;color:#fff;border:none;border-radius:8px;
          cursor:pointer;text-decoration:none;display:inline-block;">
  Đặt món
</a>
    </div>
  `;
    gameover.innerHTML = msg;
    gameover.style.display = 'flex'; // dùng flex để căn giữa overlay

    // 4) Gắn lại sự kiện nút chơi lại
    document.getElementById('restartBtn').onclick = resetGame;
}

// tinh chỉnh hiệu ứng (đổi số tại đây cho khớp)
const WOW_SIZE = 80;   // size ảnh wow.png
const WOW_DX = 20;   // dịch sang PHẢI (+) / TRÁI (-)
const WOW_DY = -21;   // dịch LÊN (-) / XUỐNG (+)

function showWowAtBasket(basketLeft, basketTop, basketW, basketH) {
    const wow = document.createElement('img');
    wow.src = 'wow.png';
    wow.style.position = 'absolute';
    wow.style.width = WOW_SIZE + 'px';
    wow.style.height = WOW_SIZE + 'px';
    wow.style.pointerEvents = 'none';

    // canh theo TÂM miệng giỏ + offset tinh chỉnh
    wow.style.left = (basketLeft + basketW / 2 - WOW_SIZE / 2 + WOW_DX) + 'px';
    wow.style.top = (basketTop + basketH / 2 - WOW_SIZE / 2 + WOW_DY) + 'px';

    wow.style.opacity = '0';
    wow.style.transform = 'scale(0.6)';
    wow.style.transition = 'transform 0.2s ease, opacity 0.2s ease';

    document.getElementById('game').appendChild(wow);
    requestAnimationFrame(() => {
        wow.style.opacity = '1';
        wow.style.transform = 'scale(1)';
    });
    setTimeout(() => {
        wow.style.opacity = '0';
        wow.remove();
    }, 450);
}

// Audio
const bgm = document.getElementById('bgm');

function playBGM() {
    // bắt đầu nhỏ rồi tăng dần
    bgm.volume = 0.0;
    bgm.currentTime = 0;
    bgm.play().catch(() => { /* ignore autoplay errors */ });

    let v = 0.0;
    const id = setInterval(() => {
        v += 0.1;
        if (v >= 0.6) { v = 0.6; clearInterval(id); }
        bgm.volume = v;
    }, 60);
}

function stopBGM() {
    // giảm dần rồi dừng
    let v = bgm.volume || 0.6;
    const id = setInterval(() => {
        v -= 0.1;
        if (v <= 0) {
            v = 0; clearInterval(id);
            bgm.pause();
        }
        bgm.volume = v;
    }, 60);
}

const sfxCatchEl = document.getElementById('sfxCatch');

// pool 6 audio để phát chồng nhanh, tránh nghẽn
const CATCH_POOL_SIZE = 6;
const catchPool = Array.from({ length: CATCH_POOL_SIZE }, () => sfxCatchEl.cloneNode(true));
let catchIdx = 0;

function playCatch() {
  const a = catchPool[catchIdx];
  catchIdx = (catchIdx + 1) % CATCH_POOL_SIZE;
  try {
    a.currentTime = 0;  // tua về đầu
    a.volume = 0.9;
    a.play();
  } catch (e) {
    // ignore
  }
}




