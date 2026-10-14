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
        const ordinal = (n) => {
          const s = ['th', 'st', 'nd', 'rd'];
          const v = n % 100;
          return n + (s[(v - 20) % 10] || s[v] || s[0]);
        };
        const passOrd = ordinal(idx);
        const formatParticipant = (code) => {
          if (!code) return '';
          const laneMatch = code.match(/^([A-Za-z]+)(\d*)$/);
          if (laneMatch) {
            const laneId = laneMatch[1];
            const num = laneMatch[2];
            const laneObj = lanesWithX.find(l => l.id === laneId);
            const laneName = laneObj ? laneObj.name : laneId;
            return num ? `${ordinal(parseInt(num, 10))} ${laneName}` : laneName;
          }
          return code;
        };
        if (step.action === 'start') {
          t = `Step 1: 1st ${lanesWithX[0].name} Runner Sets Off`;
        } else if (step.action === 'hook') {
          t = `Step ${idx + 1}: ${passOrd} Pass — ${formatParticipant(step.from)} → ${formatParticipant(step.to)} (Hook${idx === tier.flow.length - 1 ? ' - Continuous Loop' : ''})`;
        } else {
          t = `Step ${idx + 1}: ${passOrd} Pass — ${formatParticipant(step.from)} → ${formatParticipant(step.to)}`;
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
  const spacing = doc.spacing || 12;
  const startX = doc.startX || 16;

  // Contact lanes & fold lanes
  const rawContact = doc.contact_lanes || doc.lanes || [];
  const contactLanes = rawContact.map((l, idx) => ({
    ...l,
    x: l.x !== undefined ? l.x : (startX + idx * spacing)
  }));

  const rawFold = doc.fold_lanes || [];
  const foldLanes = rawFold.map((l, idx) => ({
    ...l,
    x: l.x !== undefined ? l.x : (startX + (contactLanes.length + idx) * spacing)
  }));

  // Lines
  let lines = doc.lines;
  if (!Array.isArray(lines)) {
    const padLineConf = doc.lines?.pad_line || doc.lines?.contact || "PAD LINE (CONTACT ZONE)";
    const startLineConf = doc.lines?.start_line || doc.lines?.start || "DEFENSIVE START LINE";
    lines = [
      {
        y: 18,
        label: typeof padLineConf === 'string' ? padLineConf : (padLineConf.label || "PAD LINE (CONTACT ZONE)"),
        kind: 'gain',
        end: true
      },
      {
        y: 42,
        label: typeof startLineConf === 'string' ? startLineConf : (startLineConf.label || "DEFENSIVE START LINE"),
        kind: 'solid'
      }
    ];
  }

  // Cones
  let cones = doc.cones;
  if (!Array.isArray(cones)) {
    cones = [];
    contactLanes.forEach((l, idx) => {
      const padColor = l.cones?.pad || l.pad || 'orange';
      const startColor = l.cones?.start || l.start || 'orange';
      cones.push({ x: l.x, y: 18, color: padColor, label: `Pad ${idx + 1}` });
      cones.push({ x: l.x, y: 42, color: startColor, label: `Start ${idx + 1}` });
    });
    foldLanes.forEach((l, idx) => {
      const foldColor = l.cones?.fold || l.cones?.line || l.cone || 'yellow';
      cones.push({ x: l.x, y: 42, color: foldColor, label: `Fold ${idx + 1}` });
    });
  }

  // Players
  let players = doc.players;
  if (!Array.isArray(players)) {
    players = [];
    // Pad holders
    contactLanes.forEach((l, idx) => {
      players.push({
        id: `pad${idx + 1}`,
        team: 'o',
        label: `Pad Holder ${l.name}`
      });
    });

    // Defender sets
    const sets = doc.squads?.defenders?.sets || doc.defenders?.sets || doc.squads?.sets || [
      { id: 'set1', name: '1st Set' },
      { id: 'set2', name: '2nd Set' },
      { id: 'set3', name: '3rd Set' }
    ];

    sets.forEach((s, sIdx) => {
      const team = sIdx === 0 ? 'w' : (sIdx === 1 ? 'next' : 'queue');
      contactLanes.forEach((l, lIdx) => {
        players.push({
          id: `s${sIdx + 1}_${lIdx + 1}`,
          team,
          label: `${s.name || s.label || `Set ${sIdx + 1}`} - ${l.name}`
        });
      });
    });
  }

  // View
  const view = doc.view || [4, 4, 84, 56];

  // Helper to map friendly player name / id to internal id
  const playerNameToId = {};
  players.forEach(p => {
    playerNameToId[p.id.toLowerCase()] = p.id;
    playerNameToId[p.label.toLowerCase()] = p.id;
  });
  playerNameToId['set1_middle'] = 's1_2';
  playerNameToId['set1.middle'] = 's1_2';
  playerNameToId['set2_middle'] = 's2_2';
  playerNameToId['set2.middle'] = 's2_2';
  playerNameToId['set3_middle'] = 's3_2';
  playerNameToId['set3.middle'] = 's3_2';

  const resolvePlayerId = (who) => {
    if (!who) return who;
    return playerNameToId[who.toLowerCase()] || who;
  };

  // Helper to get positions for a set given a state
  const getSetCoords = (sIdx, state) => {
    const coords = {};
    const pPrefix = `s${sIdx + 1}`;
    switch (state) {
      case 'line':
      case 'start_line':
      case 'on_line':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 42];
        });
        break;
      case 'hit_pads':
      case 'contact':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 20];
        });
        break;
      case 'hold_pads':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 19];
        });
        break;
      case 'row2':
      case 'row_2':
      case 'queue_front':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 48];
        });
        break;
      case 'row3':
      case 'row_3':
      case 'queue_back':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 54];
        });
        break;
      case 'fold':
      case 'folded':
      case 'fold_line':
        foldLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 42];
        });
        break;
      case 'fold_advance':
      case 'line_speed':
        foldLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 22];
        });
        break;
      case 'creep':
      case 'ready':
      case 'edge':
        contactLanes.forEach((l, lIdx) => {
          coords[`${pPrefix}_${lIdx + 1}`] = [l.x, 44];
        });
        break;
      default:
        break;
    }
    return coords;
  };

  // Build steps
  const rawSteps = doc.flow || doc.steps || [];
  const compiledSteps = rawSteps.map(s => {
    const t = s.title || s.t;
    const d = s.desc || s.d;
    const ball = s.ball || "";
    const dur = s.dur || 1100;
    const focusTip = s.tip || s.focus_tip || s.focusTip;

    let shouts = [];
    if (s.call) {
      shouts = [{ who: resolvePlayerId(s.call.who), text: s.call.text }];
    } else if (s.shouts) {
      shouts = s.shouts.map(sh => ({ who: resolvePlayerId(sh.who), text: sh.text }));
    }

    let pos = {};
    if (s.pos) {
      pos = { ...s.pos };
    } else {
      contactLanes.forEach((l, idx) => {
        pos[`pad${idx + 1}`] = [l.x, 18];
      });

      if (s.positions) {
        Object.entries(s.positions).forEach(([setName, state]) => {
          let sIdx = -1;
          if (setName === 'set1' || setName === '1st Set') sIdx = 0;
          else if (setName === 'set2' || setName === '2nd Set') sIdx = 1;
          else if (setName === 'set3' || setName === '3rd Set') sIdx = 2;
          else {
            const m = setName.match(/(\d+)/);
            if (m) sIdx = parseInt(m[1], 10) - 1;
          }

          if (sIdx >= 0) {
            const setCoords = getSetCoords(sIdx, state);
            Object.assign(pos, setCoords);
          }
        });
      }

      if (s.pos_override) {
        Object.assign(pos, s.pos_override);
      }
    }

    return {
      t,
      d,
      ball,
      dur,
      shouts,
      focusTip,
      pos
    };
  });

  return {
    id: doc.id,
    name: doc.name,
    subtitle: doc.subtitle,
    category: doc.category,
    view,
    gridDimensions: doc.grid_description,
    recommendedPlayers: doc.recommended_players,
    equipment: doc.equipment,
    lines,
    cones,
    players,
    variations: [{
      id: `${doc.id}-sequence`,
      label: doc.name,
      description: doc.subtitle,
      steps: compiledSteps
    }],
    cues: doc.cues || [],
    remember: doc.remember || [],
    coachQuestions: doc.coach_questions || []
  };
}

module.exports = {
  compileThroughTheHands,
  compileDefenseDrill
};
