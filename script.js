const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const playerImg = new Image();
playerImg.src = "./assets/vali-sprite-right.png";

let player = {
    x: 200,
    y: 318,
    size: 80,
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
        console.log(playerImg.src)
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
const cilantroImg = new Image();
cilantroImg.src = "./assets/cilantro.png"

const foodImg = new Image();
foodImg.src = "./assets/pizza.png"

let foodItems = [];
let score = 0;
let gameOver = false;

function spawnItem() {
    const isCilantro = Math.random() < 0.15; // 20% chance for getting cilantro
    foodItems.push({
        x: Math.random() * (gameCanvas.width - 32),
        y: -32,
        size: 32,
        speed: 2 + Math.random() * 1.5,
        cilantro: isCilantro
    });
}
setInterval(spawnItem, 1000);

function updateFoodItems () {
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
            gameOver = true;
           }
           else {
            score++;
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
    ctx.drawImage(playerImg, player.x, player.y, player.size, player.size);

    for(let item of foodItems) {
        if(item.cilantro) {
            ctx.drawImage(cilantroImg, item.x, item.y, item.size, item.size);
        }
        else {
            ctx.drawImage(foodImg, item.x, item.y, item.size, item.size);
        }
    }

    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 5, 30);

    if(gameOver) {
        ctx.fillStyle = "red";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 80, gameCanvas.height / 2);
    }
}

function gameLoop() {
    if (!gameOver) {
        update();
        updateFoodItems();
    
        draw();
        requestAnimationFrame(gameLoop);
    } else {
        draw();
    }
}

window.onload = function() {
    gameLoop();
}