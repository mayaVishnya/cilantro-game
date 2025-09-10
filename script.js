// Managing music and sounds
const bgMusic = document.getElementById("bg-music");
const collectSound = document.getElementById("collect-sound");
const gameOverSound = document.getElementById("game-over-sound");

const GAME_WIDTH = 400;
const GAME_HEIGHT = 250;

const gameCanvas = document.getElementById("game-canvas");
const ctx = gameCanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const bgImage = new Image();
bgImage.src = "./assets/background.png"

let gameOver = false;
let firstStart = true;
let score = 0;
let gameLoopRunning = false;

function resizeCanvas() {
    // target size = 2/3 of window
    const targetWidth = window.innerWidth * (2 / 3);
    const targetHeight = window.innerHeight * (2 / 3);

    const scale = Math.min(
        targetWidth / GAME_WIDTH,
        targetHeight / GAME_HEIGHT
    );

    gameCanvas.style.width = (GAME_WIDTH * scale) + "px";
    gameCanvas.style.height = (GAME_HEIGHT * scale) + "px";
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const playerImg = new Image();
playerImg.src = "./assets/vali-sprite-right.png";

let player = {
    x: 250,
    y: 315,
    size: 116,
    speed: 3
}

// Key Controls logic
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
})

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
})

function update() {
    if(keys["ArrowLeft"]) {
        player.x -= player.speed;
        if(playerImg.src.includes("vali-sprite-right.png")) {
            playerImg.src = "./assets/vali-sprite-left.png"
        }
    }
    if(keys["ArrowRight"]){
        player.x += player.speed;
        if(playerImg.src.includes("vali-sprite-left.png")) {
            playerImg.src = "./assets/vali-sprite-right.png"
        }
    }

    if(player.x < 0) player.x = 0;
    if(player.x + player.size > gameCanvas.width) player.x = gameCanvas.width - player.size;
}


// Food Rendering logic
const foodImg = new Image();

let foodItems = [];

function spawnItem() {
    const isCilantro = Math.random() < 0.25; // 25% chance for getting cilantro
    const isPizza = Math.random() < 0.45;
    const isBurger = Math.random() < 0.30;
    const isCoke = Math.random() < 0.10;

    foodItems.push({
        x: Math.random() * (gameCanvas.width - 40),
        y: -40,
        size: 40,
        speed: 2 + Math.random() * 1.5,
        cilantro: isCilantro,
        pizza: isPizza,
        burger: isBurger,
        coke: isCoke
    });
}

let spawnInterval = null;
let birdInterval = null;

function startSpawning() {
    if (!spawnInterval) {
        spawnInterval = setInterval(() => {
          if (!gameOver) spawnItem();
        }, 1500);
    }
    if (!birdInterval) {
        birdInterval = setInterval(() => {
            spawnBird();
        }, 10000);
    }
}

function triggerGameOver() {
    gameOver = true;
    foodItems = []
    bgMusic.pause();
    gameOverSound.currentTime = 0;
    gameOverSound.play();

    // stop spawning completely
    clearInterval(spawnInterval);
}

function updateFoodItems () {
    if (gameOver) return;

    for(let i = 0; i < foodItems.length; i++) {
        let item = foodItems[i];
        item.y += item.speed;

        if(
            item.x < player.x + player.size &&
            item.x + item.size > player.x &&
            item.y < player.y + player.size &&
            item.y + item.size > player.y
        ) {
           if(item.cilantro) {
            triggerGameOver();
           } else {
                if (item.coke) {
                    score += 5;
                } else {
                    score++;
                }
                collectSound.currentTime = 0;
                collectSound.volume = 0.3;
                collectSound.play();
            }
            foodItems.splice(i, 1);
                i--;
        }

        if(item.y > gameCanvas.height) {
            foodItems.splice(i, 1);
            i--;
        }
    }
}

// Rendering main game
function draw(){
    ctx.clearRect(0,0, gameCanvas.width, gameCanvas.height);
    ctx.drawImage(bgImage, 0, 0, gameCanvas.width, gameCanvas.height);
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);
    drawScore();
    
    if(showBird) {
        drawRandomBird();
    }

    for(let item of foodItems) {
        if(item.cilantro) {
            foodImg.src = "./assets/cilantro.png";
        } else if (item.coke) {
            foodImg.src = "./assets/coke.png";
        } else if (item.burger) {
            foodImg.src = "./assets/burger.png";
        } else {
            foodImg.src = "./assets/pizza.png";
        }
        ctx.drawImage(foodImg, item.x, item.y, item.size, item.size);
    }

    if(gameOver && !firstStart) {
        drawGameOver();
        drawStartBtn();
    } else if (firstStart) {
        drawStartBtn();
    }
}

function drawScore() {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);   // cancel any translate/scale/rotate
  ctx.globalAlpha = 1;
  ctx.font = "20px monospace";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000";
  ctx.fillText(`Score: ${score}`, 8, 8);
  ctx.restore();
}

function drawGameOver() {
    const text = "GAME OVER! Vali ate cilantro :(";
    const scoreText = "Your total score: " + score;
    ctx.font = "20px pixelFont";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const x = gameCanvas.width / 2;
    const y = gameCanvas.height / 5;

    const textMetrics = ctx.measureText(text);
    const padding = 10;

    // Draw background rectangle
    ctx.fillStyle = "white";
    ctx.fillRect(
        x - textMetrics.width / 2 - padding,
        y - 40 / 2 - padding, // approximate height from font size
        textMetrics.width + padding * 2,
        80 + padding * 4
    );

    // Draw the text
    ctx.fillStyle = "black"; // text color
    ctx.fillText(text, x, y);
    ctx.fillText(scoreText, x, gameCanvas.height / 3);
}

// Adding Start Button
const startBtnImg = new Image();
startBtnImg.src = "./assets/start-btn.png";
const startBtn = {
    x: gameCanvas.width / 2 - 64,
    y: gameCanvas.height / 2,
    width: 128,
    height: 64
}

function drawStartBtn() {
    ctx.drawImage(
        startBtnImg,
        startBtn.x, 
        startBtn.y,
        startBtn.width,
        startBtn.height
    )
}

// add a random bird in the background :)
const birdImg = new Image();
birdImg.src = "./assets/bird-up.png";
let showBird = false;

const bird = {
    x: -40,
    y: gameCanvas.height / 5,
    size: 40,
    speed: 4
}

function spawnBird() {
    showBird = true;
}

function drawRandomBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.size, bird.size);
}

function updateRandomBird() {
    if(showBird && bird.x < gameCanvas.width) {
        bird.x += bird.speed;
        if(bird.x % 16 === 0 && birdImg.src.includes("up")) {
            birdImg.src = "./assets/bird-down.png";
        } else if (bird.x % 16 === 0) {
            birdImg.src = "./assets/bird-up.png";
        }
    }
    else if (showBird && bird.x >= gameCanvas.width ) {
        bird.x = -40;
        showBird = false;
    }
}


gameCanvas.addEventListener("click", (e) => {
    const rect = gameCanvas.getBoundingClientRect();
    const scaleX = gameCanvas.width / rect.width;   // account for CSS scaling
    const scaleY = gameCanvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (
        mouseX >= startBtn.x &&
        mouseX <= startBtn.x + startBtn.width &&
        mouseY >= startBtn.y &&
        mouseY<= startBtn.y + startBtn.height 
    ) {
        startGame();
        firstStart = false;
    }
})

// starting the game on enter pressed
document.addEventListener("keydown", (e) => {
  if ((gameOver || firstStart) && (e.key === "Enter" || e.key === "Return")) {
    startGame();
    firstStart = false;
  }
});

// prevent food items from spawning in the inactive tab
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        clearInterval(spawnInterval);
        clearInterval(birdInterval);
        spawnInterval = null;
        birdInterval = null;
        foodItems = [];

        bgMusic.pause();
    } else {
        firstStart = true;
        gameOver = true;
    }
})

function gameLoop() {
    if (!gameOver) {
        update();
        updateRandomBird();
        updateFoodItems();
    
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        draw();
        gameLoopRunning = false;
    }
}

function startGame() {
    if(gameLoopRunning) return;

    clearInterval(spawnInterval);
    clearInterval(birdInterval);
    spawnInterval = null;
    birdInterval = null;
    player.x = 250;
    player.y = 315;
    items = [];
    score = 0;
    gameOver = false;

    bgMusic.currentTime = 0;
    bgMusic.volume = 0.2;
    bgMusic.play();

    startSpawning();
    gameLoopRunning = true;
    gameLoop();
}

window.onload = function() {
    draw();
}
