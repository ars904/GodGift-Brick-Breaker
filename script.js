const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const livesDisplay = document.getElementById("lives");
const levelDisplay = document.getElementById("level");
const startButton = document.getElementById("startButton");
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const startScreen = document.getElementById("startScreen");
const controlsContainer = document.getElementById("controlsContainer");
const trailLength = 15; // Number of trail segments
const trailPositions = []; // Array to store ball positions

// Game variables
let lives = 5;
let level = 1;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballDX = 0;
let ballDY = 0;
let ballRadius = 10;
let trailAlpha = 0.7;
let paddleHeight = 12;
let paddleWidth = 120;
let paddleX = (canvas.width - paddleWidth) / 2;
let rightPressed = false;
let leftPressed = false;
let brickRowCount = 7;
let brickColumnCount = 7;
let brickWidth = 55;
let brickHeight = 20;
let brickPadding = 5;
let brickOffsetTop = 7.5;
let brickOffsetLeft = 7.5;
let bricks = [];
let brickFallSpeed = 0.5;
let gameRunning = false;
let gameOver = false;

// Initialize bricks
function initializeBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                falling: false, 
                color: `hsl(${Math.random() * 360}, 100%, 50%)` 
            };
        }
    }
}

// Draw game elements
function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
}

   function drawTrail() {
    for (let i = 0; i < trailPositions.length; i++) {
        const pos = trailPositions[i];
        const alpha = trailAlpha * (1 - i/trailLength); // Fade out older segments
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ballRadius * (1 - i/(trailLength*2)), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; // White trail (change color if needed)
        ctx.fill();
        ctx.closePath();
    }
}
   function updateTrail() {
    // Add current position to the beginning of the array
    trailPositions.unshift({ x: ballX, y: ballY });
    
    // Remove oldest position if trail is too long
    if (trailPositions.length > trailLength) {
        trailPositions.pop();
    }
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#fffb00";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const b = bricks[c][r];
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = b.color;
                ctx.fill();
                ctx.strokeStyle = "#000";
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

function showGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px 'Times New Roman'";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 20);
    ctx.font = "16px 'Times New Roman'";
    ctx.fillText("Click to restart", canvas.width/2, canvas.height/2 + 20);
}

function showWin() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px 'Times New Roman'";
    ctx.fillStyle = "green";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width/2, canvas.height/2 - 20);
    ctx.font = "16px 'Times New Roman'";
    ctx.fillText("Click to restart", canvas.width/2, canvas.height/2 + 20);
}

function checkLevelCompletion() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// Game logic
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ballX + ballRadius > b.x && 
                    ballX - ballRadius < b.x + brickWidth && 
                    ballY + ballRadius > b.y && 
                    ballY - ballRadius < b.y + brickHeight) {
                    
                    const ballCenterX = ballX;
                    const ballCenterY = ballY;
                    const brickCenterX = b.x + brickWidth / 2;
                    const brickCenterY = b.y + brickHeight / 2;
                    
                    const dx = ballCenterX - brickCenterX;
                    const dy = ballCenterY - brickCenterY;
                    const absDx = Math.abs(dx);
                    const absDy = Math.abs(dy);
                    
                    if (absDx > absDy) {
                        ballDX = -ballDX;
                    } else {
                        ballDY = -ballDY;
                    }
                    
                    b.status = 0;
                    b.falling = true;
                    
                    if (checkLevelCompletion()) {
                        levelUp();
                    }
                }
            }
        }
    }
}

function levelUp() {
    level++;
    levelDisplay.textContent = level;
    if (level > 3) {
        endGame();
        return;
    } 

        else {
        ballDX = ballDX > 0 ? Math.min(ballDX + 0.5, 7) : Math.max(ballDX - 0.5, -7);
        ballDY = ballDY > 0 ? Math.min(ballDY + 0.5, 7) : Math.max(ballDY - 0.5, -7);
        initializeBricks();
        paddleWidth = Math.max(50, paddleWidth - 10);
        resetBallAndPaddle();
    }
}

// Main game loop
function draw() {
    if (!gameRunning && !gameOver) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (gameOver) {
        if (level > 3) {
            showWin();
        } else {
            showGameOver();
        }
        return;
    }
    
    // Only draw game elements if game is running and not over
    updateTrail();
    drawTrail();
    drawBricks();
    drawBall();
    drawPaddle();
    collisionDetection();

    // Ball movement and collision code...
    if (ballX + ballDX > canvas.width - ballRadius || ballX + ballDX < ballRadius) {
        ballDX = -ballDX;
    }
    if (ballY + ballDY < ballRadius) {
        ballDY = -ballDY;
    } else 
    if (ballY + ballDY > canvas.height - ballRadius) {
        if (ballX > paddleX && ballX < paddleX + paddleWidth) {
            const hitPosition = (ballX - paddleX) / paddleWidth;
            const angle = (hitPosition * 120 - 60) * (Math.PI / 180);
            const speed = Math.max(5, Math.sqrt(ballDX * ballDX + ballDY * ballDY));
            ballDX = speed * Math.sin(angle);
            ballDY = -speed * Math.cos(angle);
        } else {
            loseLife();
        }
    }

    ballX += ballDX;
    ballY += ballDY;

    // Paddle movement
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 12;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 12;
    }

    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.falling && b.y + brickHeight > canvas.height - paddleHeight &&
                b.x > paddleX && b.x < paddleX + paddleWidth) {
                endGame();
            }
        }
    }

    if (gameRunning) {
        requestAnimationFrame(draw);
    }
}

function loseLife() {
    lives--;
    livesDisplay.textContent = lives;
    if (lives <= 0) {
        endGame();
        showGameOver(); // Explicitly call showGameOver
    } else {
        // Reset to initial speed when losing a life
        const initialSpeed = parseInt(speedSlider.value);
        ballDX = initialSpeed * (Math.random() > 0.5 ? 1 : -1);
        ballDY = -initialSpeed;

        resetBallAndPaddle();
        gameRunning = false;
        setTimeout(() => {
            gameRunning = true;
            draw();
        }, 1500);
    }
}

function resetBallAndPaddle() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    paddleX = (canvas.width - paddleWidth) / 2;
    const speed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
    ballDX = speed * (Math.random() > 0.5 ? 1 : -1);
    ballDY = -speed;
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    // Force a redraw to show the game over/win message
    draw();
}

function initializeGame() {
    lives = 5;
    level = 1;
    livesDisplay.textContent = lives;
    levelDisplay.textContent = level;
    paddleWidth = 120;
    resetBallAndPaddle();
    initializeBricks();
    gameOver = false;
    startScreen.classList.remove("hidden");
    canvas.style.display = 'none';
    controlsContainer.classList.add("hidden");
}

function startGame() {
    canvas.style.display = 'block';
    controlsContainer.classList.remove("hidden");
    startScreen.classList.add("hidden");
    gameRunning = true;
    gameOver = false;
    ballDX = parseInt(speedSlider.value) * (Math.random() > 0.5 ? 1 : -1);
    ballDY = -parseInt(speedSlider.value);
    draw();
}

// Event handlers
function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

// Event listeners
speedSlider.addEventListener("input", function() {
    speedValue.textContent = speedSlider.value;
    if (gameRunning) {
        const speed = parseInt(speedSlider.value);
        const currentSpeed = Math.sqrt(ballDX * ballDX + ballDY * ballDY);
        const speedratio = speed / currentSpeed;
        ballDX *= ratio;
        ballDY *= ratio;
    }
});

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
startButton.addEventListener("click", startGame);

canvas.addEventListener("mousemove", function(e) {
    if (!gameRunning || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
    }
});

canvas.addEventListener("touchmove", function(e) {
    if (!gameRunning || gameOver) return;
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const relativeX = touch.clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
        paddleX = Math.max(0, Math.min(canvas.width - paddleWidth, paddleX));
    }
});

canvas.addEventListener("click", function() {
    if (gameOver) {
        initializeGame();
        startGame();
    }
});

// Initialize game
window.addEventListener("load", function() {
    canvas.width = 430;
    canvas.height = 460;
    initializeBricks();
    initializeGame();
});