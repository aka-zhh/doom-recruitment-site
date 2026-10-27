# The Order of Doom - College Club Recruitment Website

A dynamic, single-page college club recruitment website crafted with a cinematic **Doctor Doom** theme. Built with modern HTML5, Tailwind CSS, advanced 3D CSS animations, and vanilla JavaScript.

---

## 🏛️ Features Breakdown

### 1. The Gateway of Doom (Cinematic Intro)
- **Full-Screen 3D Metallic Doors**: Massive dual citadel doors featuring steel panel relief, heavy rivets, metallic reinforced beams, and the Latverian Citadel crest.
- **Doctor Doom Silhouette**: An imposing vector illustration of Doctor Doom standing before the gates with a flowing hooded cowl, polished silver mask with sinister vents, glowing neon green eye slits, and outstretched armored gauntlets.
- **Dynamic Opening Sequence**:
  - Green eldritch magic rays crackle from Doom's gauntlets.
  - The massive castle doors swing outward in 3D perspective (`transform: rotateY(-108deg)` / `rotateY(108deg)`).
  - Portal emerald light floods through the gateway as the overlay dissolves to reveal the website.
  - Includes a quick **Skip** button, a **Breach Now** command, and a **Replay Gateway** feature.

### 2. Visual Theme & Styling
- **Color Palette**: Deep abyssal shadows (`#050608`), metallic brushed silvers (`#c5cbd6`), apocalyptic ash greys, and striking glowing neon green accents (`#39ff14`).
- **Typography**: Sharp, imposing headings (`Orbitron`, `Cinzel`) paired with futuristic paragraph typography (`Rajdhani`, `Chakra Petch`).
- **Interactive Parallax Atmosphere**: An HTML5 Canvas rendering a dark stormy sky, procedural lightning strikes, upward-drifting radioactive green embers, scanlines, and mouse-reactive parallax layers.

### 3. Hero Section
- **Headline**: `"Submit to the Future. Join the Club."`
- **Sub-headline**: `"The Avengers had their time. Now, we build the ultimate order."`
- **Pulsing CTA**: A glowing neon green `"PLEDGE ALLEGIANCE"` button with a breathing energy aura that smoothly scrolls candidates directly to the Initiation Sequence.
- **Telemetry HUD**: Real-time status indicators (Citadel Grid, Active Hegemony, Enlisted Agent count).

### 4. The Inner Circle (Leadership Grid)
Four premium metallic profile cards featuring custom Doom insignia avatars, clearance tags, bio-metrics, and interactive **3D cursor tilt** with neon green edge illumination:
1. **Akash Kumar D** — *Leader* (Sovereign Overseer // Latverian Hegemony)
2. **Joseph Shinjo Thomas** — *Co-Leader* (Arch-Strategist // Prime Enforcer)
3. **Dhyan Krishna** — *Elder* (Quantum Sorcerer // High Inquisitor)
4. **Nehda** — *Elder* (Master of Cryptography // Cyber Oracle)

### 5. Initiation Sequence (Recruitment Terminal)
- **Form Fields**:
  - Full Candidate Name (Required)
  - Academic Major / Discipline (Required)
  - Supervillain Alias (Optional)
  - "Why should we let you in?" (Text area with real-time character limit counter)
  - Fealty Vow Checkbox
- **Metallic Submit Button**: Flashes bright neon green (`#39ff14`) with hydraulic audio cues and feedback upon submission.
- **Dossier Success Modal**: Instead of a generic browser alert, launches a stylized "Welcome to Doom" recruit credential pass with candidate summary, timestamp, and a generated Initiate Code (e.g., `#LAT-8492`).

### 6. Procedural Web Audio FX
- Procedurally generated sound effects using the browser's native **Web Audio API** (requires no external `.mp3` or `.wav` files):
  - Atmospheric low-frequency Doom bass drone
  - Heavy iron door grinding and hydraulic pressure release
  - Holographic interface click feedback
  - Initiation confirmation chime
  - Audio toggle button located in the header for easy muting/unmuting.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari):

```bash
# Windows
start index.html
```

Or serve via any static HTTP server if desired.
