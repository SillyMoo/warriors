# Warriors Coaching Drills - Build & Verification Tooling

This directory contains reusable node scripts for generating, updating, and verifying `warriors-coaching-drills.html`.

## Deliverable
- `../warriors-coaching-drills.html`: The primary standalone, self-contained single HTML file containing all drill boards, player animations, controls, and progression tabs.

## Available Scripts

### 1. `verify.js`
Runs an automated DOM test suite using AST parsing (`acorn`) and browser simulation (`jsdom`):
- Verifies zero syntax errors in the embedded module script.
- Verifies that React mounts cleanly into `#root`.
- Verifies that the **Bronze**, **Silver**, and **Gold** progression tabs exist and render properly.
- Verifies that selecting a tab dynamically enlarges the active heading and badge (44px) while shrinking inactive headings and badges (24px).
- Verifies that each tier displays its respective coaching standards in isolation:
  - **Bronze**: *Safe Hands & Depth Stagger* (+ cues)
  - **Silver**: *Single-Touch Flow in Stride* (+ cues)
  - **Gold**: *Draw, Hook & Continuous Queue Rotation* (+ cues)
- Verifies the **Silver 4-player drill**:
  - 4 continuous queues / 4 lanes (`Left`, `Mid-Left`, `Mid-Right`, `Right`).
  - Ball path weave: `Left → 1st Mid-L → 1st Mid-R → 1st Right → 2nd Mid-R → 2nd Mid-L → 2nd Left → 3rd Mid-L ↺`.

**Usage:**
```bash
node scripts/verify.js
```

### 2. `update_silver.js`
Generates and injects the 4-lane player setup and weave animation for the Silver tier:
- Configures 4 continuous queues of players (`L1..L6`, `ML1..ML6`, `MR1..MR6`, `R1..R6`).
- Places 8 cones (4 top cones, 4 queue start cones across 20m grid).
- Maps the continuous 8-step animation weave from Left across all 4 channels to Right, and back again to Left and into the infinite continuous cycle.

**Usage:**
```bash
node scripts/update_silver.js
```
