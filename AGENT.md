# Warriors Coaching Playbook — Agent Blueprint & Technical Specification

> **Project Blueprint & Single Source of Truth**  
> Reading Rugby Football Club (Warriors Coaching Playbook)  
> Deliverable: `./warriors-coaching-drills.html` (Standalone, zero-runtime-dependency single HTML file)

---

## 1. Architecture Overview

The Warriors Coaching Playbook compiles declarative drill specifications into an offline-ready, single-file interactive training dashboard. The engine uses React 18 in an unbundled browser environment to drive real-time SVG animated playback.

```
                           ┌──────────────────────────────┐
                           │   content/attack/*.yaml      │
                           │   content/defense/*.yaml     │
                           └──────────────┬───────────────┘
                                          │
                                          ▼
                           ┌──────────────────────────────┐
                           │        src/drills.js         │
                           │      (src/compiler.js)       │
                           └──────────────┬───────────────┘
                                          │ compiles to
                                          ▼
┌─────────────────────────┐  drillsCatalog, Te, Ee, etc.  ┌─────────────────────────┐
│    src/template.html    │◄─────────────────────────────┤        build.js         │
│  (Tailwind + React CDN) │                              │  (Node.js Build Script) │
└───────────┬─────────────┘                              └────────────┬────────────┘
            │                                                         │
            │ Injects src/components:                                 │
            │  - PitchBoard.js (Ae / ke)                              │
            │  - MedalBadge.js (De / Ie)                              │
            │  - DrillView.js  (DrillView generic engine)             │
            │  - App.js        (Top-level tabs & catalog router)      │
            ▼                                                         ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           ./warriors-coaching-drills.html                        │
│                   (Mirrored to dist/warriors.html for distribution)              │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy & Responsibilities

1. **`src/drills.js` & `src/compiler.js` (Data Aggregation Layer)**:
   - Dynamic scanner that scans `content/attack/` and `content/defense/` for declarative YAML files.
   - Calculates field geometry, cone placements, lines, and player positions from channel definitions.
   - Exports `drillsCatalog`, `attackDrills`, `defenseDrills`, and `loadDrills`.

2. **`build.js` (Assembly Engine)**:
   - Reads `src/drills.js` and component files from `src/components/`.
   - Validates JavaScript syntax with `acorn`.
   - Injects compiled data declarations and modular React components into `src/template.html`.
   - Emits the self-contained root deliverable `./warriors-coaching-drills.html`.

3. **`src/components/DrillView.js` (Generic Drill Playback Component)**:
   - Single reusable engine that replaces drill-specific components.
   - Inspects `drill.tiers`: if present, renders Bronze/Silver/Gold progression tabs with dynamic badge enlargement (44px active, 24px inactive). If absent (single-tier drills such as defense), hides tier tabs and shows cues directly.
   - Manages playback controls: Play/Pause infinite loop, step-by-step navigation, speed toggle (0.75x, 1x, 1.5x), and restart.
   - Computes step delays dynamically from each step's `dur` property and auto-advances.

4. **`src/components/PitchBoard.js` (`Ae`, `ke`) (SVG Tactical Renderer)**:
   - Renders field lines, cones, tackle pads, rugby ball with shadow, and player tokens with gradients and drop shadows.
   - Drives animated player transitions with CSS: `transform ${dur}ms cubic-bezier(.45,.05,.3,1), opacity ${dur}ms cubic-bezier(.45,.05,.3,1)`.
   - Renders comic-style speech bubbles (`shouts`) positioned dynamically above or below the talking player.
   - Automatically computes ball carrier position and ball offsets via `ke()`.

5. **`src/components/MedalBadge.js` (`De`, `Ie`)**:
   - Renders vector medal badges for Bronze, Silver, and Gold tiers.
   - Displays the coaching standards panel with skill cues.

6. **`src/components/App.js`**:
   - Header with category navigation (Attack, Defense, etc.) and drill catalog selector.

---

## 2. Pitch & Coordinate Grid Reference

### SVG ViewBox Geometry

```
(0, 0) ─────────────────────────────────────────────────────────────► +X
  │
  │    Attack View:  viewBox="2 4 60 54"   (X: 2..62,  Y: 4..58)
  │    Defense View: viewBox="4 4 84 56"   (X: 4..88,  Y: 4..60)
  │
  ▼
 +Y
```

| Coordinate Space | Attack Pitch (3-Lane / 4-Lane) | Defense Contact Pitch |
| :--- | :--- | :--- |
| **ViewBox** | `[2, 4, 60, 54]` | `[4, 4, 84, 56]` |
| **Grid Width** | 60 units (approx. 15m to 20m) | 84 units (approx. 20m + 15m fold zone) |
| **Top Finish / Contact Line** | `y = 12` (dashed gold line `#D4A017`) | `y = 18` (Pad Line `#D4A017`) |
| **Start / Mark Line** | `y = 44` (solid line `#A9BDB1`) | `y = 42` (Defensive Start Line) |
| **Queue Depth Lines** | `y = 49, 54, 59, 64, 69` | `y = 48` (Row 2), `y = 54` (Row 3) |
| **Channel X Spacing** | 3 lanes: `x = 16, 32, 48` (spacing: 16)<br>4 lanes: `x = 12, 24, 36, 48` (spacing: 12) | Contact lanes: `x = 16, 28, 40` (spacing: 12)<br>Fold lanes: `x = 52, 64, 76` (spacing: 12) |

### Team Orientation & Trajectories

#### 1. Attacking Direction: Up the Pitch
- **Runners advance from high Y towards low Y** (bottom to top of screen).
- Runners begin at `y = 44` (queue start line), advance through `y = 33 -> 22 -> 12`, cross the top cone line at `y = 12`, and fade out over `y = 5 -> 2`.
- **Runner Fadeout Formula**:
  $$\text{opacity}(y) = \begin{cases} 1 & \text{if } y \ge 12 \\ \max\left(0, \frac{y - 3}{9}\right) & \text{if } 3 < y < 12 \\ 0 \text{ (hidden)} & \text{if } y \le 3 \end{cases}$$

#### 2. Rugby Passing Trailing Rules
- In rugby law, the ball must travel **backwards or level** relative to the attacking direction.
- Since attack runs upward ($\Delta Y < 0$), a backwards pass requires:
  $$Y_{\text{receiver}} \ge Y_{\text{passer}}$$
- **Depth Stagger**: The receiver holds their run behind the passer so they catch the ball running at pace into space rather than receiving flat.
- **Hook Pass**: When the wide wing hits the top cone line (`y = 12`), the inside hook pass travels backwards to an oncoming middle runner (`y = 26`, where $26 > 12$).

#### 3. Defense Line Speed & Fold Direction
- Pad holders face downfield at `y = 18`.
- Defenders start at `y = 42`, explode forward on "up" to hit pads at `y = 20`.
- Defenders fold diagonally across the pitch from the contact zone (`x = 16, 28, 40`) to the fold channels (`x = 52, 64, 76`) on the start line (`y = 42`), keeping full width before advancing together.

---

## 3. Exact Data Schema

### TypeScript / JSDoc Schema Definition

```typescript
export interface DrillCatalog {
  attack: Drill[];
  defense: Drill[];
}

export interface Drill {
  id: string;                      // Unique slug (e.g. 'through-the-hands', 'basic-drift')
  name: string;                    // Human-readable title (e.g. 'Through the Hands')
  category: 'attack' | 'defense';  // Category key
  subtitle: string;                // 1-sentence drill description
  gridDimensions: string;          // e.g. '15m wide x 20m long grid'
  recommendedPlayers: string;      // e.g. '9 to 15 players in 3 continuous queues'
  equipment: string[];             // List of equipment items
  view?: [number, number, number, number]; // [minX, minY, width, height]

  lines: PitchLine[];
  cones: PitchCone[];
  players: PitchPlayer[];

  // Optional multi-tier configuration
  tiers?: Record<'bronze' | 'silver' | 'gold', DrillTier>;
  standards?: Record<string, CoachingStandard>;

  // Variations & Steps
  variations: DrillVariation[];

  // Coaching Material
  cues?: string[];
  remember: string[];
  coachQuestions: string[];
}

export interface PitchLine {
  y: number;
  label: string;
  kind: 'solid' | 'gain';          // 'gain' is dashed gold line
  end?: boolean;                   // true renders label on right end
}

export interface PitchCone {
  x: number;
  y: number;
  color: 'orange' | 'yellow' | 'red';
  label: string;
}

export interface PitchPlayer {
  id: string;                      // e.g. 'L1', 'M2', 'pad1', 's1_1'
  team: 'w' | 'next' | 'queue' | 'o'; // 'w': active green, 'next': light green, 'queue': grey, 'o': blue pad
  label: string;                   // Display tooltip / accessibility label
}

export interface DrillVariation {
  id: string;
  label: string;
  description: string;
  steps: DrillStep[];
}

export interface DrillStep {
  t: string;                       // Step title (e.g. "Step 1: 1st Left Runner Sets Off")
  d: string;                       // Narrative coaching explanation
  ball: string | [number, number]; // Player ID holding ball (e.g. 'L1') or raw [x, y], or ''
  dur: number;                     // Animation duration in ms (typically 950 - 1200)
  shouts?: ShoutBubble[];          // Speech bubbles rendered on board
  focusTip?: string;               // Tactical cue highlighted in step card
  pos: Record<string, [number, number]>; // Player positions { [playerId]: [x, y] }
}

export interface ShoutBubble {
  who: string;                     // Player ID shouting (e.g. 'M1', 's1_2')
  text: string;                    // Speech bubble text (e.g. 'Right', 'ready, ready', 'fold')
  dx?: number;                     // Optional horizontal offset
}
```

---

### Minimal Boilerplate Examples

#### Approach A: Declarative YAML (Recommended)

Save as `content/attack/my-attack-drill.yaml`:
```yaml
id: my-attack-drill
name: "2-on-1 Draw & Pass"
category: attack
summary: "Fix defender with square hips and release support runner in stride."

lanes:
  - id: L
    name: "Left"
    cones: { top: orange, queue: orange }
  - id: R
    name: "Right"
    cones: { top: yellow, queue: yellow }
queue_depth: 4

flow:
  - step: 1
    title: "Step 1: Carrier Attacks Space"
    action: start
    carrier: L1
    call: { who: R1, text: "Ball" }
    tip: "Attack the defender's outside shoulder."
    desc: "1st Left runner sets off attacking forward with two hands on the ball."

  - step: 2
    title: "Step 2: Draw & Release"
    action: pass
    from: L1
    to: R1
    call: { who: R1, text: "Yes" }
    tip: "Deliver the pass off the hip without twisting."
    desc: "Left runner fixes the defender and releases Right runner hitting space."

remember:
  - "SQUARE HIPS: Run straight at the cones to freeze defenders"
  - "TWO HANDS: Hold ball in two hands until the moment of the pass"

coach_questions:
  - "Did the carrier commit the defender before passing?"
  - "Was the pass delivered in front of the receiver's chest?"
```

#### Approach B: Declarative Defense YAML

Save as `content/defense/my-defense-drill.yaml`:
```yaml
id: my-defense-drill
name: "2-Man Chop & Jackal"
category: defense
subtitle: "Low chop tackle followed by immediate feet recovery and turnover clamp."
grid_description: "10m wide x 10m grid"
recommended_players: "6 lads + 2 pad holders"
equipment: ["2 Tackle Pads"]

contact_lanes:
  - id: left
    name: "Left"
    cones: { pad: orange, start: orange }
  - id: right
    name: "Right"
    cones: { pad: yellow, start: yellow }

fold_lanes:
  - id: fold1
    name: "Fold"
    cone: yellow

lines:
  pad_line: "PAD LINE"
  start_line: "DEFENSIVE LINE"

squads:
  pad_holders: { count: 2 }
  defenders:
    sets:
      - id: set1
        name: "1st Set"
      - id: set2
        name: "2nd Set"

flow:
  - step: 1
    title: "Setup: Defenders on Line"
    dur: 1000
    call: { who: "1st Set - Left", text: "ready" }
    positions:
      set1: line
      set2: row2

  - step: 2
    title: "1) Hit Pads Together"
    dur: 1100
    call: { who: "1st Set - Left", text: "up" }
    positions:
      set1: hit_pads
      set2: line

remember:
  - "CHOP LOW: Target below the hips"
  - "BOUNCE: Immediate recovery on feet"

coach_questions:
  - "Did defenders leave the mark together?"
  - "Was head placement safely behind the pads?"
```

#### Approach C: Direct `src/drills.js` Registration

If bypassing YAML, export directly from `src/drills.js`:
```javascript
const myCustomDrill = {
  id: 'my-custom-drill',
  name: 'My Custom Drill',
  category: 'attack',
  subtitle: 'Fast handling drill',
  gridDimensions: '15m x 15m',
  recommendedPlayers: '8 players',
  equipment: ['4 Cones', '1 Ball'],
  view: [2, 4, 60, 54],
  lines: [
    { y: 12, label: 'FINISH', kind: 'gain', end: true },
    { y: 44, label: 'START', kind: 'solid' }
  ],
  cones: [
    { x: 20, y: 12, color: 'orange', label: 'Top Left' },
    { x: 40, y: 12, color: 'orange', label: 'Top Right' },
    { x: 20, y: 44, color: 'yellow', label: 'Start Left' },
    { x: 40, y: 44, color: 'yellow', label: 'Start Right' }
  ],
  players: [
    { id: 'p1', team: 'w', label: 'Player 1' },
    { id: 'p2', team: 'next', label: 'Player 2' }
  ],
  variations: [{
    id: 'seq-1',
    label: 'Main Sequence',
    description: 'Drill sequence',
    steps: [
      {
        t: 'Step 1: Set Off',
        d: 'Player 1 attacks forward',
        ball: 'p1',
        dur: 1000,
        shouts: [{ who: 'p2', text: 'Pass' }],
        focusTip: 'Hands up',
        pos: { p1: [20, 30], p2: [40, 44] }
      }
    ]
  }],
  remember: ['Run straight'],
  coachQuestions: ['Did they catch in stride?']
};
```

---

## 4. Design System & Styling

### Palette Hex Codes

| Element | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Pitch Background** | `#F6F8F6` | Main board SVG canvas |
| **Pitch Outer Border** | `#C3CEC6` | Card casing around SVG |
| **Pitch Lines** | `#A9BDB1` | Standard pitch grid & start lines |
| **Gain / Finish Line** | `#D4A017` / `#8F6E00` | Dashed gain line text and strokes |
| **Primary Green** | `#1F7A52` | Warriors club primary green (buttons, badges) |
| **Dark Forest Green** | `#17603F` | Heading accents, active step numbers |
| **Deep Green / Ink** | `#12301F`, `#16202A` | Primary typography, borders, drop shadows |
| **Light Green Accent** | `#3FA374`, `#7FD9AB` | Gradients, badges, debrief question headings |
| **Pulse Mint** | `#4CC08A` | Live pulsing activity dot |
| **Speech Halo / Gold** | `#FFE14A` | Ball halo, speech bubble background |
| **Rugby Ball Seam** | `#1F7A52` | Ball longitudinal seam |
| **Rugby Ball Body** | `#FFF8E0` | Off-white ball fill |
| **Pad Blue (Primary)**| `#2C5AD0` | Tackle shield rect and pad holder base |
| **Pad Blue (Light)**  | `#5C82E6` | Pad holder top highlight gradient |
| **Pad Stroke**        | `#0D2660` | Dark border for pad holders |
| **Cone Orange**       | `#E86C20` / `#B34B00`| Channel edge cones |
| **Cone Yellow**       | `#F3C11B` | Center/middle channel cones |
| **Cone Red**          | `#DC3838` | Stop / contact mark cones |
| **Bronze Medal Tier** | `['#EDB27D', '#9C5B2B']` | Ink: `#7A4520` |
| **Silver Medal Tier** | `['#F4F6F8', '#99A2AB']` | Ink: `#59636C` |
| **Gold Medal Tier**   | `['#FFE793', '#C9961B']` | Ink: `#8A6408` |

### Typography Classes & Custom Fonts

- **Display & Headings**: `font-[Barlow_Condensed]`
  - Drill Titles: `font-[Barlow_Condensed] text-6xl sm:text-8xl font-black italic uppercase leading-[0.85] text-[#12301F]`
  - Step Titles: `font-[Barlow_Condensed] text-4xl sm:text-5xl font-extrabold uppercase leading-[0.95] text-[#12301F]`
  - Tab Labels: `font-[Barlow_Condensed] uppercase tracking-wider`
- **Speech Bubbles / Shouts**: `font-[Permanent_Marker]`
  - SVG shouts: `fontSize: 2.3*d, fill: '#12301F', className: 'font-[Permanent_Marker]'`
  - Step Card Shout Badges: `font-[Permanent_Marker] text-sm bg-[#FFE14A] text-[#12301F] px-2.5 py-0.5 rounded-full shadow-sm`
- **Body & Cues**: System Sans-Serif (`Inter`, `-apple-system`, `sans-serif`)
  - Narratives: `text-lg sm:text-xl leading-relaxed text-[#12301F]`
  - Focus Tips: `text-sm font-medium border-l-4 border-[#1F7A52] bg-[#F1F4F1] p-3 rounded-xl`

### Badge Pill Structures

- **Status / Level Pill**:
  ```html
  <div class="inline-flex items-center gap-2 rounded-full bg-[#12301F]/10 px-3 py-1 font-[Barlow_Condensed] text-sm font-bold uppercase tracking-wider text-[#17603F]">
    <svg>...</svg> Continuous Handling Drill #1 • <span class="font-black text-[#12301F] uppercase">Bronze Level</span>
  </div>
  ```

- **Live Activity Badge**:
  ```html
  <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-[#12301F]/15 shadow-xs text-sm font-bold font-[Barlow_Condensed] uppercase tracking-wider text-[#17603F]">
    <span class="h-2.5 w-2.5 rounded-full bg-[#4CC08A] animate-pulse"></span>
    Infinite Wave Queue Rotation
  </div>
  ```

- **Progression Tabs (Active Magnification Rule)**:
  - Active Tab: `text-3xl sm:text-4xl font-black text-[#12301F] scale-105 sm:scale-110 drop-shadow-xs` with `De(size: 44)`
  - Inactive Tab: `text-lg sm:text-xl font-bold text-[#3A4A40]/50 hover:text-[#12301F] scale-90 opacity-70` with `De(size: 24)`

---

## 5. Development Workflow & Git Guidelines

### Commands

| Command | Action | Output / Target |
| :--- | :--- | :--- |
| `npm run build` | Compiles YAML and bundles single HTML | Emits `./warriors-coaching-drills.html` and `dist/warriors.html` |
| `npm test` | Acorn AST + JSDOM verification suite | Validates DOM rendering, active badge sizes, 4-lane weave, and defense drill |
| `npm run serve` | Local preview HTTP server | Serves deliverable on `http://localhost:8080/warriors-coaching-drills.html` |

### Rules for Adding New Drills

1. **Declarative First**: Add drills as `.yaml` files in `content/attack/` or `content/defense/`. Do NOT write raw coordinates by hand.
2. **Channel-Based**: Specify `lanes` (for attack) or `contact_lanes` + `fold_lanes` (for defense). Let `src/compiler.js` generate coordinates.
3. **No Component Sprawl**: Never create a drill-specific React component (e.g. `NewDrill.js`). The single generic `src/components/DrillView.js` renders all drills automatically.
4. **Primary Deliverable Location**: The root file `./warriors-coaching-drills.html` is the primary artifact. Never move or rename it.

### Git Checkpoint & Rollback Guidelines

> [!CAUTION]
> **Strict Git Rule**: NEVER execute `git commit` without explicit instruction from the user. Even after passing tests, wait for approval.

- **Pre-Commit Verification Gate**:
  ```bash
  npm run build && npm test
  ```
  Only propose a commit if `=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100%) ===` is achieved.

- **Safe Inspection & Rollback Commands**:
  ```bash
  # Check current working tree
  git status
  git diff

  # Discard changes to a specific file
  git restore <path/to/file>

  # Discard all unstaged changes
  git restore .

  # Undo the most recent commit while keeping all changes in working directory
  git reset --soft HEAD~1

  # Hard reset to last safe commit (destructive)
  git reset --hard HEAD
  ```
