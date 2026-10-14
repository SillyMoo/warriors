const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const HTML_PATH = path.resolve(__dirname, '../warriors-coaching-drills.html');
let html = fs.readFileSync(HTML_PATH, 'utf8');

// TeSilver definition code
const teSilverCode = `,TeSilver={id:\`through-the-hands-silver\`,name:\`Through the Hands\`,subtitle:\`Continuous 4-lane handling weave: Left → Mid-Left → Mid-Right → Right and back again.\`,category:\`attack\`,tier:\`silver\`,tierName:\`Silver\`,view:[2,4,60,54],gridDimensions:\`20m wide x 20m long grid (5m spacing across 4 lanes)\`,recommendedPlayers:\`12 to 20 players in 4 continuous queues\`,equipment:[\`8 Cones (4 start cones, 4 top cones)\`,\`2 Rugby Balls in flow\`],lines:[{y:12,label:\`TOP CONES (FINISH LINE)\`,kind:\`gain\`,end:!0},{y:44,label:\`START LINE (4 QUEUES)\`,kind:\`solid\`}],cones:[{x:12,y:12,color:\`orange\`,label:\`Top Left\`},{x:24,y:12,color:\`yellow\`,label:\`Top Mid-Left\`},{x:36,y:12,color:\`yellow\`,label:\`Top Mid-Right\`},{x:48,y:12,color:\`orange\`,label:\`Top Right\`},{x:12,y:44,color:\`orange\`,label:\`Queue 1 (Left)\`},{x:24,y:44,color:\`yellow\`,label:\`Queue 2 (Mid-Left)\`},{x:36,y:44,color:\`yellow\`,label:\`Queue 3 (Mid-Right)\`},{x:48,y:44,color:\`orange\`,label:\`Queue 4 (Right)\`}],players:[{id:\`L1\`,team:\`w\`,label:\`Left 1\`},{id:\`L2\`,team:\`next\`,label:\`Left 2\`},{id:\`L3\`,team:\`queue\`,label:\`Left 3\`},{id:\`L4\`,team:\`queue\`,label:\`Left 4\`},{id:\`L5\`,team:\`queue\`,label:\`Left 5\`},{id:\`L6\`,team:\`queue\`,label:\`Left 6\`},{id:\`ML1\`,team:\`w\`,label:\`Mid-Left 1\`},{id:\`ML2\`,team:\`next\`,label:\`Mid-Left 2\`},{id:\`ML3\`,team:\`queue\`,label:\`Mid-Left 3\`},{id:\`ML4\`,team:\`queue\`,label:\`Mid-Left 4\`},{id:\`ML5\`,team:\`queue\`,label:\`Mid-Left 5\`},{id:\`ML6\`,team:\`queue\`,label:\`Mid-Left 6\`},{id:\`MR1\`,team:\`w\`,label:\`Mid-Right 1\`},{id:\`MR2\`,team:\`next\`,label:\`Mid-Right 2\`},{id:\`MR3\`,team:\`queue\`,label:\`Mid-Right 3\`},{id:\`MR4\`,team:\`queue\`,label:\`Mid-Right 4\`},{id:\`MR5\`,team:\`queue\`,label:\`Mid-Right 5\`},{id:\`MR6\`,team:\`queue\`,label:\`Mid-Right 6\`},{id:\`R1\`,team:\`w\`,label:\`Right 1\`},{id:\`R2\`,team:\`next\`,label:\`Right 2\`},{id:\`R3\`,team:\`queue\`,label:\`Right 3\`},{id:\`R4\`,team:\`queue\`,label:\`Right 4\`},{id:\`R5\`,team:\`queue\`,label:\`Right 5\`},{id:\`R6\`,team:\`queue\`,label:\`Right 6\`}],ballPath:[{label:\`Left\`,step:0},{label:\`1st Mid-L\`,step:1},{label:\`1st Mid-R\`,step:2},{label:\`1st Right\`,step:3},{label:\`2nd Mid-R\`,step:4},{label:\`2nd Mid-L\`,step:5},{label:\`2nd Left\`,step:6},{label:\`3rd Mid-L ↺\`,step:7}],variations:[{id:\`continuous-4lane-weave\`,label:\`Continuous 4-Lane Weave\`,description:\`Continuous 4-channel handling wave: Left → Mid-Left → Mid-Right → Right and back again. Players run straight through the top line and fade away as fresh players continuously file in at the bottom queues.\`,steps:[{t:\`Step 1: 1st Left Runner Sets Off\`,d:\`Ball starts on the LEFT. 1st Left runner sets off taking a few paces forward in two hands. 1st Mid-Left runner calls "Right" and delays slightly to keep attacking depth. Queue boys hold the line.\`,ball:\`L1\`,dur:950,shouts:[{who:\`ML1\`,text:\`Right\`}],focusTip:\`Only two calls: "Right" when you want the ball to come right to you, and "Left" when you want it to come left.\`,pos:{L1:[12,33],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],ML1:[24,38],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],MR1:[36,41],MR2:[36,44],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],R1:[48,44],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]}},{t:\`Step 2: 1st Pass — Left → 1st Mid-Left Runner\`,d:\`1st Left runner passes across the chest to 1st Mid-Left runner attacking in stride. 1st Mid-Right runner calls "Right" and launches from depth. 1st Left runner continues running straight forward toward the top line.\`,ball:\`ML1\`,dur:1050,shouts:[{who:\`MR1\`,text:\`Right\`}],focusTip:\`1st Mid-Left catches at speed. 1st Mid-Right demands the pass with early call "Right".\`,pos:{L1:[12,23],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],ML1:[24,29],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],MR1:[36,36],MR2:[36,44],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],R1:[48,41],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]}},{t:\`Step 3: 2nd Pass — 1st Mid-Left → 1st Mid-Right Runner\`,d:\`1st Mid-Left runner transfers across the chest to 1st Mid-Right runner attacking in stride. 1st Right runner calls "Right" and accelerates from depth into space. 1st Left runner nears the finish line.\`,ball:\`MR1\`,dur:1050,shouts:[{who:\`R1\`,text:\`Right\`}],focusTip:\`Pass across the chest in one fluid motion without breaking stride. Keep hips square.\`,pos:{L1:[12,13],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],ML1:[24,20],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],MR1:[36,27],MR2:[36,42],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],R1:[48,33],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]}},{t:\`Step 4: 3rd Pass — 1st Mid-Right → 1st Right Runner\`,d:\`1st Mid-Right runner passes wide to 1st Right runner hitting top speed on the right wing! 2nd Mid-Right runner calls "Left" as he launches from depth to receive the return hook. 1st Left runner crosses the top line.\`,ball:\`R1\`,dur:1100,shouts:[{who:\`MR2\`,text:\`Left\`}],focusTip:\`1st Right runner catches at top speed. 2nd Mid-Right demands the inside hook with "Left".\`,pos:{L1:[12,5],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],ML1:[24,12],ML2:[24,41],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],MR1:[36,18],MR2:[36,35],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],R1:[48,20],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]}},{t:\`Step 5: 4th Pass — 1st Right → 2nd Mid-Right Runner (Hook)\`,d:\`1st Right runner reaches the top cone and hooks a pass diagonally backwards to fresh 2nd Mid-Right runner in stride! 2nd Mid-Left calls "Left" as he prepares to attack from depth. 1st Left runner fades out.\`,ball:\`MR2\`,dur:1150,shouts:[{who:\`ML2\`,text:\`Left\`}],focusTip:\`The ball never goes back to a player who already had it. 2nd Mid-Right is a fresh runner!\`,pos:{L1:[12,2],L2:[12,41],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],ML1:[24,5],ML2:[24,34],ML3:[24,44],ML4:[24,49],ML5:[24,54],ML6:[24,59],MR1:[36,12],MR2:[36,26],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],R1:[48,12],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]}},{t:\`Step 6: 5th Pass — 2nd Mid-Right → 2nd Mid-Left Runner\`,d:\`2nd Mid-Right runner transfers backwards to 2nd Mid-Left runner hitting the pass in stride! 2nd Left runner calls "Left" as he attacks from depth on the wing. 1st wave runners run straight through the top line and fade away.\`,ball:\`ML2\`,dur:1100,shouts:[{who:\`L2\`,text:\`Left\`}],focusTip:\`2nd Mid-Left catches in stride and transfers to 2nd Left. Single touch per boy.\`,pos:{L1:[12,2],L2:[12,33],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],ML1:[24,2],ML2:[24,25],ML3:[24,42],ML4:[24,49],ML5:[24,54],ML6:[24,59],MR1:[36,5],MR2:[36,18],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],R1:[48,5],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]}},{t:\`Step 7: 6th Pass — 2nd Mid-Left → 2nd Left Runner\`,d:\`2nd Mid-Left runner passes wide to 2nd Left runner bursting into space! The ball has returned all the way across to the Left lane. 3rd Mid-Left runner calls "Right" from depth as fresh players file into the queues.\`,ball:\`L2\`,dur:1150,shouts:[{who:\`ML3\`,text:\`Right\`}],focusTip:\`Ball has traveled Left → Mid-Left → Mid-Right → Right and back again to Left!\`,pos:{L1:[12,2],L2:[12,22],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],ML1:[24,2],ML2:[24,14],ML3:[24,36],ML4:[24,44],ML5:[24,49],ML6:[24,54],MR1:[36,2],MR2:[36,12],MR3:[36,41],MR4:[36,49],MR5:[36,54],MR6:[36,59],R1:[48,2],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]}},{t:\`Step 8: 7th Pass — 2nd Left → 3rd Mid-Left Runner (Continuous Loop)\`,d:\`2nd Left runner reaches the top cone and hooks the pass to 3rd Mid-Left runner in stride! 3rd Mid-Right calls "Right" as the wave weaves back across to the right in an infinite continuous cycle.\`,ball:\`ML3\`,dur:1200,shouts:[{who:\`MR3\`,text:\`Right\`}],focusTip:\`The sequence repeats infinitely: Left → Mid-Left → Mid-Right → Right and back again!\`,pos:{L1:[12,2],L2:[12,12],L3:[12,41],L4:[12,44],L5:[12,49],L6:[12,54],ML1:[24,2],ML2:[24,5],ML3:[24,27],ML4:[24,44],ML5:[24,49],ML6:[24,54],MR1:[36,2],MR2:[36,2],MR3:[36,35],MR4:[36,44],MR5:[36,49],MR6:[36,54],R1:[48,2],R2:[48,40],R3:[48,44],R4:[48,49],R5:[48,54],R6:[48,59]}}]}],remember:[\`4 LANES IN HARMONY: Left → Mid-Left → Mid-Right → Right and back again across 4 continuous queues\`,\`TWO CALLS ONLY: "Left" (demanding pass left to you) and "Right" (demanding pass right to you)\`,\`RUN STRAIGHT THROUGH: Run straight through your channel cones — hips square to end line, do not drift or crab sideways\`,\`DEPTH STAGGER: No boy leaves the mark until the carrier ahead has taken paces into space\`,\`SINGLE-TOUCH FLOW: Catch and transfer across the body in one fluid stride without slowing down\`],coachQuestions:[\`Did the 4 runners maintain square hips in their respective lanes across the full 20m grid width?\`,\`Did the wing hook the pass cleanly to a fresh incoming depth runner at the turn?\`,\`Were passes caught out in front of the chest in stride without any bobbles or backwards checks?\`]}`;

// 1. Insert TeSilver right before ,Ee={id:`basic-drift`
const targetEe = ",Ee={id:`basic-drift`";
if (!html.includes(targetEe)) {
  console.error("Could not find targetEe");
  process.exit(1);
}
html = html.replace(targetEe, teSilverCode + targetEe);

// 2. Update fadeout check in Ae
const targetFadeout = "let r=1;if(e.id===`through-the-hands`)";
const replaceFadeout = "let r=1;if(e.id.startsWith(`through-the-hands`))";
if (!html.includes(targetFadeout)) {
  console.error("Could not find targetFadeout");
  process.exit(1);
}
html = html.replace(targetFadeout, replaceFadeout);

// 3. Update Ye definition to use TeSilver and include ballPath for Bronze & Gold
const targetYe = "silver:{...Te,id:`through-the-hands-silver`,tier:`silver`,tierName:`Silver`}";
const replaceYe = "silver:{...TeSilver,id:`through-the-hands-silver`,tier:`silver`,tierName:`Silver`}";
if (!html.includes(targetYe)) {
  console.error("Could not find targetYe");
  process.exit(1);
}
html = html.replace(targetYe, replaceYe);

const targetBronze = "bronze:{...Te,id:`through-the-hands-bronze`,tier:`bronze`,tierName:`Bronze`}";
const replaceBronze = "bronze:{...Te,id:`through-the-hands-bronze`,tier:`bronze`,tierName:`Bronze`,ballPath:[{label:`Left`,step:0},{label:`1st Mid`,step:1},{label:`Right`,step:2},{label:`2nd Mid`,step:3},{label:`Left`,step:4},{label:`3rd Mid`,step:5},{label:`Right`,step:6},{label:`4th Mid ↺`,step:7}]}";
html = html.replace(targetBronze, replaceBronze);

const targetGold = "gold:{...Te,id:`through-the-hands-gold`,tier:`gold`,tierName:`Gold`}";
const replaceGold = "gold:{...Te,id:`through-the-hands-gold`,tier:`gold`,tierName:`Gold`,ballPath:[{label:`Left`,step:0},{label:`1st Mid`,step:1},{label:`Right`,step:2},{label:`2nd Mid`,step:3},{label:`Left`,step:4},{label:`3rd Mid`,step:5},{label:`Right`,step:6},{label:`4th Mid ↺`,step:7}]}";
html = html.replace(targetGold, replaceGold);

// 4. Update Ball Path breadcrumb in JSX
const targetBallPath = "[{label:`Left`,step:0},{label:`1st Mid`,step:1},{label:`Right`,step:2},{label:`2nd Mid`,step:3},{label:`Left`,step:4},{label:`3rd Mid`,step:5},{label:`Right`,step:6},{label:`4th Mid ↺`,step:7}].map((e,t)=>";
const replaceBallPath = "(e.ballPath||[{label:`Left`,step:0},{label:`1st Mid`,step:1},{label:`Right`,step:2},{label:`2nd Mid`,step:3},{label:`Left`,step:4},{label:`3rd Mid`,step:5},{label:`Right`,step:6},{label:`4th Mid ↺`,step:7}]).map((e,t)=>";
if (!html.includes(targetBallPath)) {
  console.error("Could not find targetBallPath");
  process.exit(1);
}
html = html.replace(targetBallPath, replaceBallPath);

// 5. Verify script with Acorn AST
const idxStart = html.indexOf('<script type="module" crossorigin>') + '<script type="module" crossorigin>'.length;
const idxEnd = html.indexOf('</script>');
const scriptCode = html.slice(idxStart, idxEnd);

try {
  acorn.parse(scriptCode, { ecmaVersion: 'latest', sourceType: 'module' });
  console.log('[PASS] Syntax check passed (zero errors)');
} catch (err) {
  console.error(`[FAIL] Syntax error: ${err.message}`);
  process.exit(1);
}

// Write updated HTML
fs.writeFileSync(HTML_PATH, html, 'utf8');
console.log(`[PASS] Successfully updated ${path.basename(HTML_PATH)}!`);
