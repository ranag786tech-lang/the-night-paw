# 🐱⚡ **THE NIGHT PAW - Complete Edition**

**A cinematic action platformer featuring a superhero cat with a dark, comic-book aesthetic.**

![The Night Paw Banner](https://via.placeholder.com/1200x400/0a0a2a/00ffff?text=THE+NIGHT+PAW)

> **"In the dark streets of Neo-City, a young cat named 'Paw' discovered a mysterious power... The Night Force awakened within him. Now he fights to protect the city from darkness—one claw at a time."**

---

## 📖 **TABLE OF CONTENTS**

- [🎮 Game Overview](#-game-overview)
- [✨ Features](#-features)
- [🎯 How to Play](#-how-to-play)
- [🕹️ Controls](#️-controls)
- [📊 Progression System](#-progression-system)
- [👹 Boss Battles](#-boss-battles)
- [🎨 Customization](#-customization)
- [🖥️ Installation](#️-installation)
- [🌐 Live Demo](#-live-demo)
- [📂 Project Structure](#-project-structure)
- [🛠️ Technologies Used](#️-technologies-used)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Credits](#-credits)

---

## 🎮 **GAME OVERVIEW**

**The Night Paw** is a side-scrolling action platformer where you control a superhero cat on a mission to protect Neo-City from darkness. The game features:

- **Cinematic story intro** with comic-style panels
- **Dynamic day/night cycle** that affects visuals
- **Multiple biomes** that change every 3 stages
- **Boss battles** with unique attack patterns
- **Progression system** with leveling and perks
- **Achievements** to unlock as you play
- **Responsive design** for desktop and mobile

The game is built with pure **HTML5 Canvas** and **JavaScript**, with no external libraries or dependencies.

---

## ✨ **FEATURES**

### 🎯 **Core Gameplay**
- ✅ **Double Jump** - Unlocked at level 9
- ✅ **Dash Forward & Backward** - 2-second cooldown each
- ✅ **Triple Shot** - Unlocked with power orbs
- ✅ **Mega Attack** - 5 projectiles (level 10)
- ✅ **Shield** - Temporary invincibility

### 📊 **Progression**
- ✅ **XP System** - Earn XP from kills and collectibles
- ✅ **20 Levels** - Each with unique perks and upgrades
- ✅ **Power Level** - Every 10 kills = stat boost
- ✅ **Achievements** - 5 achievements with rewards

### 👹 **Boss System**
- ✅ **Boss Spawns every 1-2 minutes** (20 seconds in testing)
- ✅ **3-second warning** with dramatic alert
- ✅ **2 Phase battles** - Boss gets harder at 40% HP
- ✅ **Boss Drops** - Power-ups and coins on defeat

### 🎨 **Visuals**
- ✅ **Cinematic Story Intro** with skip option
- ✅ **Day/Night Cycle** - Changes every 20 seconds
- ✅ **4 Biomes** - City, Forest, Cave, Space
- ✅ **Screen Shake** - Impact from explosions
- ✅ **Death Animation** - Dramatic defeat sequence
- ✅ **Particle System** - Explosions, trails, collectibles

### 🔊 **Audio**
- ✅ **8 Sound Effects** - Jump, attack, hit, collect, boss, dash, level up, death
- ✅ **Web Audio API** - No external files needed

### 📱 **Platform**
- ✅ **Responsive** - Works on desktop, tablet, and mobile
- ✅ **Touch Controls** - Mobile-friendly buttons
- ✅ **Keyboard Controls** - Full keyboard support

---

## 🎯 **HOW TO PLAY**

**Your mission:** Run, jump, and fight through obstacles and enemies. Collect power-ups, defeat bosses, and level up to become the ultimate Night Paw!

### 🏃 **Basic Gameplay**
1. **Run automatically** - The game scrolls from right to left
2. **Jump** to avoid obstacles and reach platforms
3. **Attack** to destroy enemies and obstacles
4. **Dash** to pass through enemies and projectiles

### 💎 **Collectibles**
| Item | Effect |
|------|--------|
| ⭐ **Star** | +15 score, +10 XP, +5 coins |
| ❤️ **Heart** | Heals 25 HP (drops from obstacles) |
| 🔮 **Power Orb** | Triple Shot + Shield for 10 seconds |
| 🪙 **Coin** | Currency for future upgrades |

### 🎯 **Combat**
- **Enemies** : Basic ground enemies and flying enemies
- **Obstacles** : Owls, spikes, drones
- **Boss** : Appears after 1-2 minutes (20 seconds for testing)

### 📈 **Progression**
- **Kill enemies** → Gain XP
- **Collect stars** → Gain XP + Score
- **Defeat boss** → Gain coins + stage progression
- **Level up** → Unlock perks (damage, health, speed, double jump, mega attack)

---

## 🕹️ **CONTROLS**

### ⌨️ **Keyboard (Desktop)**
| Key | Action |
|-----|--------|
| `SPACE` | Jump (Double jump after level 9) |
| `Z` | Attack |
| `X` | Dash Forward |
| `C` | Dash Backward |

### 📱 **Touch (Mobile)**
| Button | Action |
|--------|--------|
| ⬆ **JUMP** | Jump (Double jump after level 9) |
| ⚡ **ATK** | Attack |
| ➡️ **DASH** | Dash Forward |
| ⬅️ **BACK** | Dash Backward |

### 🖱️ **Tap Canvas**
- Tap anywhere to **Jump + Attack** simultaneously

---

## 📊 **PROGRESSION SYSTEM**

### 📈 **Leveling Up**
| Level | Perk |
|-------|------|
| 2 | +10 HP |
| 3 | +2 Damage |
| 4 | +5% Speed |
| 5 | Shield Ability |
| 6 | +15 HP |
| 7 | +3 Damage |
| 8 | +5% Speed |
| 9 | Double Jump |
| 10 | Mega Attack (5 projectiles) |
| 12 | +20 HP |
| 14 | +4 Damage |
| 16 | +20% Speed |
| 18 | Double Jump |
| 20 | GOD MODE (50 damage, 200 HP, 1.5x speed) |

### 🏆 **Achievements**
| Achievement | Condition | Reward |
|-------------|-----------|--------|
| ⚔️ **First Blood** | Kill 10 enemies | +10 coins |
| 🌟 **Stage Master** | Reach Stage 5 | +10 coins |
| 👹 **Boss Slayer** | Defeat 3 Bosses | +10 coins |
| 🪙 **Collector** | Collect 100 coins | +10 coins |
| ⭐ **Legendary** | Reach Level 10 | +10 coins |

---

## 👹 **BOSS BATTLES**

### 📅 **Boss Spawn Timer**
- **Testing mode:** 20 seconds
- **Release mode:** 60-120 seconds (random)

### ⚠️ **Warning Phase**
- 3-second warning with "BOSS INCOMING!" text
- Dramatic sound effect
- Red flashing particles

### 👾 **Boss Behavior**
- **Phase 1** : Normal attacks (3 projectiles)
- **Phase 2** (40% HP) : Enraged (5 projectiles, faster)
- **Attacks** : Jumps, projectiles, ground slam

### 🎁 **Boss Rewards**
- 5 power-up/star drops on defeat
- +20 coins
- Stage progression

---

## 🎨 **CUSTOMIZATION**

### 🎭 **Available Skins**
| Skin | Body Color | Eye Color | Cape Color |
|------|------------|-----------|------------|
| **Classic** | #111 | #00ffff | #1a1a2a |
| **Shadow** | #0a0a0a | #ff00ff | #0a0a1a |
| **Fire** | #1a0a0a | #ff4400 | #2a0a0a |
| **Ice** | #0a1a2a | #00ccff | #0a2a3a |
| **Gold** | #1a1a00 | #ffcc00 | #2a2a00 |
| **Cyber** | #0a0a2a | #00ff00 | #0a2a2a |

*Skins are currently visual only. Future update will include unlocking via achievements.*

---

## 🖥️ **INSTALLATION**

### 📦 **Option 1: Direct Download**
1. Download the 3 files: `index.html`, `style.css`, `script.js`
2. Place them in the same folder
3. Open `index.html` in any modern browser

### 🐙 **Option 2: GitHub**
```bash
git clone https://github.com/yourusername/the-night-paw.git
cd the-night-paw
# Open index.html in your browser
```

### 🌐 **Option 3: Live Server**
```bash
# Install live-server globally
npm install -g live-server

# Run from game directory
live-server
```

---

## 🌐 **LIVE DEMO**

Play the game online:  
**[https://yourusername.github.io/the-night-paw/](https://yourusername.github.io/the-night-paw/)**

*(Replace with your actual GitHub Pages URL)*

---

## 📂 **PROJECT STRUCTURE**

```
the-night-paw/
│
├── index.html          # Main HTML file
├── style.css           # All styles
├── script.js           # Complete game logic
├── README.md           # Documentation
└── assets/             # (Optional) Images, sounds, etc.
```

---

## 🛠️ **TECHNOLOGIES USED**

- **HTML5 Canvas** - Rendering engine
- **CSS3** - Styling and responsive design
- **JavaScript (ES6+)** - Game logic, physics, AI
- **Web Audio API** - Sound effects
- **No external libraries** - Pure vanilla JavaScript

---

## 🤝 **CONTRIBUTING**

Contributions are welcome! Here's how you can help:

### 🐛 **Bug Reports**
- Open an issue on GitHub
- Describe the bug and steps to reproduce
- Include screenshots if possible

### 💡 **Feature Requests**
- Open an issue with "Feature Request" label
- Describe the feature in detail
- Explain why it would be valuable

### 🔧 **Pull Requests**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 **LICENSE**

This project is licensed under the **MIT License** - see below for details:

```
MIT License

Copyright (c) 2024 The Night Paw

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 **CREDITS**

- **Concept & Design** : Your Name
- **Development** : Your Name
- **Art** : Original pixel art by Your Name
- **Sound Design** : Web Audio API
- **Special Thanks** : To all the cats who inspired this game 🐱

---

## 📧 **CONTACT**

- **Email** : your.email@example.com
- **GitHub** : [github.com/yourusername](https://github.com/yourusername)
- **Twitter** : @yourusername

---

## 🎉 **THANK YOU FOR PLAYING!**

> **"The night is dark, but the Paw shines bright."**

---

### ⭐ **If you enjoy this game, please give it a star on GitHub!** ⭐

---

## 📝 **CHANGELOG**

### v1.0.0 (Current)
- ✅ Complete game with all 10 features
- ✅ Boss battles with 2 phases
- ✅ 20-level progression system
- ✅ 5 achievements
- ✅ 4 biomes
- ✅ Day/night cycle
- ✅ Cinematic intro
- ✅ Responsive design
- ✅ Sound effects
- ✅ Touch controls

### Coming Soon (v1.1.0)
- 🔜 More biomes (Volcano, Underwater)
- 🔜 Additional boss types (Dragon, Wizard)
- 🔜 Shop system using coins
- 🔜 More skins unlockable via achievements
- 🔜 Endless mode
