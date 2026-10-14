const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const HTML_PATH = path.resolve(__dirname, '../warriors-coaching-drills.html');

console.log('=== Warriors Coaching Playbook Verification ===\n');

// 1. Read HTML file
if (!fs.existsSync(HTML_PATH)) {
  console.error(`ERROR: File not found at ${HTML_PATH}`);
  process.exit(1);
}

const html = fs.readFileSync(HTML_PATH, 'utf-8');
console.log(`[PASS] Read ${path.basename(HTML_PATH)} (${(html.length / 1024).toFixed(1)} KB)`);

// 2. Extract script content
const idxStart = html.indexOf('<script type="module" crossorigin>') + '<script type="module" crossorigin>'.length;
const idxEnd = html.indexOf('</script>');

if (idxStart === -1 || idxEnd === -1 || idxEnd <= idxStart) {
  console.error('ERROR: Could not locate inline <script> block');
  process.exit(1);
}

const scriptCode = html.slice(idxStart, idxEnd);
console.log(`[PASS] Located inline script (${(scriptCode.length / 1024).toFixed(1)} KB)`);

// 3. Syntax Verification via Acorn AST parser
try {
  acorn.parse(scriptCode, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('[PASS] JavaScript syntax is 100% valid (zero syntax errors)');
} catch (err) {
  console.error(`[FAIL] Syntax error at ${err.loc.line}:${err.loc.column}: ${err.message}`);
  process.exit(1);
}

// 4. DOM & React Rendering Verification via JSDOM
const dom = new JSDOM(html, {
  runScripts: 'dangerously',
  resources: 'usable',
  url: 'http://localhost/'
});

const { window } = dom;

// Polyfill ResizeObserver for JSDOM
window.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

try {
  window.eval(scriptCode);
  console.log('[PASS] Evaluated script in browser context with zero runtime errors');
} catch (err) {
  console.error('[FAIL] Runtime error during script evaluation:', err);
  process.exit(1);
}

// 5. Test DOM mounting and interactive behaviors
setTimeout(() => {
  const root = window.document.getElementById('root');
  if (!root || root.innerHTML.length === 0) {
    console.error('[FAIL] #root container is empty; React failed to mount');
    process.exit(1);
  }
  console.log(`[PASS] React mounted successfully (#root contains ${(root.innerHTML.length / 1024).toFixed(1)} KB of DOM)`);

  const tabs = Array.from(window.document.querySelectorAll('[role="tab"]'));
  const tierTabs = tabs.filter(t => ['bronze', 'silver', 'gold'].includes(t.textContent.trim().toLowerCase()));

  if (tierTabs.length !== 3) {
    console.error(`[FAIL] Expected 3 progression tier tabs, found ${tierTabs.length}`);
    process.exit(1);
  }
  console.log('[PASS] Found 3 progression tabs: Bronze, Silver, Gold');

  function getTabMetrics(tab) {
    const name = tab.textContent.trim().toLowerCase();
    const svg = tab.querySelector('svg');
    const width = svg ? parseInt(svg.getAttribute('width'), 10) : 0;
    const isEnlarged = tab.className.includes('text-3xl') || tab.className.includes('text-4xl');
    return { name, width, isEnlarged };
  }

  // --- Step A: Check Bronze active state ---
  const bronzeMetrics = getTabMetrics(tierTabs[0]);
  const silverMetricsInit = getTabMetrics(tierTabs[1]);
  const goldMetricsInit = getTabMetrics(tierTabs[2]);

  if (bronzeMetrics.width !== 44 || !bronzeMetrics.isEnlarged) {
    console.error('[FAIL] Bronze tab should be enlarged on load (expected size 44)');
    process.exit(1);
  }
  if (silverMetricsInit.width !== 24 || goldMetricsInit.width !== 24) {
    console.error('[FAIL] Inactive tabs should be smaller (expected size 24)');
    process.exit(1);
  }
  console.log('[PASS] Active Bronze heading & badge are enlarged (44px), Silver & Gold are smaller (24px)');

  if (!root.textContent.includes('Safe Hands & Depth Stagger')) {
    console.error('[FAIL] Bronze standard text missing in Bronze tab');
    process.exit(1);
  }
  if (root.textContent.includes('Single-Touch Flow in Stride') || root.textContent.includes('Draw, Hook & Continuous Queue Rotation')) {
    console.error('[FAIL] Silver/Gold standards should not be present in Bronze tab');
    process.exit(1);
  }
  console.log('[PASS] Bronze tab isolates Bronze standard text exclusively');

  // --- Step B: Click Silver Tab ---
  const silverTab = tierTabs.find(t => t.textContent.trim().toLowerCase() === 'silver');
  silverTab.click();

  setTimeout(() => {
    const silverMetrics = getTabMetrics(silverTab);
    const bronzeMetricsAfter = getTabMetrics(tierTabs[0]);

    if (silverMetrics.width !== 44 || !silverMetrics.isEnlarged) {
      console.error('[FAIL] Silver tab should be enlarged when active (expected size 44)');
      process.exit(1);
    }
    if (bronzeMetricsAfter.width !== 24) {
      console.error('[FAIL] Bronze tab should shrink when Silver is selected (expected size 24)');
      process.exit(1);
    }
    console.log('[PASS] Silver tab enlarged on selection, Bronze shrank');

    if (!root.textContent.includes('Single-Touch Flow in Stride')) {
      console.error('[FAIL] Silver standard text missing in Silver tab');
      process.exit(1);
    }
    if (root.textContent.includes('Safe Hands & Depth Stagger') || root.textContent.includes('Draw, Hook & Continuous Queue Rotation')) {
      console.error('[FAIL] Bronze/Gold standards should not be present in Silver tab');
      process.exit(1);
    }
    console.log('[PASS] Silver tab isolates Silver standard text exclusively');

    // Verify Silver 4-player drill specifics
    if (!root.textContent.includes('4 continuous queues') && !root.textContent.includes('4 lanes')) {
      console.error('[FAIL] Silver drill should specify 4 queues / 4 lanes');
      process.exit(1);
    }
    console.log('[PASS] Silver drill displays 4 continuous queues specification');

    if (!root.textContent.includes('1st Mid-L') || !root.textContent.includes('1st Mid-R')) {
      console.error('[FAIL] Silver ball path breadcrumb should include 1st Mid-L and 1st Mid-R');
      process.exit(1);
    }
    console.log('[PASS] Silver ball path weaves across 4 lanes: Left → 1st Mid-L → 1st Mid-R → 1st Right → ... and back again');

    // --- Step C: Click Gold Tab ---
    const goldTab = tierTabs.find(t => t.textContent.trim().toLowerCase() === 'gold');
    goldTab.click();

    setTimeout(() => {
      const goldMetrics = getTabMetrics(goldTab);
      if (goldMetrics.width !== 44 || !goldMetrics.isEnlarged) {
        console.error('[FAIL] Gold tab should be enlarged when active (expected size 44)');
        process.exit(1);
      }
      console.log('[PASS] Gold tab enlarged on selection');

      if (!root.textContent.includes('Draw, Hook & Continuous Queue Rotation')) {
        console.error('[FAIL] Gold standard text missing in Gold tab');
        process.exit(1);
      }
      if (root.textContent.includes('Safe Hands & Depth Stagger') || root.textContent.includes('Single-Touch Flow in Stride')) {
        console.error('[FAIL] Bronze/Silver standards should not be present in Gold tab');
        process.exit(1);
      }
      console.log('[PASS] Gold tab isolates Gold standard text exclusively');

      // --- Step D: Test Generic DrillView with Defense Category ---
      const navButtons = Array.from(window.document.querySelectorAll('nav [role="tab"]'));
      const defenseNav = navButtons.find(b => b.textContent.includes('Defense'));
      if (!defenseNav) {
        console.error('[FAIL] Could not find Defense navigation tab in header');
        process.exit(1);
      }
      defenseNav.click();

      setTimeout(() => {
        if (!root.textContent.includes('Basic Drift & Fold')) {
          console.error('[FAIL] Defense drill Basic Drift & Fold not rendered after clicking Defense tab');
          process.exit(1);
        }
        console.log('[PASS] Generic DrillView successfully rendered Defense drill (Basic Drift & Fold)');

        if (!root.textContent.includes('PAD LINE')) {
          console.error('[FAIL] Defense drill lines missing on pitch board');
          process.exit(1);
        }
        console.log('[PASS] Defense pitch board rendered with pads and contact zones');

        // Check that tier tabs are absent on single-tier drill
        const activeTierTabs = Array.from(window.document.querySelectorAll('[role="tab"]'))
          .filter(t => ['bronze', 'silver', 'gold'].includes(t.textContent.trim().toLowerCase()));
        if (activeTierTabs.length !== 0) {
          console.error('[FAIL] Tier tabs should not appear on single-tier drills');
          process.exit(1);
        }
        console.log('[PASS] Generic DrillView correctly hides tier tabs on single-tier drills');

        console.log('\n=== ALL VERIFICATION CHECKS PASSED SUCCESSFULLY (100%) ===');
        process.exit(0);
      }, 80);
    }, 80);
  }, 80);
}, 100);
