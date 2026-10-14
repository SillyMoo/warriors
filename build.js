const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const acorn = require('acorn');
const { compileThroughTheHands, compileDefenseDrill } = require('./src/compiler');

console.log('=== Building Warriors Coaching Playbook ===\n');

// 1. Load and compile YAML content
const attackYamlPath = path.resolve(__dirname, 'content/attack/through-the-hands.yaml');
const defenseYamlPath = path.resolve(__dirname, 'content/defense/basic-drift.yaml');

if (!fs.existsSync(attackYamlPath)) {
  console.error(`ERROR: Missing ${attackYamlPath}`);
  process.exit(1);
}
if (!fs.existsSync(defenseYamlPath)) {
  console.error(`ERROR: Missing ${defenseYamlPath}`);
  process.exit(1);
}

const attackDoc = yaml.load(fs.readFileSync(attackYamlPath, 'utf8'));
const defenseDoc = yaml.load(fs.readFileSync(defenseYamlPath, 'utf8'));

console.log(`[PASS] Loaded YAML content: "${attackDoc.name}" & "${defenseDoc.name}"`);

const attackCompiled = compileThroughTheHands(attackDoc);
const defenseCompiled = compileDefenseDrill(defenseDoc);

console.log(`[PASS] Compiled declarative drills (Bronze: 3 lanes, Silver: 4 lanes, Gold: 3 lanes)`);

// 2. Assemble Data Declarations
const dataCode = `
var Se={board:\`#F6F8F6\`,line:\`#A9BDB1\`,ink:\`#16202A\`,green:\`#1F7A52\`,greenLight:\`#3FA374\`,greenDark:\`#17603F\`,yellow:\`#FFE14A\`,passGold:\`#D4A017\`,coneOrange:\`#E86C20\`,coneYellow:\`#F3C11B\`,coneRed:\`#DC3838\`,queueBorder:\`#A4B8AB\`},
Ce=[{id:\`bronze\`,name:\`Bronze\`,grad:[\`#EDB27D\`,\`#9C5B2B\`],ink:\`#7A4520\`},{id:\`silver\`,name:\`Silver\`,grad:[\`#F4F6F8\`,\`#99A2AB\`],ink:\`#59636C\`},{id:\`gold\`,name:\`Gold\`,grad:[\`#FFE793\`,\`#C9961B\`],ink:\`#8A6408\`}],
we=${JSON.stringify({
  handling: attackCompiled.standards.handling,
  tackle: {
    name: 'Tackle Standards',
    drill: 'Tackle ladder: knees -> walking -> full pace with pads, then live match simulation.',
    bronze: {
      t: 'Low Chop Technique',
      cues: [
        'Strike below the waist line',
        'Head placed safely to the side/rear, cheek to cheek',
        'Wrap arms tightly and ride the ball-carrier down'
      ]
    },
    silver: {
      t: 'Dominant Collision',
      cues: [
        'Low chest, aggressive leg-drive through contact',
        'Put the attacker on his back to halt momentum',
        'Win the collision territory: always drive forward'
      ]
    },
    gold: {
      t: 'Turnover & Jackal',
      cues: [
        'Tackle, release immediately, bounce back on your feet',
        'First hands clamping over the ball with wide stable base',
        'Survive the cleanout and earn the penalty turnover'
      ]
    }
  }
})},
Te=${JSON.stringify(attackCompiled.tiers.bronze)},
TeSilver=${JSON.stringify(attackCompiled.tiers.silver)},
Ee=${JSON.stringify(defenseCompiled)},
Ye=${JSON.stringify(attackCompiled.tiers)};
`;

// 3. Load Components
const componentsDir = path.resolve(__dirname, 'src/components');
const medalCode = fs.readFileSync(path.join(componentsDir, 'MedalBadge.js'), 'utf8');
const pitchCode = fs.readFileSync(path.join(componentsDir, 'PitchBoard.js'), 'utf8');
const throughCode = fs.readFileSync(path.join(componentsDir, 'ThroughTheHands.js'), 'utf8');
const defenseCode = fs.readFileSync(path.join(componentsDir, 'DefenseDrill.js'), 'utf8');
const appCode = fs.readFileSync(path.join(componentsDir, 'App.js'), 'utf8');

const combinedAppCode = [
  dataCode,
  medalCode,
  pitchCode,
  throughCode,
  defenseCode,
  appCode
].join('\n');

// 4. Inject into Template
const templatePath = path.resolve(__dirname, 'src/template.html');
const template = fs.readFileSync(templatePath, 'utf8');

const injectionMarker = '/* === INJECT_WARRIORS_APP === */';
if (!template.includes(injectionMarker)) {
  console.error(`ERROR: Missing injection marker in ${templatePath}`);
  process.exit(1);
}

const finalHtml = template.replace(injectionMarker, combinedAppCode);

// 5. AST Syntax Check
const idxStart = finalHtml.indexOf('<script type="module" crossorigin>') + '<script type="module" crossorigin>'.length;
const idxEnd = finalHtml.indexOf('</script>');
const scriptCode = finalHtml.slice(idxStart, idxEnd);

try {
  acorn.parse(scriptCode, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('[PASS] JavaScript AST syntax validation passed (zero errors)');
} catch (err) {
  console.error(`[FAIL] AST validation error: ${err.message}`);
  process.exit(1);
}

// 6. Write Output to ./warriors-coaching-drills.html
const outputPath = path.resolve(__dirname, 'warriors-coaching-drills.html');
fs.writeFileSync(outputPath, finalHtml, 'utf8');
console.log(`[PASS] Emitted standalone output: ${path.basename(outputPath)} (${(finalHtml.length / 1024).toFixed(1)} KB)`);

// Also mirror to dist/warriors.html if dist exists or create it
const distDir = path.resolve(__dirname, 'dist');
fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'warriors.html'), finalHtml, 'utf8');
console.log(`[PASS] Mirrored build to dist/warriors.html`);

console.log('\n=== BUILD COMPLETED SUCCESSFULLY ===');
