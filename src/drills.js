const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { compileThroughTheHands, compileDefenseDrill } = require('./compiler');

/**
 * Dynamic Drill Loader
 * Scans a directory for YAML drill definitions and compiles them into
 * standard drill objects for the playback engine.
 */
function loadDrills(dirPath, categoryDefault) {
  if (!fs.existsSync(dirPath)) return [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  return files.map(file => {
    const fullPath = path.join(dirPath, file);
    const doc = yaml.load(fs.readFileSync(fullPath, 'utf8'));
    if (doc.tiers) {
      const compiled = compileThroughTheHands(doc);
      return {
        id: doc.id,
        name: doc.name,
        category: doc.category || categoryDefault,
        summary: doc.summary,
        tiers: compiled.tiers,
        standards: compiled.standards
      };
    } else {
      return compileDefenseDrill(doc);
    }
  });
}

const attackDir = path.resolve(__dirname, '../content/attack');
const defenseDir = path.resolve(__dirname, '../content/defense');

const attackDrills = loadDrills(attackDir, 'attack');
const defenseDrills = loadDrills(defenseDir, 'defense');

const drillsCatalog = {
  attack: attackDrills,
  defense: defenseDrills
};

module.exports = {
  loadDrills,
  attackDrills,
  defenseDrills,
  drillsCatalog
};
