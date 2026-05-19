// ==========================================
// CANVAS SETUP
// ==========================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthSpan = document.getElementById('healthDisplay');
const scoreSpan = document.getElementById('scoreDisplay');
const stageSpan = document.getElementById('stageDisplay');
const timeSpan = document.getElementById('timeDisplay');
const coinSpan = document.getElementById('coinDisplay');
const achieveSpan = document.getElementById('achieveDisplay');
const bossTimerSpan = document.getElementById('bossTimerDisplay');
const wrapper = document.getElementById('gameWrapper');

const W = 900;
const H = 500;
canvas.width = W;
canvas.height = H;

function resizeCanvas() {
    const wrapperW = wrapper.clientWidth;
    const wrapperH = wrapper.clientHeight;
    const ratio = W / H;
    const wrapperRatio = wrapperW / wrapperH;
    let displayW, displayH;
    if (wrapperRatio > ratio) {
        displayH = wrapperH * 0.95;
        displayW = displayH * ratio;
    } else {
        displayW = wrapperW * 0.95;
        displayH = displayW / ratio;
    }
    canvas.style.width = Math.floor(displayW) + 'px';
    canvas.style.height = Math.floor(displayH) + 'px';
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 300));

// ==========================================
// SOUND SYSTEM
// ==========================================
class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch(e) {
            console.log('Audio not supported');
            this.enabled = false;
        }
    }
    
    play(type) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            const now = this.ctx.currentTime;
            switch(type) {
                case 'jump': 
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(600, now);
                    osc.frequency.exponentialRampToValueAtTime(400, now+0.1);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.1);
                    osc.start(now); osc.stop(now+0.1);
                    break;
                case 'attack':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(500, now+0.08);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.08);
                    osc.start(now); osc.stop(now+0.08);
                    break;
                case 'hit':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(200, now);
                    osc.frequency.exponentialRampToValueAtTime(80, now+0.15);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.15);
                    osc.start(now); osc.stop(now+0.15);
                    break;
                case 'collect':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(1000, now);
                    osc.frequency.exponentialRampToValueAtTime(1400, now+0.08);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.08);
                    osc.start(now); osc.stop(now+0.08);
                    break;
                case 'boss':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.setValueAtTime(500, now+0.1);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.2);
                    osc.start(now); osc.stop(now+0.2);
                    break;
                case 'dash':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(500, now);
                    osc.frequency.exponentialRampToValueAtTime(700, now+0.08);
                    gain.gain.setValueAtTime(0.15, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.08);
                    osc.start(now); osc.stop(now+0.08);
                    break;
                case 'levelup':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.setValueAtTime(600, now+0.08);
                    osc.frequency.setValueAtTime(800, now+0.16);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.25);
                    osc.start(now); osc.stop(now+0.25);
                    break;
                case 'death':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now+0.3);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now+0.3);
                    osc.start(now); osc.stop(now+0.3);
                    break;
            }
        } catch(e) {}
    }
}
const sound = new SoundSystem();

// ==========================================
// GAME STATE
// ==========================================
let gameOver = false;
let score = 0;
let frame = 0;
let speed = 3;
let health = 100;
let maxHealth = 100;
let invincible = false;
let invincibleTimer = 0;
let gameTime = 0;
let bossSpawnTimer = 0;
let enemiesKilled = 0;
let bossDefeats = 0;
let nightCoins = 0;
let stage = 1;
let stageProgress = 0;
let stageTarget = 15;
let bossActive = false;
let boss = null;
let bossWarning = false;
let bossWarningTimer = 0;
let stageComplete = false;
let stageCompleteTimer = 0;
let introPhase = 'story';
let storyIndex = 0;
let storyTimer = 0;
let storyFade = 0;
let skipIntro = false;
let titlePulse = 0;
let titleY = 0;
let currentBiomeIndex = 0;

// BOSS SPAWN SETTINGS - 20 seconds for testing!
const BOSS_SPAWN_TIME = 1200; // 20 seconds (change to 3600 for 1 minute)
const BOSS_WARNING_TIME = 180; // 3 seconds warning

// ==========================================
// PLAYER (NIGHT PAW)
// ==========================================
const cat = {
    x: 80,
    y: 380,
    w: 30,
    h: 30,
    vy: 0,
    gravity: 0.5,
    jumpPower: -11,
    grounded: false,
    doubleJump: true,
    hasDoubleJump: false,
    attackCooldown: 0,
    dashCooldown: 0,
    dashing: false,
    dashTimer: 0,
    dashMax: 15,
    dashCooldownMax: 120,
    dashDirection: 1,
    damage: 10,
    speedMult: 1,
    megaAttack: false,
    tripleShot: false,
    tripleShotTimer: 0,
    shieldActive: false,
    shieldTimer: 0,
    hasShield: false,
    animation: 0,
    tailWag: 0,
    powerLevel: 0,
    bodyColor: '#111',
    eyeColor: '#00ffff',
    capeColor: '#1a1a2a'
};

// ==========================================
// ARRAYS
// ==========================================
let obstacles = [];
let collectibles = [];
let projectiles = [];
let bossProjectiles = [];
let particles = [];
let enemies = [];

// ==========================================
// BIOMES
// ==========================================
const BIOMES = [
    {
        id: 'city',
        name: 'Neo City',
        sky: ['#0a0a2a', '#1a1a3a'],
        ground: '#111',
        groundLine: '#333',
        moonColor: '#ffffff',
        starCount: 40,
        obstacleTypes: ['owl', 'spike', 'drone']
    },
    {
        id: 'forest',
        name: 'Shadow Woods',
        sky: ['#0a2a0a', '#1a3a1a'],
        ground: '#1a2a0a',
        groundLine: '#2a3a1a',
        moonColor: '#aaffaa',
        starCount: 20,
        obstacleTypes: ['spike', 'vine', 'mushroom']
    }
];

function getBiome() {
    return BIOMES[currentBiomeIndex % BIOMES.length];
}

function changeBiome(stage) {
    currentBiomeIndex = Math.floor(stage / 3);
}

// ==========================================
// XP SYSTEM
// ==========================================
class XPManager {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.maxLevel = 20;
        this.notification = '';
        this.notificationTimer = 0;
    }
    
    addXP(amount) {
        if (this.level >= this.maxLevel) return;
        this.xp += amount;
        this.checkLevelUp();
    }
    
    checkLevelUp() {
        const needed = 20 + this.level * 5;
        while (this.xp >= needed && this.level < this.maxLevel) {
            this.xp -= needed;
            this.level++;
            this.applyPerk();
            sound.play('levelup');
            this.notification = `⬆ LEVEL ${this.level}!`;
            this.notificationTimer = 120;
        }
    }
    
    applyPerk() {
        switch(this.level) {
            case 2: maxHealth += 10; health += 10; break;
            case 3: cat.damage += 2; break;
            case 4: cat.speedMult = 1.05; break;
            case 5: cat.hasShield = true; break;
            case 6: maxHealth += 15; health += 15; break;
            case 7: cat.damage += 3; break;
            case 8: cat.speedMult = 1.1; break;
            case 9: cat.hasDoubleJump = true; break;
            case 10: cat.megaAttack = true; break;
            case 12: maxHealth += 20; health += 20; break;
            case 14: cat.damage += 4; break;
            case 16: cat.speedMult = 1.2; break;
            case 18: cat.hasDoubleJump = true; break;
            case 20: cat.damage = 50; cat.speedMult = 1.5; maxHealth = 200; health = 200; break;
        }
        updateUI();
    }
    
    draw() {
        const barW = 120;
        const barH = 6;
        const x = 20;
        const y = 110;
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(x-2, y-2, barW+4, barH+4);
        const needed = 20 + this.level * 5;
        const progress = Math.min(this.xp / needed, 1);
        ctx.fillStyle = '#8a2be2';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#8a2be2';
        ctx.fillRect(x, y, barW * progress, barH);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#fff';
        ctx.font = '9px Courier New';
        ctx.textAlign = 'left';
        ctx.fillText(`Lv.${this.level} ${this.xp}/${needed} XP`, x, y+barH+12);
        
        if (this.notificationTimer > 0) {
            this.notificationTimer--;
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffcc00';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ffcc00';
            ctx.font = '20px Courier New';
            ctx.fillText(this.notification, W/2, 80);
            ctx.shadowBlur = 0;
        }
    }
}
const xpManager = new XPManager();

// ==========================================
// SCREEN SHAKE
// ==========================================
class ScreenShake {
    constructor() {
        this.intensity = 0;
        this.x = 0;
        this.y = 0;
    }
    
    trigger(intensity) {
        this.intensity = intensity;
    }
    
    update() {
        if (this.intensity > 0) {
            this.x = (Math.random() - 0.5) * this.intensity * 2;
            this.y = (Math.random() - 0.5) * this.intensity * 2;
            this.intensity *= 0.92;
            if (this.intensity < 0.1) this.intensity = 0;
        } else {
            this.x = 0;
            this.y = 0;
        }
    }
}
const screenShake = new ScreenShake();

// ==========================================
// DEATH ANIMATION
// ==========================================
class DeathAnimation {
    constructor() {
        this.playing = false;
        this.timer = 0;
        this.duration = 90;
        this.particles = [];
        this.flashAlpha = 0;
    }
    
    start() {
        this.playing = true;
        this.timer = 0;
        this.flashAlpha = 0.8;
        sound.play('death');
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            this.particles.push({
                x: cat.x + (Math.random()-0.5)*30,
                y: cat.y + (Math.random()-0.5)*30,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 15 + Math.random() * 25,
                maxLife: 40,
                color: ['#ff0000','#ff4400','#ff8800'][Math.floor(Math.random()*3)],
                size: 3 + Math.random() * 4
            });
        }
    }
    
    update() {
        if (!this.playing) return;
        this.timer++;
        this.flashAlpha *= 0.95;
        for (let i = this.particles.length-1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1;
            p.life--;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        if (this.timer > this.duration) {
            this.playing = false;
            this.particles = [];
        }
    }
    
    draw() {
        if (!this.playing) return;
        ctx.fillStyle = `rgba(255,0,0,${this.flashAlpha})`;
        ctx.fillRect(0, 0, W, H);
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.shadowBlur = 15;
            ctx.shadowColor = p.color;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}
const deathAnim = new DeathAnimation();

// ==========================================
// ACHIEVEMENTS
// ==========================================
const ACHIEVEMENTS = {
    'first_kill': { name: 'First Blood', desc: 'Kill 10 enemies', condition: () => enemiesKilled >= 10, unlocked: false, icon: '⚔️' },
    'stage_5': { name: 'Stage Master', desc: 'Reach Stage 5', condition: () => stage >= 5, unlocked: false, icon: '🌟' },
    'boss_3': { name: 'Boss Slayer', desc: 'Defeat 3 Bosses', condition: () => bossDefeats >= 3, unlocked: false, icon: '👹' },
    'collector': { name: 'Collector', desc: 'Collect 100 coins', condition: () => nightCoins >= 100, unlocked: false, icon: '🪙' },
    'level_10': { name: 'Legendary', desc: 'Reach Level 10', condition: () => xpManager.level >= 10, unlocked: false, icon: '⭐' }
};

let unlockedAchievements = [];
let achievementPopup = '';
let achievementTimer = 0;

function checkAchievements() {
    for (const [key, ach] of Object.entries(ACHIEVEMENTS)) {
        if (!ach.unlocked && ach.condition()) {
            ach.unlocked = true;
            unlockedAchievements.push(key);
            achievementPopup = `${ach.icon} ${ach.name}!`;
            achievementTimer = 120;
            sound.play('levelup');
            nightCoins += 10;
            updateUI();
        }
    }
}

function drawAchievements() {
    if (achievementTimer > 0) {
        achievementTimer--;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffcc00';
        ctx.font = '18px Courier New';
        ctx.fillText(`🏆 ${achievementPopup}`, W/2, 60);
        ctx.shadowBlur = 0;
    }
}

// ==========================================
// STORY PANELS
// ==========================================
const storyPanels = [
    { text: "In the dark streets of Neo-City...", sub: "A city of shadows and secrets" },
    { text: "A young cat named 'Paw' discovered a mysterious power...", sub: "The Night Force awakened within him" },
    { text: "Now he fights to protect the city from darkness...", sub: "One claw at a time" },
    { text: "The Night Paw - Guardian of the Night", sub: "His legend begins today" }
];

// ==========================================
// FUNCTIONS
// ==========================================
function spawnObstacle() {
    const biome = getBiome();
    const types = biome.obstacleTypes || ['owl', 'spike', 'drone'];
    const type = types[Math.floor(Math.random() * types.length)];
    const obs = {
        x: W + 20,
        y: 380,
        w: 25, h: 25,
        type: type,
        rotation: 0,
        bob: Math.random() * 100,
        dropHeart: Math.random() > 0.85,
        dropCoin: Math.random() > 0.9
    };
    if (type === 'spike') { obs.y = 420; obs.w = 15; obs.h = 30; }
    if (type === 'drone') { obs.y = 330 + Math.random() * 50; obs.w = 30; obs.h = 20; }
    obstacles.push(obs);
}

function spawnEnemy() {
    const types = ['basic', 'fly'];
    const type = types[Math.floor(Math.random() * types.length)];
    const y = type === 'fly' ? 300 + Math.random() * 80 : 380;
    enemies.push({ x: W + 20, y: y, w: 20, h: 20, type: type, vy: 0, animation: 0 });
}

function shoot() {
    if (cat.attackCooldown > 0) return;
    const num = cat.megaAttack ? 5 : (cat.tripleShot ? 3 : 1);
    for (let i = 0; i < num; i++) {
        const offY = num > 1 ? (i - (num-1)/2) * 8 : 0;
        projectiles.push({
            x: cat.x + 20,
            y: cat.y - 5 + offY,
            vx: 8,
            vy: 0,
            w: 10, h: 10,
            damage: cat.damage
        });
    }
    cat.attackCooldown = 12;
    sound.play('attack');
}

function dash(direction) {
    if (cat.dashCooldown > 0 || cat.dashing) return;
    cat.dashing = true;
    cat.dashTimer = cat.dashMax;
    cat.dashCooldown = cat.dashCooldownMax;
    cat.dashDirection = direction;
    sound.play('dash');
}

function jump() {
    if (cat.grounded) {
        cat.vy = cat.jumpPower;
        cat.grounded = false;
        cat.doubleJump = true;
        sound.play('jump');
    } else if (cat.hasDoubleJump && cat.doubleJump) {
        cat.vy = cat.jumpPower * 0.9;
        cat.doubleJump = false;
        sound.play('jump');
    }
}

function rectCollide(a, b) {
    return !(b.x > a.x + a.w || b.x + b.w < a.x || b.y > a.y + a.h || b.y + b.h < a.y);
}

function updateUI() {
    healthSpan.textContent = Math.round(health);
    scoreSpan.textContent = Math.floor(score);
    stageSpan.textContent = `Stage ${stage}`;
    coinSpan.textContent = nightCoins;
    achieveSpan.textContent = unlockedAchievements.length;
    const minutes = Math.floor(gameTime / 3600);
    const seconds = Math.floor((gameTime % 3600) / 60);
    timeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Boss timer display
    if (!bossActive && !bossWarning && !stageComplete) {
        const remaining = Math.max(0, Math.floor((BOSS_SPAWN_TIME - bossSpawnTimer) / 60));
        bossTimerSpan.textContent = `${remaining}s`;
    } else if (bossWarning) {
        bossTimerSpan.textContent = '⚠️';
    } else if (bossActive) {
        bossTimerSpan.textContent = '👹';
    } else {
        bossTimerSpan.textContent = '✅';
    }
}

function resetGame() {
    gameOver = false;
    score = 0;
    frame = 0;
    speed = 3;
    health = 100;
    maxHealth = 100;
    invincible = false;
    invincibleTimer = 0;
    gameTime = 0;
    bossSpawnTimer = 0;
    stage = 1;
    stageProgress = 0;
    stageTarget = 15;
    bossActive = false;
    boss = null;
    bossWarning = false;
    bossWarningTimer = 0;
    stageComplete = false;
    stageCompleteTimer = 0;
    cat.x = 80;
    cat.y = 380;
    cat.vy = 0;
    cat.grounded = false;
    cat.doubleJump = true;
    cat.hasDoubleJump = false;
    cat.attackCooldown = 0;
    cat.dashCooldown = 0;
    cat.dashing = false;
    cat.dashTimer = 0;
    cat.damage = 10;
    cat.speedMult = 1;
    cat.megaAttack = false;
    cat.tripleShot = false;
    cat.tripleShotTimer = 0;
    cat.shieldActive = false;
    cat.shieldTimer = 0;
    cat.hasShield = false;
    cat.animation = 0;
    cat.tailWag = 0;
    cat.powerLevel = 0;
    cat.bodyColor = '#111';
    cat.eyeColor = '#00ffff';
    cat.capeColor = '#1a1a2a';
    obstacles = [];
    collectibles = [];
    projectiles = [];
    bossProjectiles = [];
    particles = [];
    enemies = [];
    enemiesKilled = 0;
    bossDefeats = 0;
    nightCoins = 0;
    unlockedAchievements = [];
    xpManager.xp = 0;
    xpManager.level = 1;
    for (const key of Object.keys(ACHIEVEMENTS)) {
        ACHIEVEMENTS[key].unlocked = false;
    }
    updateUI();
}

// ==========================================
// INTRO
// ==========================================
function updateIntro() {
    if (skipIntro) {
        introPhase = 'game';
        return;
    }
    if (introPhase === 'story') {
        storyTimer++;
        if (storyTimer < 90) {
            storyFade = storyTimer / 90;
        } else if (storyTimer < 180) {
            storyFade = 1;
        } else if (storyTimer < 270) {
            storyFade = 1 - (storyTimer - 180) / 90;
        } else {
            storyIndex++;
            storyTimer = 0;
            if (storyIndex >= storyPanels.length) {
                introPhase = 'title';
                storyTimer = 0;
            }
        }
    } else if (introPhase === 'title') {
        storyTimer++;
        titlePulse = Math.sin(storyTimer * 0.02) * 10;
        titleY = Math.sin(storyTimer * 0.01) * 15;
        if (storyTimer > 300) {
            introPhase = 'game';
        }
    }
}

function drawIntro() {
    if (skipIntro) return;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    if (introPhase === 'story') {
        ctx.fillStyle = `rgba(20, 20, 40, ${storyFade})`;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = '#ffcc00';
        ctx.lineWidth = 3;
        ctx.strokeRect(30, 30, W-60, H-60);
        
        ctx.save();
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = `rgba(0, 255, 255, ${0.2 * storyFade})`;
        ctx.beginPath();
        ctx.arc(W/2, H/2, 50, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(255, 255, 255, ${storyFade})`;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.font = '24px Courier New';
        ctx.fillText(storyPanels[storyIndex].text, W/2, H/2 - 20);
        ctx.font = '16px Courier New';
        ctx.fillText(storyPanels[storyIndex].sub, W/2, H/2 + 30);
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '12px Courier New';
        ctx.fillText('[ TAP TO SKIP ]', W/2, H - 50);
    } else if (introPhase === 'title') {
        const grad = ctx.createRadialGradient(W/2, H/2, 50, W/2, H/2, 300);
        grad.addColorStop(0, '#1a1a4a');
        grad.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        
        ctx.shadowBlur = 80;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.arc(W/2, H/2, 150 + titlePulse, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.save();
        ctx.shadowBlur = 50;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.arc(W/2, H/2 + titleY, 70, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(W/2 - 20, H/2 + titleY - 12, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W/2 + 20, H/2 + titleY - 12, 10, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#0a0a2a';
        ctx.beginPath();
        ctx.arc(W/2 - 20, H/2 + titleY - 12, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(W/2 + 20, H/2 + titleY - 12, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffcc00';
        ctx.font = '42px Courier New';
        ctx.fillText('THE NIGHT PAW', W/2, H/2 + 110 + titleY);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.font = '16px Courier New';
        ctx.fillText('Press SPACE or Tap to Start', W/2, H/2 + 150 + titleY);
        ctx.shadowBlur = 0;
        
        for (let i = 0; i < 5; i++) {
            const ex = (i * 180 + 50 + Math.sin(frame * 0.02 + i) * 30) % W;
            const ey = 100 + Math.sin(frame * 0.03 + i * 2) * 50 + i * 40;
            ctx.fillStyle = '#550000';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(ex, ey, 12, 0, Math.PI*2);
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(ex - 3, ey - 3, 3, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(ex + 3, ey - 3, 3, 0, Math.PI*2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;
    }
}

// ==========================================
// BOSS
// ==========================================
class Boss {
    constructor(stage) {
        this.x = W + 50;
        this.y = 200;
        this.w = 80;
        this.h = 80;
        this.health = 30 + stage * 10;
        this.maxHealth = this.health;
        this.speed = 1 + stage * 0.1;
        this.attackTimer = 0;
        this.attackCooldown = 60;
        this.jumpTimer = 0;
        this.jumpCooldown = 80;
        this.phase = 1;
        this.dying = false;
        this.deathTimer = 0;
        this.entering = true;
        this.enterTimer = 0;
        this.animation = 0;
        this.color = '#2a0a0a';
        this.eyeColor = '#ff0000';
    }
    
    update() {
        if (this.entering) {
            this.enterTimer++;
            this.x -= 2;
            if (this.x < W - 100) {
                this.entering = false;
                bossWarning = false;
            }
            return;
        }
        if (this.dying) {
            this.deathTimer++;
            if (this.deathTimer > 60) {
                boss = null;
                bossActive = false;
                stageComplete = true;
                stageCompleteTimer = 120;
                stage++;
                stageTarget = 15 + stage * 5;
                for (let i = 0; i < 5; i++) {
                    collectibles.push({
                        x: this.x + (Math.random()-0.5)*50,
                        y: this.y + (Math.random()-0.5)*50,
                        w: 15, h: 15,
                        type: i < 2 ? 'powerup' : 'star',
                        bob: Math.random() * 100
                    });
                }
            }
            return;
        }
        this.animation += 0.05;
        const targetX = Math.max(400, Math.min(W - 100, cat.x + 100));
        this.x += (targetX - this.x) * 0.02 * this.speed;
        this.jumpTimer++;
        if (this.jumpTimer > this.jumpCooldown) {
            this.jumpTimer = 0;
            this.vy = -12 - this.speed;
            this.y += this.vy;
            for (let i = 0; i < 3 + this.phase; i++) {
                const angle = -Math.PI/2 + (i - 1) * 0.3;
                bossProjectiles.push({
                    x: this.x, y: this.y + this.h/2,
                    vx: Math.cos(angle) * 4,
                    vy: Math.sin(angle) * 4 + 2,
                    w: 10, h: 10,
                    damage: 10 + this.phase * 2
                });
            }
        }
        if (this.y < 200) {
            this.vy += 0.5;
            this.y += this.vy;
        }
        if (this.y > 200) {
            this.y = 200;
            this.vy = 0;
        }
        this.attackTimer++;
        if (this.attackTimer > this.attackCooldown) {
            this.attackTimer = 0;
            const num = 3 + this.phase;
            for (let i = 0; i < num; i++) {
                const angle = -Math.PI/2 + (i - (num-1)/2) * 0.4;
                bossProjectiles.push({
                    x: this.x, y: this.y + this.h/2,
                    vx: Math.cos(angle) * 5,
                    vy: Math.sin(angle) * 3 + 1,
                    w: 12, h: 12,
                    damage: 8 + this.phase * 2
                });
            }
        }
        if (this.health < this.maxHealth * 0.4) {
            this.phase = 2;
        }
    }
    
    draw() {
        if (this.dying) ctx.globalAlpha = 1 - this.deathTimer / 60;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.w/2, this.h/2, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = this.eyeColor;
        ctx.beginPath();
        ctx.arc(-20, -10, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, -10, 12, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-20, -10, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, -10, 5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        const barW = this.w + 20;
        const barH = 6;
        const barX = this.x - barW/2;
        const barY = this.y - this.h/2 - 20;
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(barX, barY, barW * (this.health/this.maxHealth), barH);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0000';
        ctx.font = '12px Courier New';
        ctx.fillText('👹 BOSS', this.x, barY - 5);
    }
    
    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.dying = true;
            bossDefeats++;
            nightCoins += 20;
            updateUI();
        }
    }
}

// ==========================================
// UPDATE
// ==========================================
function update() {
    if (introPhase !== 'game') {
        updateIntro();
        return;
    }
    if (gameOver) return;
    
    frame++;
    gameTime++;
    changeBiome(stage);
    speed = 3 + Math.floor(score / 50) * 0.3 * cat.speedMult;
    
    // BOSS SPAWN - 20 seconds for testing!
    if (!bossActive && !bossWarning && !stageComplete) {
        bossSpawnTimer++;
        if (bossSpawnTimer > BOSS_SPAWN_TIME) {
            bossWarning = true;
            bossWarningTimer = BOSS_WARNING_TIME;
            bossSpawnTimer = 0;
            sound.play('boss');
            console.log("BOSS WARNING! Boss arriving in 3 seconds!");
        }
    }
    
    // Cat animation
    cat.animation += 0.1;
    cat.tailWag += 0.15;
    
    if (invincible) {
        invincibleTimer--;
        if (invincibleTimer <= 0) invincible = false;
    }
    
    if (cat.tripleShotTimer > 0) {
        cat.tripleShotTimer--;
        if (cat.tripleShotTimer <= 0) cat.tripleShot = false;
    }
    if (cat.shieldTimer > 0) {
        cat.shieldTimer--;
        if (cat.shieldTimer <= 0) cat.shieldActive = false;
    }
    
    // Cat physics
    if (!cat.dashing) {
        cat.vy += cat.gravity;
        cat.y += cat.vy;
    } else {
        cat.dashTimer--;
        cat.x += 15 * cat.dashDirection;
        if (cat.dashTimer % 2 === 0) {
            particles.push({
                x: cat.x - 10 * cat.dashDirection,
                y: cat.y + (Math.random()-0.5)*20,
                vx: -cat.dashDirection * 1,
                vy: (Math.random()-0.5)*2,
                life: 8, maxLife: 8,
                color: '#00ffff',
                size: 3 + Math.random()*4
            });
        }
        if (cat.dashTimer <= 0) cat.dashing = false;
    }
    
    if (cat.y + cat.h/2 >= 430) {
        cat.y = 430 - cat.h/2;
        cat.vy = 0;
        cat.grounded = true;
        cat.doubleJump = true;
    } else {
        cat.grounded = false;
    }
    
    if (cat.attackCooldown > 0) cat.attackCooldown--;
    if (cat.dashCooldown > 0) cat.dashCooldown--;
    
    // Stage progression
    if (!bossActive && !boss && !stageComplete && !bossWarning) {
        stageProgress = (score % stageTarget) / stageTarget;
    }
    
    if (bossWarning) {
        bossWarningTimer--;
        if (bossWarningTimer <= 0) {
            boss = new Boss(stage);
            bossActive = true;
            console.log("BOSS HAS ARRIVED!");
        }
    }
    
    if (stageComplete) {
        stageCompleteTimer--;
        if (stageCompleteTimer <= 0) stageComplete = false;
    }
    
    if (boss) boss.update();
    
    // Spawn
    if (!bossActive && !bossWarning && !stageComplete) {
        const rate = Math.max(30, 60 - stage * 2);
        if (frame % rate === 0) spawnObstacle();
        if (frame % (rate * 2) === 0) spawnEnemy();
    }
    
    // Update obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.x -= speed;
        if (obs.x + obs.w < 0) { obstacles.splice(i, 1); continue; }
        if (rectCollide({x: cat.x-15, y: cat.y-12, w: 30, h: 24}, obs)) {
            if (cat.dashing) {
                obstacles.splice(i, 1);
                score += 10;
                if (obs.dropCoin) nightCoins += 3;
                if (obs.dropHeart) {
                    collectibles.push({ x: obs.x, y: obs.y, w: 15, h: 15, type: 'health', bob: Math.random()*100 });
                }
                updateUI();
                continue;
            }
            if (cat.shieldActive) {
                obstacles.splice(i, 1);
                cat.shieldActive = false;
                continue;
            }
            if (!invincible) {
                health -= 15;
                invincible = true;
                invincibleTimer = 30;
                obstacles.splice(i, 1);
                sound.play('hit');
                screenShake.trigger(5);
                updateUI();
                if (health <= 0) {
                    gameOver = true;
                    deathAnim.start();
                }
            }
        }
    }
    
    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x -= speed;
        if (e.type === 'fly') e.y += Math.sin(e.animation) * 1;
        e.animation += 0.05;
        if (e.x + e.w < 0) { enemies.splice(i, 1); continue; }
        if (rectCollide({x: cat.x-15, y: cat.y-12, w: 30, h: 24}, e)) {
            if (cat.dashing) {
                enemies.splice(i, 1);
                enemiesKilled++;
                score += 5;
                xpManager.addXP(5);
                updateUI();
                continue;
            }
            if (!invincible) {
                health -= 10;
                invincible = true;
                invincibleTimer = 30;
                enemies.splice(i, 1);
                sound.play('hit');
                screenShake.trigger(3);
                updateUI();
                if (health <= 0) {
                    gameOver = true;
                    deathAnim.start();
                }
            }
        }
    }
    
    // Update projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        p.x += p.vx;
        if (p.x > W) { projectiles.splice(i, 1); continue; }
        let hit = false;
        for (let j = obstacles.length - 1; j >= 0; j--) {
            if (rectCollide(p, obstacles[j])) {
                projectiles.splice(i, 1);
                if (obstacles[j].dropCoin) nightCoins += 3;
                if (obstacles[j].dropHeart) {
                    collectibles.push({ x: obstacles[j].x, y: obstacles[j].y, w: 15, h: 15, type: 'health', bob: Math.random()*100 });
                }
                obstacles.splice(j, 1);
                enemiesKilled++;
                score += 10;
                xpManager.addXP(10);
                updateUI();
                if (Math.random() > 0.85) {
                    collectibles.push({ x: obstacles[j] ? obstacles[j].x : p.x, y: obstacles[j] ? obstacles[j].y : p.y, w: 15, h: 15, type: 'powerup', bob: Math.random()*100 });
                }
                screenShake.trigger(3);
                hit = true;
                break;
            }
        }
        if (hit) continue;
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (rectCollide(p, enemies[j])) {
                projectiles.splice(i, 1);
                enemies.splice(j, 1);
                enemiesKilled++;
                score += 5;
                xpManager.addXP(5);
                updateUI();
                hit = true;
                break;
            }
        }
        if (hit) continue;
        if (boss && !boss.dying) {
            if (rectCollide(p, {x: boss.x - boss.w/2, y: boss.y - boss.h/2, w: boss.w, h: boss.h})) {
                projectiles.splice(i, 1);
                boss.takeDamage(p.damage || 10);
                score += 5;
                xpManager.addXP(20);
                screenShake.trigger(8);
                updateUI();
            }
        }
    }
    
    // Update boss projectiles
    for (let i = bossProjectiles.length - 1; i >= 0; i--) {
        const p = bossProjectiles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W || p.y > H) { bossProjectiles.splice(i, 1); continue; }
        if (rectCollide({x: cat.x-15, y: cat.y-12, w: 30, h: 24}, p)) {
            if (cat.dashing) {
                bossProjectiles.splice(i, 1);
                continue;
            }
            if (cat.shieldActive) {
                bossProjectiles.splice(i, 1);
                cat.shieldActive = false;
                continue;
            }
            if (!invincible) {
                health -= p.damage || 10;
                invincible = true;
                invincibleTimer = 30;
                bossProjectiles.splice(i, 1);
                sound.play('hit');
                screenShake.trigger(6);
                updateUI();
                if (health <= 0) {
                    gameOver = true;
                    deathAnim.start();
                }
            }
        }
    }
    
    // Update collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        const col = collectibles[i];
        col.x -= speed;
        col.bob = (col.bob || 0) + 0.05;
        if (col.x + col.w < 0) { collectibles.splice(i, 1); continue; }
        if (rectCollide({x: cat.x-15, y: cat.y-12, w: 30, h: 24}, col)) {
            const c = collectibles.splice(i, 1)[0];
            if (c.type === 'powerup') {
                cat.tripleShot = true;
                cat.tripleShotTimer = 600;
                cat.shieldActive = true;
                cat.shieldTimer = 600;
                cat.hasShield = true;
                sound.play('collect');
            } else if (c.type === 'health') {
                health = Math.min(maxHealth, health + 25);
                sound.play('collect');
                updateUI();
            } else if (c.type === 'star') {
                score += 15;
                xpManager.addXP(10);
                nightCoins += 5;
                updateUI();
            }
        }
    }
    
    // Update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx || 0;
        p.y += p.vy || 0;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
    }
    
    // Update death animation
    deathAnim.update();
    screenShake.update();
    checkAchievements();
    updateUI();
}

// ==========================================
// DRAW
// ==========================================
function draw() {
    ctx.clearRect(0, 0, W, H);
    
    if (introPhase !== 'game') {
        drawIntro();
        return;
    }
    
    ctx.save();
    ctx.translate(screenShake.x, screenShake.y);
    
    const biome = getBiome();
    const timeOfDay = (gameTime % 1200) / 1200;
    
    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    const color1 = timeOfDay < 0.3 ? biome.sky[0] : (timeOfDay < 0.7 ? '#2a4a7a' : biome.sky[1]);
    const color2 = timeOfDay < 0.3 ? biome.sky[1] : (timeOfDay < 0.7 ? '#4a7aaa' : biome.sky[0]);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    
    // Sun/Moon
    const celestialX = 750;
    const celestialY = 50 + (timeOfDay < 0.3 ? 0 : (timeOfDay < 0.7 ? -30 : 30));
    ctx.shadowBlur = 50;
    ctx.shadowColor = timeOfDay < 0.3 ? '#ffffff' : '#ffcc00';
    ctx.fillStyle = timeOfDay < 0.3 ? biome.moonColor : '#ffcc00';
    ctx.beginPath();
    ctx.arc(celestialX, celestialY, 35, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Stars
    if (timeOfDay < 0.3) {
        for (let i = 0; i < biome.starCount; i++) {
            const x = (i * 137 + frame * 0.1) % W;
            const y = (i * 97 + 50) % (H * 0.6);
            const b = 0.5 + 0.5 * Math.sin(i + frame * 0.02);
            ctx.fillStyle = `rgba(255,255,255,${b})`;
            ctx.beginPath();
            ctx.arc(x, y, 0.5 + Math.random(), 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    // Clouds
    for (let i = 0; i < 3; i++) {
        const cx = (i * 300 + frame * 0.2) % (W + 100) - 50;
        const cy = 50 + i * 60;
        ctx.fillStyle = `rgba(255,255,255,${0.1 + (timeOfDay < 0.7 ? 0.2 : 0.05)})`;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 60, 15, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx + 30, cy + 5, 40, 12, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx - 20, cy + 5, 40, 12, 0, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Ground
    ctx.fillStyle = biome.ground;
    ctx.fillRect(0, 430, W, 70);
    ctx.fillStyle = biome.groundLine;
    ctx.fillRect(0, 430, W, 5);
    
    // Collectibles
    for (const col of collectibles) {
        const bob = Math.sin(col.bob + Date.now()/500) * 5;
        ctx.shadowBlur = 15;
        if (col.type === 'powerup') {
            ctx.shadowColor = '#ff00ff';
            ctx.fillStyle = '#ff00ff';
            ctx.beginPath();
            ctx.arc(col.x + col.w/2, col.y + col.h/2 + bob, col.w/2, 0, Math.PI*2);
            ctx.fill();
        } else if (col.type === 'health') {
            ctx.shadowColor = '#ff0000';
            ctx.fillStyle = '#ff0000';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', col.x + col.w/2, col.y + col.h/2 + 6 + bob);
        } else {
            ctx.shadowColor = '#ffcc00';
            ctx.fillStyle = '#ffcc00';
            ctx.font = '18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⭐', col.x + col.w/2, col.y + col.h/2 + 6 + bob);
        }
        ctx.shadowBlur = 0;
    }
    
    // Obstacles
    for (const obs of obstacles) {
        ctx.save();
        ctx.translate(obs.x + obs.w/2, obs.y + obs.h/2);
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#550000';
        ctx.fillRect(-obs.w/2, -obs.h/2, obs.w, obs.h);
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.beginPath();
        ctx.arc(-5, -5, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(5, -5, 4, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
    }
    
    // Enemies
    for (const e of enemies) {
        ctx.save();
        ctx.translate(e.x, e.y);
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff6600';
        ctx.fillStyle = '#662200';
        ctx.beginPath();
        ctx.arc(0, 0, e.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ff6600';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff6600';
        ctx.beginPath();
        ctx.arc(-4, -4, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(4, -4, 3, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
        ctx.shadowBlur = 0;
    }
    
    // Projectiles
    for (const p of projectiles) {
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x + p.w/2 - 2, p.y + p.h/2 - 2, p.w/4, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Boss projectiles
    for (const p of bossProjectiles) {
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(p.x + p.w/2, p.y + p.h/2, p.w/2, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(p.x + p.w/2 - 2, p.y + p.h/2 - 2, p.w/4, 0, Math.PI*2);
        ctx.fill();
    }
    
    // Boss
    if (boss) boss.draw();
    
    // Cat
    ctx.save();
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    const bob = cat.grounded ? Math.sin(cat.animation) * 2 : 0;
    const bodyY = cat.y + bob;
    ctx.fillStyle = cat.bodyColor;
    ctx.beginPath();
    ctx.ellipse(cat.x, bodyY, 15, 12, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x, bodyY - 8, 12, 0, Math.PI*2);
    ctx.fill();
    // Ears
    ctx.beginPath();
    ctx.moveTo(cat.x - 8, bodyY - 16);
    ctx.lineTo(cat.x - 14, bodyY - 28);
    ctx.lineTo(cat.x - 4, bodyY - 22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cat.x + 8, bodyY - 16);
    ctx.lineTo(cat.x + 14, bodyY - 28);
    ctx.lineTo(cat.x + 4, bodyY - 22);
    ctx.fill();
    // Inner ears
    ctx.fillStyle = '#4a1a2a';
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(cat.x - 7, bodyY - 17);
    ctx.lineTo(cat.x - 11, bodyY - 25);
    ctx.lineTo(cat.x - 5, bodyY - 21);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cat.x + 7, bodyY - 17);
    ctx.lineTo(cat.x + 11, bodyY - 25);
    ctx.lineTo(cat.x + 5, bodyY - 21);
    ctx.fill();
    // Mask
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#1a1a3a';
    ctx.beginPath();
    ctx.ellipse(cat.x, bodyY - 8, 14, 6, 0, 0, Math.PI*2);
    ctx.fill();
    // Eyes
    ctx.shadowBlur = 25;
    ctx.fillStyle = cat.shieldActive ? '#ff00ff' : cat.eyeColor;
    ctx.beginPath();
    ctx.arc(cat.x - 5, bodyY - 10, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 5, bodyY - 10, 4, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#0a0a2a';
    ctx.beginPath();
    ctx.arc(cat.x - 4, bodyY - 9, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cat.x + 6, bodyY - 9, 2, 0, Math.PI*2);
    ctx.fill();
    // Nose
    ctx.fillStyle = '#4a2a2a';
    ctx.beginPath();
    ctx.moveTo(cat.x, bodyY - 6);
    ctx.lineTo(cat.x - 2, bodyY - 4);
    ctx.lineTo(cat.x + 2, bodyY - 4);
    ctx.fill();
    // Whiskers
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            ctx.moveTo(cat.x + side * 8, bodyY - 6 + w * 2);
            ctx.lineTo(cat.x + side * 25, bodyY - 8 + w * 4 + w * 2);
            ctx.stroke();
        }
    }
    // Cape
    ctx.shadowBlur = 15;
    ctx.fillStyle = cat.capeColor;
    const wave = Math.sin(cat.tailWag) * 3;
    ctx.beginPath();
    ctx.moveTo(cat.x - 8, bodyY + 5);
    ctx.quadraticCurveTo(cat.x - 30 + wave, bodyY + 15, cat.x - 15 + wave, bodyY + 30);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cat.x + 8, bodyY + 5);
    ctx.quadraticCurveTo(cat.x + 30 - wave, bodyY + 15, cat.x + 15 - wave, bodyY + 30);
    ctx.fill();
    // Tail
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.shadowColor = cat.eyeColor;
    ctx.beginPath();
    ctx.moveTo(cat.x + 12, bodyY + 5);
    const tailX = cat.x + 25 + Math.sin(cat.tailWag) * 5;
    const tailY = bodyY - 5 + Math.cos(cat.tailWag) * 5;
    ctx.quadraticCurveTo(cat.x + 20, bodyY - 10, tailX, tailY);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Dash effect
    if (cat.dashing) {
        ctx.shadowBlur = 40;
        ctx.shadowColor = cat.eyeColor;
        ctx.strokeStyle = `rgba(0,255,255,${0.5 * (cat.dashTimer / cat.dashMax)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cat.x, cat.y + bob, 20, 0, Math.PI*2);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    
    // Particles
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    
    // Death animation
    deathAnim.draw();
    
    // Boss warning
    if (bossWarning) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff0000';
        ctx.font = '30px Courier New';
        ctx.fillText('⚠️ BOSS INCOMING! ⚠️', W/2, 100);
        ctx.shadowBlur = 0;
    }
    
    // Stage complete
    if (stageComplete) {
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffcc00';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ffcc00';
        ctx.font = '24px Courier New';
        ctx.fillText('🎉 STAGE CLEAR! 🎉', W/2, 100);
        ctx.shadowBlur = 0;
    }
    
    // Stage info
    ctx.fillStyle = '#fff';
    ctx.font = '12px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`${biome.name} - Stage ${stage}`, 20, 90);
    
    if (!bossActive && !bossWarning && !stageComplete) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(20, 95, 80, 4);
        ctx.fillStyle = '#ffcc00';
        ctx.fillRect(20, 95, 80 * stageProgress, 4);
    }
    
    // XP
    xpManager.draw();
    
    // Achievements
    drawAchievements();
    
    ctx.restore();
    
    // Game over
    if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ff0000';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff0000';
        ctx.font = '42px Courier New';
        ctx.fillText('GAME OVER', W/2, 160);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '18px Courier New';
        ctx.fillText(`Score: ${Math.floor(score)}  |  Stage: ${stage}  |  Level: ${xpManager.level}`, W/2, 210);
        ctx.fillStyle = '#ffcc00';
        ctx.font = '16px Courier New';
        ctx.fillText('Tap / Press Space to Restart', W/2, 300);
    }
}

// ==========================================
// GAME LOOP
// ==========================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ==========================================
// INPUT
// ==========================================
function handleJump() {
    if (introPhase === 'title' || introPhase === 'story') { skipIntro = true; return; }
    if (gameOver) { resetGame(); return; }
    jump();
}

function handleAttack() {
    if (introPhase !== 'game') return;
    if (gameOver) { resetGame(); return; }
    shoot();
}

function handleDashF() {
    if (introPhase !== 'game') return;
    if (gameOver) { resetGame(); return; }
    dash(1);
}

function handleDashB() {
    if (introPhase !== 'game') return;
    if (gameOver) { resetGame(); return; }
    dash(-1);
}

// Keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Space') { handleJump(); e.preventDefault(); }
    if (e.key === 'z' || e.key === 'Z') { handleAttack(); e.preventDefault(); }
    if (e.key === 'x' || e.key === 'X') { handleDashF(); e.preventDefault(); }
    if (e.key === 'c' || e.key === 'C') { handleDashB(); e.preventDefault(); }
});

// Canvas
canvas.addEventListener('click', (e) => {
    e.preventDefault();
    handleJump();
    handleAttack();
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
    handleAttack();
});

// Mobile buttons
document.getElementById('btnJump').addEventListener('click', (e) => {
    e.preventDefault();
    handleJump();
});

document.getElementById('btnJump').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
});

document.getElementById('btnAttack').addEventListener('click', (e) => {
    e.preventDefault();
    handleAttack();
});

document.getElementById('btnAttack').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleAttack();
});

document.getElementById('btnDashF').addEventListener('click', (e) => {
    e.preventDefault();
    handleDashF();
});

document.getElementById('btnDashF').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDashF();
});

document.getElementById('btnDashB').addEventListener('click', (e) => {
    e.preventDefault();
    handleDashB();
});

document.getElementById('btnDashB').addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleDashB();
});

// ==========================================
// START
// ==========================================
resetGame();
gameLoop();
