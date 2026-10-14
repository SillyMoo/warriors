const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

/**
 * Standard pitch coordinate calculations for 3-lane and 4-lane rugby drills.
 */
function compileThroughTheHands(doc) {
  const standards = {
    handling: {
      name: doc.name,
      drill: doc.summary,
      bronze: {
        t: doc.standards.bronze.title,
        cues: doc.standards.bronze.cues
      },
      silver: {
        t: doc.standards.silver.title,
        cues: doc.standards.silver.cues
      },
      gold: {
        t: doc.standards.gold.title,
        cues: doc.standards.gold.cues
      }
    }
  };

  const compiledTiers = {};

  for (const [tierKey, tier] of Object.entries(doc.tiers)) {
    const laneCount = tier.lanes.length;
    const spacing = laneCount === 3 ? 16 : 12;
    const startX = laneCount === 3 ? 16 : 12;

    const lanesWithX = tier.lanes.map((l, idx) => ({
      ...l,
      x: startX + idx * spacing
    }));

    // Cones
    const cones = [];
    lanesWithX.forEach((l, idx) => {
      cones.push({ x: l.x, y: 12, color: l.cones.top, label: `Top ${l.name}` });
    });
    lanesWithX.forEach((l, idx) => {
      cones.push({ x: l.x, y: 44, color: l.cones.queue, label: `Queue ${idx + 1} (${l.name})` });
    });

    // Lines
    const lines = [
      { y: 12, label: 'TOP CONES (FINISH LINE)', kind: 'gain', end: true },
      { y: 44, label: `START LINE (${laneCount} QUEUES)`, kind: 'solid' }
    ];

    // Players
    const players = [];
    lanesWithX.forEach(l => {
      for (let j = 1; j <= (tier.queue_depth || 6); j++) {
        players.push({
          id: `${l.id}${j}`,
          team: j === 1 ? 'w' : (j === 2 ? 'next' : 'queue'),
          label: `${l.name} ${j}`
        });
      }
    });

    // Positions mapping for 3-lane vs 4-lane flow
    const pos3Lane = [
      // Step 1
      {
        L1:[16,33],L2:[16,44],L3:[16,49],L4:[16,54],L5:[16,59],L6:[16,64],
        M1:[32,40],M2:[32,44],M3:[32,49],M4:[32,54],M5:[32,59],M6:[32,64],
        R1:[48,44],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 2
      {
        L1:[16,22],L2:[16,44],L3:[16,49],L4:[16,54],L5:[16,59],L6:[16,64],
        M1:[32,29],M2:[32,44],M3:[32,49],M4:[32,54],M5:[32,59],M6:[32,64],
        R1:[48,38],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 3
      {
        L1:[16,12],L2:[16,44],L3:[16,49],L4:[16,54],L5:[16,59],L6:[16,64],
        M1:[32,20],M2:[32,38],M3:[32,44],M4:[32,49],M5:[32,54],M6:[32,59],
        R1:[48,23],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 4
      {
        L1:[16,5],L2:[16,37],L3:[16,44],L4:[16,49],L5:[16,54],L6:[16,59],
        M1:[32,12],M2:[32,26],M3:[32,44],M4:[32,49],M5:[32,54],M6:[32,59],
        R1:[48,12],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 5
      {
        L1:[16,2],L2:[16,26],L3:[16,44],L4:[16,49],L5:[16,54],L6:[16,59],
        M1:[32,5],M2:[32,19],M3:[32,37],M4:[32,44],M5:[32,49],M6:[32,54],
        R1:[48,5],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 6
      {
        L1:[16,2],L2:[16,17],L3:[16,44],L4:[16,49],L5:[16,54],L6:[16,59],
        M1:[32,2],M2:[32,11],M3:[32,26],M4:[32,44],M5:[32,49],M6:[32,54],
        R1:[48,2],R2:[48,37],R3:[48,44],R4:[48,49],R5:[48,54],R6:[48,59]
      },
      // Step 7
      {
        L1:[16,2],L2:[16,11],L3:[16,44],L4:[16,49],L5:[16,54],L6:[16,59],
        M1:[32,2],M2:[32,5],M3:[32,19],M4:[32,37],M5:[32,44],M6:[32,49],
        R1:[48,2],R2:[48,23],R3:[48,44],R4:[48,49],R5:[48,54],R6:[48,59]
      },
      // Step 8
      {
        L1:[16,2],L2:[16,5],L3:[16,37],L4:[16,44],L5:[16,49],L6:[16,54],
        M1:[32,2],M2:[32,2],M3:[32,11],M4:[32,26],M5:[32,44],M6:[32,49],
        R1:[48,2],R2:[48,12],R3:[48,44],R4:[48,49],R5:[48,54],R6:[48,59]
      }
    ];

    const pos4Lane = [
      // Step 1
      {
        L1:[12,33],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],
        ML1:[24,38],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],
        MR1:[36,41],MR2:[36,44],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],
        R1:[48,44],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 2
      {
        L1:[12,23],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],
        ML1:[24,29],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],
        MR1:[36,36],MR2:[36,44],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],
        R1:[48,41],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 3
      {
        L1:[12,13],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],
        ML1:[24,20],ML2:[24,44],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],
        MR1:[36,27],MR2:[36,42],MR3:[36,49],MR4:[36,54],MR5:[36,59],MR6:[36,64],
        R1:[48,33],R2:[48,49],R3:[48,54],R4:[48,59],R5:[48,64],R6:[48,69]
      },
      // Step 4
      {
        L1:[12,5],L2:[12,44],L3:[12,49],L4:[12,54],L5:[12,59],L6:[12,64],
        ML1:[24,12],ML2:[24,41],ML3:[24,49],ML4:[24,54],ML5:[24,59],ML6:[24,64],
        MR1:[36,18],MR2:[36,35],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],
        R1:[48,20],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 5
      {
        L1:[12,2],L2:[12,41],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],
        ML1:[24,5],ML2:[24,34],ML3:[24,44],ML4:[24,49],ML5:[24,54],ML6:[24,59],
        MR1:[36,12],MR2:[36,26],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],
        R1:[48,12],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 6
      {
        L1:[12,2],L2:[12,33],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],
        ML1:[24,2],ML2:[24,25],ML3:[24,42],ML4:[24,49],ML5:[24,54],ML6:[24,59],
        MR1:[36,5],MR2:[36,18],MR3:[36,44],MR4:[36,49],MR5:[36,54],MR6:[36,59],
        R1:[48,5],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 7
      {
        L1:[12,2],L2:[12,22],L3:[12,44],L4:[12,49],L5:[12,54],L6:[12,59],
        ML1:[24,2],ML2:[24,14],ML3:[24,36],ML4:[24,44],ML5:[24,49],ML6:[24,54],
        MR1:[36,2],MR2:[36,12],MR3:[36,41],MR4:[36,49],MR5:[36,54],MR6:[36,59],
        R1:[48,2],R2:[48,44],R3:[48,49],R4:[48,54],R5:[48,59],R6:[48,64]
      },
      // Step 8
      {
        L1:[12,2],L2:[12,12],L3:[12,41],L4:[12,44],L5:[12,49],L6:[12,54],
        ML1:[24,2],ML2:[24,5],ML3:[24,27],ML4:[24,44],ML5:[24,49],ML6:[24,54],
        MR1:[36,2],MR2:[36,2],MR3:[36,35],MR4:[36,44],MR5:[36,49],MR6:[36,54],
        R1:[48,2],R2:[48,40],R3:[48,44],R4:[48,49],R5:[48,54],R6:[48,59]
      }
    ];

    const posPreset = laneCount === 4 ? pos4Lane : pos3Lane;

    // Ball path breadcrumbs
    const ballPath = laneCount === 4 ? [
      { label: 'Left', step: 0 },
      { label: '1st Mid-L', step: 1 },
      { label: '1st Mid-R', step: 2 },
      { label: '1st Right', step: 3 },
      { label: '2nd Mid-R', step: 4 },
      { label: '2nd Mid-L', step: 5 },
      { label: '2nd Left', step: 6 },
      { label: '3rd Mid-L ↺', step: 7 }
    ] : [
      { label: 'Left', step: 0 },
      { label: '1st Mid', step: 1 },
      { label: 'Right', step: 2 },
      { label: '2nd Mid', step: 3 },
      { label: 'Left', step: 4 },
      { label: '3rd Mid', step: 5 },
      { label: 'Right', step: 6 },
      { label: '4th Mid ↺', step: 7 }
    ];

    // Build steps
    const steps = tier.flow.map((step, idx) => {
      const ball = step.to || step.carrier;
      const shouts = step.call ? [{ who: step.call.who, text: step.call.text }] : [];
      const basePos = posPreset[idx] || {};
      const pos = { ...basePos, ...(step.pos_override || {}) };

      // Durations
      const dur = step.dur || (idx === 0 ? 950 : idx === 1 ? 1050 : idx === 7 ? 1200 : 1100);

      // Title
      let t = step.title;
      if (!t) {
        if (step.action === 'start') {
          t = `Step 1: 1st ${lanesWithX[0].name} Runner Sets Off`;
        } else if (step.action === 'hook') {
          t = `Step ${idx + 1}: ${idx}th Pass — ${step.from} → ${step.to} (Hook${idx === tier.flow.length - 1 ? ' - Continuous Loop' : ''})`;
        } else {
          t = `Step ${idx + 1}: ${idx}th Pass — ${step.from} → ${step.to}`;
        }
      }

      return {
        t,
        d: step.desc,
        ball,
        dur,
        shouts,
        focusTip: step.tip,
        pos
      };
    });

    compiledTiers[tierKey] = {
      id: `through-the-hands-${tierKey}`,
      name: doc.name,
      subtitle: tier.subtitle,
      category: doc.category,
      tier: tierKey,
      tierName: tier.name,
      view: [2, 4, 60, 54],
      gridDimensions: tier.grid_description,
      recommendedPlayers: tier.recommended_players,
      equipment: tier.equipment,
      lines,
      cones,
      players,
      ballPath,
      variations: [{
        id: `continuous-${laneCount}lane-weave`,
        label: `Continuous ${laneCount}-Lane Weave`,
        description: doc.summary,
        steps
      }],
      remember: tier.remember,
      coachQuestions: tier.coach_questions
    };
  }

  return { standards, tiers: compiledTiers };
}

function compileDefenseDrill(doc) {
  return {
    id: doc.id,
    name: doc.name,
    subtitle: doc.subtitle,
    category: doc.category,
    view: doc.view,
    gridDimensions: doc.grid_description,
    recommendedPlayers: doc.recommended_players,
    equipment: doc.equipment,
    lines: doc.lines,
    cones: doc.cones,
    players: doc.players,
    variations: [{
      id: `${doc.id}-sequence`,
      label: doc.name,
      description: doc.subtitle,
      steps: doc.steps.map(s => ({
        t: s.t,
        d: s.d,
        ball: s.ball,
        dur: s.dur,
        shouts: s.shouts,
        focusTip: s.focus_tip,
        pos: s.pos
      }))
    }],
    remember: doc.remember,
    coachQuestions: doc.coach_questions
  };
}

module.exports = {
  compileThroughTheHands,
  compileDefenseDrill
};
