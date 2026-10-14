# Warriors Coaching Drills - Modular Build Pipeline

This directory and root tooling manage the **Reading Rugby Football Club - Warriors Coaching Playbook**.

## Architecture Overview

The codebase is organized into a modular build pipeline that produces a single, self-contained HTML file:

```text
├── content/
│   ├── attack/through-the-hands.yaml   # Declarative coach-friendly drill YAML (Bronze, Silver, Gold)
│   └── defense/basic-drift.yaml        # Defense drift & fold drill YAML
├── src/
│   ├── template.html                   # HTML shell with Tailwind CSS, fonts, and root container
│   ├── compiler.js                     # Pitch compiler translating declarative YAML into coordinates
│   └── components/
│       ├── App.js                      # Main playbook header, tabs (Attack/Defense), and footer
│       ├── ThroughTheHands.js          # Interactive handling drill view with progression tabs
│       ├── DefenseDrill.js             # Defense drift & fold interactive view
│       ├── PitchBoard.js               # SVG pitch renderer with runner fadeout and shouts
│       └── MedalBadge.js               # Medal SVG badge and standards display panel
├── build.js                            # Compiler and bundler script
├── package.json                        # Build and test scripts
├── scripts/
│   ├── verify.js                       # Acorn AST & JSDOM test suite
│   └── serve.js                        # Local preview server
├── warriors-coaching-drills.html       # Primary standalone deliverable
└── dist/warriors.html                  # Mirrored deliverable
```

## Coach-Friendly YAML Syntax

Drills are defined without raw coordinates:
- **Lanes**: Specify `id`, `name`, and cone colors (`top`, `queue`).
- **Flow**: Define steps by rugby actions (`start`, `pass`, `hook`):
  ```yaml
  - step: 2
    action: pass
    from: L1
    to: ML1
    call: { who: MR1, text: "Right" }
    desc: "1st Left runner passes across chest to 1st Mid-Left attacking in stride."
  ```
The compiler calculates channel corridors, cone coordinates, runner acceleration from depth, and runner fadeout when crossing the top line.

## Commands

### 1. Build
Compiles all YAML drills and components into `./warriors-coaching-drills.html` (and mirrors to `dist/warriors.html`):
```bash
npm run build
```

### 2. Test & Verification
Runs the automated verification suite using AST parsing and JSDOM:
```bash
npm test
```

### 3. Local Preview Server
Serves the playbook on port 8080:
```bash
npm run serve
# Available at http://localhost:8080/warriors-coaching-drills.html
```
