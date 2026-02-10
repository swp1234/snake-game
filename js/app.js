/**
 * Snake Classic - Main Game Engine
 * Canvas-based snake game with multiple modes and features
 */

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, modeSelect, playing, paused, gameOver
        this.gameMode = 'wall'; // wall or infinite
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snake_highscore')) || 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.startTime = 0;
        this.frameCount = 0;

        // Game settings
        this.gridSize = 20;
        this.snake = [];
        this.foods = [];
        this.baseSpeed = 120;
        this.currentSpeed = this.baseSpeed;
        this.speedIncrease = 1.2;
        this.lastMoveTime = 0;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };

        // Particles for effects
        this.particles = [];

        // Stats
        this.stats = {
            gamesPlayed: parseInt(localStorage.getItem('snake_gamesPlayed')) || 0,
            totalScore: parseInt(localStorage.getItem('snake_totalScore')) || 0,
            foodEaten: parseInt(localStorage.getItem('snake_foodEaten')) || 0,
            survivalTime: parseInt(localStorage.getItem('snake_survivalTime')) || 0
        };

        // Leaderboard system
        this.leaderboard = new LeaderboardManager('snake-game', 10);

        this.initDOMElements();
        this.setupEventListeners();
        this.resizeCanvas();
        this.startGameLoop();

        // Set initial high score display
        document.getElementById('hs-value').textContent = this.highScore;
    }

    initDOMElements() {
        // Screens
        this.menuScreen = document.getElementById('menu-screen');
        this.modeScreen = document.getElementById('mode-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.pauseOverlay = document.getElementById('pause-overlay');
        this.gameoverScreen = document.getElementById('gameover-screen');
        this.statsScreen = document.getElementById('stats-screen');
        this.interstitialOverlay = document.getElementById('interstitial-overlay');

        // Buttons
        this.btnStart = document.getElementById('btn-start');
        this.btnModes = document.getElementById('btn-modes');
        this.btnStats = document.getElementById('btn-stats');
        this.btnModeBack = document.getElementById('btn-mode-back');
        this.btnModeWall = document.getElementById('mode-wall');
        this.btnModeInfinite = document.getElementById('mode-infinite');
        this.btnPause = document.getElementById('btn-pause');
        this.btnResume = document.getElementById('btn-resume');
        this.btnQuit = document.getElementById('btn-quit');
        this.btnRetry = document.getElementById('btn-retry');
        this.btnRevive = document.getElementById('btn-revive');
        this.btnShare = document.getElementById('btn-share');
        this.btnMenu = document.getElementById('btn-menu');
        this.btnStatsBack = document.getElementById('btn-stats-back');

        // Display elements
        this.hudScore = document.getElementById('hud-score');
        this.hudMode = document.getElementById('hud-mode');
        this.tapHint = document.getElementById('tap-hint');
        this.goScore = document.getElementById('go-score');
        this.goBest = document.getElementById('go-best');
        this.goRank = document.getElementById('go-rank');
        this.goNewRecord = document.getElementById('go-new-record');

        // Loader
        setTimeout(() => {
            const loader = document.getElementById('app-loader');
            if (loader) loader.style.display = 'none';
        }, 2000);
    }

    setupEventListeners() {
        // Menu buttons
        this.btnStart.addEventListener('click', () => this.showModeSelection());
        this.btnModes.addEventListener('click', () => this.showModeSelection());
        this.btnStats.addEventListener('click', () => this.showStats());

        // Mode selection
        this.btnModeBack.addEventListener('click', () => this.showMenu());
        this.btnModeWall.addEventListener('click', () => this.startGame('wall'));
        this.btnModeInfinite.addEventListener('click', () => this.startGame('infinite'));

        // Game controls
        this.btnPause.addEventListener('click', () => this.togglePause());
        this.btnResume.addEventListener('click', () => this.resumeGame());
        this.btnQuit.addEventListener('click', () => this.quitToMenu());
        this.btnRetry.addEventListener('click', () => this.retryGame());
        this.btnRevive.addEventListener('click', () => this.showReviveAd());
        this.btnShare.addEventListener('click', () => this.shareScore());
        this.btnMenu.addEventListener('click', () => this.showMenu());
        this.btnStatsBack.addEventListener('click', () => this.showMenu());

        // Direction control buttons (mouse/touch buttons)
        this.setupDirectionButtons();

        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeydown(e));

        // Touch controls (swipe)
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            e.preventDefault();

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Horizontal swipe
                if (diffX > 30 && this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (diffX < -30 && this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            } else {
                // Vertical swipe
                if (diffY > 30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (diffY < -30 && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }
        });

        // Canvas click to start (improved - also works for continuing paused game)
        this.canvas.addEventListener('click', () => {
            if (!this.gameRunning && this.gameState === 'playing') {
                this.gameRunning = true;
                this.tapHint.style.display = 'none';
            }
        });
    }

    setupDirectionButtons() {
        const dirUp = document.getElementById('dir-up');
        const dirDown = document.getElementById('dir-down');
        const dirLeft = document.getElementById('dir-left');
        const dirRight = document.getElementById('dir-right');

        if (dirUp) {
            dirUp.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            });
        }

        if (dirDown) {
            dirDown.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.direction.y === 0) {
                    this.nextDirection = { x: 0, y: 1 };
                }
            });
        }

        if (dirLeft) {
            dirLeft.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.direction.x === 0) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            });
        }

        if (dirRight) {
            dirRight.addEventListener('click', () => {
                if (this.gameRunning && !this.gamePaused && this.direction.x === 0) {
                    this.nextDirection = { x: 1, y: 0 };
                }
            });
        }
    }

    handleKeydown(e) {
        if (!this.gameRunning || this.gamePaused) return;

        const key = e.key.toLowerCase();
        switch (key) {
            case 'arrowup':
            case 'w':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                e.preventDefault();
                break;
            case 'arrowdown':
            case 's':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                e.preventDefault();
                break;
            case 'arrowleft':
            case 'a':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                e.preventDefault();
                break;
            case 'arrowright':
            case 'd':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                e.preventDefault();
                break;
            case ' ':
                this.togglePause();
                e.preventDefault();
                break;
        }
    }

    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        this.width = rect.width;
        this.height = rect.height;
        this.cols = Math.floor(this.width / this.gridSize);
        this.rows = Math.floor(this.height / this.gridSize);
    }

    showMenu() {
        this.gameState = 'menu';
        this.menuScreen.classList.remove('hidden');
        this.modeScreen.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.statsScreen.classList.add('hidden');
    }

    showModeSelection() {
        this.gameState = 'modeSelect';
        this.menuScreen.classList.add('hidden');
        this.modeScreen.classList.remove('hidden');
    }

    showStats() {
        this.gameState = 'stats';
        this.menuScreen.classList.add('hidden');
        this.statsScreen.classList.remove('hidden');

        // Populate stats
        const statsContent = document.getElementById('stats-content');
        statsContent.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">${window.i18n.t('gameover.score')}</span>
                <span class="stat-value">${this.stats.totalScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">최고 점수</span>
                <span class="stat-value">${this.highScore}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">게임 플레이</span>
                <span class="stat-value">${this.stats.gamesPlayed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">먹이 먹음</span>
                <span class="stat-value">${this.stats.foodEaten}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">총 생존시간</span>
                <span class="stat-value">${Math.floor(this.stats.survivalTime / 60)}분</span>
            </div>
        `;
    }

    startGame(mode) {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.modeScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.pauseOverlay.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');

        // Update HUD
        this.hudMode.textContent = mode === 'wall' ? 'WALL MODE' : 'INFINITE MODE';

        // Initialize game
        this.reset();
        this.gameRunning = false;
        this.tapHint.style.display = 'block';

        window.addEventListener('resize', () => this.resizeCanvas());
    }

    reset() {
        this.score = 0;
        this.snake = [
            { x: Math.floor(this.cols / 2), y: Math.floor(this.rows / 2) }
        ];
        this.foods = [];
        this.particles = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.currentSpeed = this.baseSpeed;
        this.lastMoveTime = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.frameCount = 0;
        this.startTime = Date.now();
        this.hudScore.textContent = '0';

        // Improved: Spawn fewer initial foods for easier early game (1 instead of 3)
        // This gives players more time to learn controls
        for (let i = 0; i < 1; i++) {
            this.spawnFood();
        }
    }

    spawnFood() {
        let x, y, type;
        let valid = false;

        while (!valid) {
            x = Math.floor(Math.random() * this.cols);
            y = Math.floor(Math.random() * this.rows);
            valid = !this.snake.some(seg => seg.x === x && seg.y === y);
        }

        // Improved: Better food type distribution
        // 80% apple (basic), 15% bonus (timed), 5% diamond (rare)
        // This keeps bonus/diamond special without overwhelming early game
        const rand = Math.random();
        if (rand < 0.80) {
            type = 'apple';
        } else if (rand < 0.95) {
            type = 'bonus';
        } else {
            type = 'diamond';
        }

        // Improved: Longer timeout for special foods (easier to collect)
        this.foods.push({
            x, y, type,
            spawnTime: Date.now(),
            timeout: type === 'bonus' ? 8000 : (type === 'diamond' ? 5000 : null)
        });
    }

    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;

        this.lastMoveTime += deltaTime;

        // Move snake
        if (this.lastMoveTime > this.currentSpeed) {
            this.direction = { ...this.nextDirection };

            const head = this.snake[0];
            let newX = head.x + this.direction.x;
            let newY = head.y + this.direction.y;

            // Handle infinite mode (wrap around)
            if (this.gameMode === 'infinite') {
                newX = (newX + this.cols) % this.cols;
                newY = (newY + this.rows) % this.rows;
            }

            // Check wall collision (wall mode only)
            if (this.gameMode === 'wall' && (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows)) {
                this.endGame();
                return;
            }

            // Check self collision
            if (this.snake.some(seg => seg.x === newX && seg.y === newY)) {
                this.endGame();
                return;
            }

            // Add new head
            this.snake.unshift({ x: newX, y: newY });

            // Check food collision
            let foodEaten = false;
            for (let i = 0; i < this.foods.length; i++) {
                if (this.foods[i].x === newX && this.foods[i].y === newY) {
                    const food = this.foods[i];
                    let points = 10;

                    switch (food.type) {
                        case 'apple':
                            points = 10;
                            window.sfx.eat();
                            break;
                        case 'bonus':
                            points = 50;
                            window.sfx.bonus();
                            break;
                        case 'diamond':
                            points = 100;
                            window.sfx.bonus();
                            break;
                    }

                    this.score += points;
                    this.stats.foodEaten++;
                    this.hudScore.textContent = this.score;

                    // Improved: More gradual speed curve using logarithm
                    // Ensures game stays playable at any snake length
                    // Speed decreases logarithmically but never below 70ms
                    const snakeLength = this.snake.length;
                    const speedReduction = Math.log(snakeLength + 1) * 6; // More gentle curve
                    this.currentSpeed = Math.max(70, this.baseSpeed - speedReduction);

                    // Create particle effect
                    this.createParticles(newX, newY, food.type);

                    // Remove food and spawn new
                    this.foods.splice(i, 1);
                    this.spawnFood();
                    foodEaten = true;
                    break;
                }
            }

            // Remove tail if no food eaten
            if (!foodEaten) {
                this.snake.pop();
            }

            // Remove expired bonus foods (improved timeouts for easier collection)
            this.foods = this.foods.filter(food => {
                if (food.type === 'bonus' && Date.now() - food.spawnTime > 8000) {
                    return false;
                }
                if (food.type === 'diamond' && Date.now() - food.spawnTime > 5000) {
                    return false;
                }
                return true;
            });

            this.lastMoveTime = 0;
        }

        // Update particles
        this.particles = this.particles.filter(p => {
            p.life -= deltaTime;
            return p.life > 0;
        });
    }

    createParticles(x, y, foodType) {
        const colors = {
            apple: '#e74c3c',
            bonus: '#f39c12',
            diamond: '#3498db'
        };

        const color = colors[foodType] || '#2ecc71';

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 100 + Math.random() * 50;
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5,
                color: color
            });
        }
    }

    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;

        if (this.gamePaused) {
            this.pauseOverlay.classList.remove('hidden');
        } else {
            this.pauseOverlay.classList.add('hidden');
        }
    }

    resumeGame() {
        this.gamePaused = false;
        this.pauseOverlay.classList.add('hidden');
    }

    quitToMenu() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.showMenu();
    }

    retryGame() {
        this.startGame(this.gameMode);
    }

    endGame() {
        this.gameRunning = false;
        this.gameState = 'gameOver';
        const survivalSeconds = Math.floor((Date.now() - this.startTime) / 1000);

        // Update stats
        this.stats.gamesPlayed++;
        this.stats.totalScore += this.score;
        this.stats.survivalTime += survivalSeconds;

        localStorage.setItem('snake_gamesPlayed', this.stats.gamesPlayed);
        localStorage.setItem('snake_totalScore', this.stats.totalScore);
        localStorage.setItem('snake_foodEaten', this.stats.foodEaten);
        localStorage.setItem('snake_survivalTime', this.stats.survivalTime);

        // Add score to leaderboard
        const leaderboardResult = this.leaderboard.addScore(this.score, {
            mode: this.gameMode,
            survivalTime: survivalSeconds,
            foodCount: this.stats.foodEaten
        });

        // Check for new record
        const isNewRecord = leaderboardResult.isNewRecord;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('snake_highscore', this.highScore);
            this.goNewRecord.classList.remove('hidden');
            window.sfx.levelUp();
        } else {
            this.goNewRecord.classList.add('hidden');
            window.sfx.gameOver();
        }

        // Show game over screen
        this.goScore.textContent = this.score;
        this.goBest.textContent = this.highScore;

        // Set rank
        const rank = this.getRank(this.score);
        this.goRank.innerHTML = `<span class="rank-icon">${rank.icon}</span><span class="rank-title">${rank.title}</span>`;

        // Display leaderboard
        this.displayLeaderboard(leaderboardResult);

        this.gameScreen.classList.add('hidden');
        this.gameoverScreen.classList.remove('hidden');
    }

    getRank(score) {
        const ranks = [
            { min: 0, title: window.i18n.t('ranks.beginner'), icon: '🌱' },
            { min: 500, title: window.i18n.t('ranks.apprentice'), icon: '🐍' },
            { min: 1500, title: window.i18n.t('ranks.expert'), icon: '🎯' },
            { min: 3000, title: window.i18n.t('ranks.master'), icon: '👑' },
            { min: 5000, title: window.i18n.t('ranks.legend'), icon: '⭐' },
            { min: 10000, title: window.i18n.t('ranks.god'), icon: '🔥' }
        ];

        for (let i = ranks.length - 1; i >= 0; i--) {
            if (score >= ranks[i].min) {
                return ranks[i];
            }
        }
        return ranks[0];
    }

    showReviveAd() {
        this.interstitialOverlay.classList.remove('hidden');
        let countdown = 5;

        const adCountdown = setInterval(() => {
            document.getElementById('ad-countdown').textContent = countdown;
            if (countdown === 0) {
                clearInterval(adCountdown);
                this.reviveGame();
            }
            countdown--;
        }, 1000);
    }

    reviveGame() {
        this.interstitialOverlay.classList.add('hidden');
        this.gameoverScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');

        // Restore game state partially
        this.gameState = 'playing';
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = Math.floor(this.score / 2); // Lose half score
        this.hudScore.textContent = this.score;
        this.lastMoveTime = 0;
    }

    shareScore() {
        const rank = this.getRank(this.score);
        const text = `뱀 게임에서 ${this.score}점을 얻었습니다! ${rank.icon} ${rank.title} 🐍\n당신도 플레이해보세요: dopabrain.com/snake-game/`;

        if (navigator.share) {
            navigator.share({
                title: 'Snake Classic',
                text: text,
                url: 'https://dopabrain.com/snake-game/'
            });
        } else {
            // Fallback
            const url = `https://dopabrain.com/snake-game/?score=${this.score}`;
            alert(`공유하기: ${url}`);
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid
        this.ctx.strokeStyle = 'rgba(46, 204, 113, 0.05)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.cols; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.height);
            this.ctx.stroke();
        }
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.width, i * this.gridSize);
            this.ctx.stroke();
        }

        // Draw snake
        this.drawSnake();

        // Draw foods
        this.drawFoods();

        // Draw particles
        this.drawParticles();
    }

    drawSnake() {
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            if (i === 0) {
                // Head
                const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                gradient.addColorStop(0, '#2ecc71');
                gradient.addColorStop(1, '#3bd882');
                this.ctx.fillStyle = gradient;
                this.ctx.shadowColor = 'rgba(46, 204, 113, 0.8)';
                this.ctx.shadowBlur = 12;
            } else if (i === this.snake.length - 1) {
                // Tail (fade)
                const alpha = (i / this.snake.length) * 0.5;
                this.ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
                this.ctx.shadowColor = 'rgba(46, 204, 113, 0)';
                this.ctx.shadowBlur = 0;
            } else {
                // Body
                const alpha = (i / this.snake.length) * 0.8;
                this.ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
                this.ctx.shadowColor = 'rgba(46, 204, 113, 0.4)';
                this.ctx.shadowBlur = 8;
            }

            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
        }

        this.ctx.shadowColor = 'transparent';
    }

    drawFoods() {
        const now = Date.now();

        for (const food of this.foods) {
            const x = food.x * this.gridSize + this.gridSize / 2;
            const y = food.y * this.gridSize + this.gridSize / 2;
            const radius = this.gridSize / 3;

            // Pulsing effect
            const pulse = Math.sin(now / 300 + food.x + food.y) * 0.3 + 0.7;
            const size = radius * pulse;

            let color, emoji;
            switch (food.type) {
                case 'apple':
                    color = '#e74c3c';
                    emoji = '🍎';
                    break;
                case 'bonus':
                    color = '#f39c12';
                    emoji = '⭐';
                    break;
                case 'diamond':
                    color = '#3498db';
                    emoji = '💎';
                    break;
            }

            // Draw circle
            this.ctx.fillStyle = color;
            this.ctx.shadowColor = `${color}`;
            this.ctx.shadowBlur = 12;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();

            // Draw emoji
            this.ctx.font = `${this.gridSize * 0.6}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(emoji, x, y);
        }

        this.ctx.shadowColor = 'transparent';
    }

    drawParticles() {
        for (const particle of this.particles) {
            const lifeRatio = particle.life / 0.5;
            const alpha = Math.max(0, lifeRatio - 0.5) * 2;

            this.ctx.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Update position
            particle.x += particle.vx * 0.016; // Assuming 60fps
            particle.y += particle.vy * 0.016;
        }
    }

    startGameLoop() {
        let lastTime = Date.now();

        const loop = () => {
            const now = Date.now();
            const deltaTime = (now - lastTime) / 1000;
            lastTime = now;

            this.update(deltaTime * 1000); // Convert to ms
            this.draw();

            requestAnimationFrame(loop);
        };

        requestAnimationFrame(loop);
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    // Wait for i18n to load
    await new Promise(resolve => {
        const checkI18n = setInterval(() => {
            if (window.i18n && window.i18n.translations[window.i18n.currentLang]) {
                clearInterval(checkI18n);
                resolve();
            }
        }, 100);
    });

    // Start game
    window.game = new SnakeGame();
});

// Add displayLeaderboard method to SnakeGame prototype
SnakeGame.prototype.displayLeaderboard = function(leaderboardResult) {
    // Create or get leaderboard container
    const gameoverScreen = document.getElementById('gameover-screen');
    let leaderboardContainer = gameoverScreen.querySelector('.leaderboard-section');
    if (!leaderboardContainer) {
        leaderboardContainer = document.createElement('div');
        leaderboardContainer.className = 'leaderboard-section';
        gameoverScreen.appendChild(leaderboardContainer);
    }

    // Get top scores
    const topScores = this.leaderboard.getTopScores(5);
    const currentScore = parseInt(document.getElementById('go-score').textContent);

    // Build leaderboard HTML
    let html = '<div class="leaderboard-title">🏆 Top 5 Scores</div>';
    html += '<div class="leaderboard-list">';

    topScores.forEach((entry, index) => {
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
        const isCurrentScore = entry.score === currentScore && leaderboardResult.isNewRecord;
        const classes = isCurrentScore ? 'leaderboard-item highlight' : 'leaderboard-item';

        html += `
            <div class="${classes}">
                <span class="medal">${medals[index] || (index + 1) + '.'}</span>
                <span class="score-value">${entry.score}</span>
                <span class="score-date">${entry.date}</span>
            </div>
        `;
    });

    html += '</div>';
    html += '<button id="reset-leaderboard-btn" class="reset-btn">Reset Records</button>';

    leaderboardContainer.innerHTML = html;

    // Add reset button event listener
    const resetBtn = leaderboardContainer.querySelector('#reset-leaderboard-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all records?')) {
                this.leaderboard.resetScores();
                this.highScore = 0;
                localStorage.setItem('snake_highscore', '0');
                this.displayLeaderboard({ isNewRecord: false, rank: -1, notifications: [] });
                alert('Records reset!');
            }
        });
    }

    // Show notifications
    leaderboardResult.notifications.forEach(notif => {
        this.showNotification(notif);
    });
};

SnakeGame.prototype.showNotification = function(notification) {
    const notifEl = document.createElement('div');
    notifEl.className = `notification notification-${notification.type}`;
    notifEl.textContent = notification.message;
    notifEl.style.position = 'fixed';
    notifEl.style.top = '20px';
    notifEl.style.right = '20px';
    notifEl.style.padding = '12px 20px';
    notifEl.style.backgroundColor = notification.type === 'new-record' ? '#FFD700' : '#4CAF50';
    notifEl.style.color = '#000';
    notifEl.style.borderRadius = '8px';
    notifEl.style.fontSize = '14px';
    notifEl.style.fontWeight = 'bold';
    notifEl.style.zIndex = '9999';
    notifEl.style.animation = 'slideIn 0.3s ease-out';

    document.body.appendChild(notifEl);

    setTimeout(() => {
        notifEl.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notifEl.remove(), 300);
    }, 3000);
};
