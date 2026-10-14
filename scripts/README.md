# Warriors Coaching Drills - Build & Verification Tooling

This directory contains reusable node scripts for generating and verifying `warriors-coaching-drills.html`.

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

**Usage:**
```bash
node scripts/verify.js
```
