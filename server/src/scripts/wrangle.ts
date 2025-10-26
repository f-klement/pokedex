// server/src/scripts/wrangle.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { writeToPath } from '@fast-csv/format';

const dataDir = path.join(__dirname, '..', '..', 'data');
const outputDir = path.join(dataDir, 'processed');

const coreFile = path.join(dataDir, 'pokemon_core_dataset.csv');
const evoFile = path.join(dataDir, 'pokemon_evolution_long.csv');
const movesFile = path.join(dataDir, 'pokemon_moves_height_weight.csv');

// --- Helper Functions ---

function readCSV<T>(filePath: string): Promise<T[]> {
  const results: T[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

function writeCSV(filePath: string, data: any[], headers: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    writeToPath(filePath, data, { headers, writeHeaders: true })
      .on('error', err => reject(err))
      .on('finish', () => resolve());
  });
}

/**
 * Trims whitespace from a string, handling null/undefined.
 * Returns null if the value is null, undefined, or an empty/whitespace-only string.
 *
 * This function also explicitly replaces non-breaking space characters (\xa0)
 * which are not handled by the default .trim() method.
 */
function trimStr(value: string | null | undefined): string | null {
  if (!value) { // Catches null, undefined, ""
    return null;
  }
  
  // 1. Replace all non-breaking spaces (\xa0) with a regular space.
  // 2. Then, trim standard whitespace (spaces, tabs, newlines) from the ends.
  const cleaned = value
    .replace(/\xa0/g, ' ')
    .trim();
  
  return cleaned === '' ? null : cleaned; // Catches " ", "", " \xa0 ", etc.
}

/**
 * Cleans and parses a numeric string (e.g., "45", " 45 ").
 * Returns null if invalid or empty.
 */
function parseNum(num: string | null | undefined): number | null {
  const cleanNum = trimStr(num);
  if (cleanNum === null) return null;
  
  const parsed = parseInt(cleanNum, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Cleans and parses a numeric ID string (e.g., "#0001" or "1").
 * Returns null if invalid or empty.
 */
function parseId(id: string | null | undefined): number | null {
  const cleanId = trimStr(id);
  if (cleanId === null) return null;

  const numericPart = cleanId.replace('#', '');
  const parsed = parseInt(numericPart, 10);
  return isNaN(parsed) ? null : parsed;
}


/**
 * Normalizes a Pokémon name for clean lookups.
 * Converts to lowercase, trims whitespace, and removes special characters.
 */
function normalizeName(name: string | null | undefined): string {
  if (!name) return '';
  
  // Use trimStr first to handle \xa0 and standard whitespace
  const trimmedName = trimStr(name);
  if (!trimmedName) return '';
  
  return trimmedName
    .toLowerCase()
    .replace(/♀/g, ' f')
    .replace(/♂/g, ' m')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/:/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .trim(); // Trim again in case replacements created new whitespace
}

// --- Processing Functions ---

/**
 * processing pokemon_evolution_long.csv
 * -> evolutions.csv
 * uses core_dataset for id lookup
 */
async function processEvolutions() {
  console.log('Processing pokemon_evolution_long.csv...');
  
  // --- PASS 1: Read core dataset to build a Name -> ID map ---
  console.log('  Reading core dataset for ID lookup...');
  const coreData = await readCSV<any>(coreFile);
  const nameToIdMap = new Map<string, number>();
  
  coreData.forEach(row => {
    const normalizedName = normalizeName(row.name);
    // FIX: Use the parseId helper
    const id = parseId(row.dex_number);
    if (normalizedName && id !== null) {
      nameToIdMap.set(normalizedName, id);
    }
  });
  console.log(`  Lookup map created with ${nameToIdMap.size} entries.`);

  // --- PASS 2: Read and process the evolution log ---
  const evoLogData = await readCSV<any>(evoFile);
  console.log(`  Processing ${evoLogData.length} evolution log entries...`);
  
  const failedLookups = new Set<string>();

  const evolutionsData = evoLogData.map(row => {
    const fromName = normalizeName(row.Evolving_from);
    const toName = normalizeName(row.Evolving_to);

    const fromId = nameToIdMap.get(fromName) || null;
    const toId = nameToIdMap.get(toName) || null;

    if (!fromId && fromName) failedLookups.add(`'${fromName}' (original: '${row.Evolving_from}')`);
    if (!toId && toName) failedLookups.add(`'${toName}' (original: '${row.Evolving_to}')`);

    // FIX: Use trimStr helper for all string fields, then toLowerCase
    return {
      evolving_from_id: fromId,
      evolving_to_id: toId,
      evolving_from: fromName,
      evolving_to: toName,
      trigger: trimStr(row.trigger)?.toLowerCase() || null,
      condition: trimStr(row.Condition)?.toLowerCase() || null,
      value: trimStr(row.value)?.toLowerCase() || null,
    };
  });
  
  if (failedLookups.size > 0) {
    console.warn(`  [Debug] Could not find IDs for ${failedLookups.size} unique normalized names.`);
    console.warn('  First 10 failed lookups (normalized | original):', Array.from(failedLookups).slice(0, 10).join(', '));
  }

  const headers = [
    'evolving_from_id', 
    'evolving_to_id', 
    'evolving_from', 
    'evolving_to', 
    'trigger', 
    'condition', 
    'value'
  ];
  const outputPath = path.join(outputDir, 'evolutions.csv');
  await writeCSV(outputPath, evolutionsData, headers);
  console.log(`evolutions.csv created (${evolutionsData.length} rows).`);
}

/**
 * processing pokemon_core_dataset.csv
 * -> pokemon.csv
 * -> pokemon_abilities.csv
 * -> pokemon_legendary_status.csv
 * -> pokemon_statistics.csv
 * -> pokemon_pokedex_entries.csv
 */
async function processCoreDataset() {
  console.log('Processing pokemon_core_dataset.csv ...');
  const data = await readCSV<any>(coreFile);

  // 1. pokemon.csv
  const pokemonData = data.map(row => ({
    // FIX: Use parseId and trimStr
    pokemon_id: parseId(row.dex_number),
    name: trimStr(row.name),
    type_01: trimStr(row.type_01),
    type_02: trimStr(row.type_02)
  }));
  const pokemonHeaders = ['pokemon_id', 'name', 'type_01', 'type_02'];
  const pokemonPath = path.join(outputDir, 'pokemon.csv');

  // 2. pokemon_abilities.csv
  const abilitiesData = data.map(row => ({
    // FIX: Use parseId and trimStr
    pokemon_id: parseId(row.dex_number),
    ability_01: trimStr(row.ability_01),
    ability_02: trimStr(row.ability_02),
    hidden_ability: trimStr(row.hidden_ability),
    egg_group_01: trimStr(row.egg_group_01),
    egg_group_02: trimStr(row.egg_group_02) // This will fix the \xa0 bug
  }));
  const abilitiesHeaders = ['pokemon_id', 'ability_01', 'ability_02', 'hidden_ability', 'egg_group_01', 'egg_group_02'];
  const abilitiesPath = path.join(outputDir, 'pokemon_abilities.csv');
  
  // 3. pokemon_legendary_status.csv
  const legendaryData = data.map(row => ({
    // FIX: Use parseId and trimStr
    pokemon_id: parseId(row.dex_number),
    is_legendary: trimStr(row.is_legendary)
  }));
  const legendaryHeaders = ['pokemon_id', 'is_legendary'];
  const legendaryPath = path.join(outputDir, 'pokemon_legendary_status.csv');

  // 4. pokemon_statistics.csv
  const statsData = data.map(row => ({
    // FIX: Use parseId and parseNum
    pokemon_id: parseId(row.dex_number),
    hp: parseNum(row.hp),
    attack: parseNum(row.attack),
    defense: parseNum(row.defense),
    sp_attack: parseNum(row.sp_attack),
    sp_defense: parseNum(row.sp_defense),
    speed: parseNum(row.speed)
  }));
  const statsHeaders = ['pokemon_id', 'hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
  const statsPath = path.join(outputDir, 'pokemon_statistics.csv');

  // 5. pokemon_pokedex_entries.csv
  const pokedexData = data.map(row => ({
    // FIX: Use parseId and trimStr
    pokemon_id: parseId(row.dex_number),
    pokedex_entry: trimStr(row.bio)
  }));
  const pokedexHeaders = ['pokemon_id', 'pokedex_entry'];
  const pokedexPath = path.join(outputDir, 'pokemon_pokedex_entries.csv');

  // writing core data in parallel
  await Promise.all([
    writeCSV(pokemonPath, pokemonData, pokemonHeaders),
    writeCSV(abilitiesPath, abilitiesData, abilitiesHeaders),
    writeCSV(legendaryPath, legendaryData, legendaryHeaders),
    writeCSV(statsPath, statsData, statsHeaders),
    writeCSV(pokedexPath, pokedexData, pokedexHeaders),
  ]);
  
  console.log(`5 files created from core_dataset (${data.length} lines per file).`);
}

/**
 * Processing pokemon_moves_height_weight.csv
 * -> pokemon_measurements.csv
 * -> pokemon_best_moves.csv
 */
async function processMovesHeightWeight() {
  console.log('Processing pokemon_moves_height_weight.csv ...');
  const data = await readCSV<any>(movesFile);

  // 1. pokemon_measurements.csv
  const measurementsData = data.map(row => ({
    // FIX: Use parseId and parseNum
    pokemon_id: parseId(row.id),
    base_experience: parseNum(row.base_experience),
    height: parseNum(row.height),
    weight: parseNum(row.weight)
  }));
  const measurementsHeaders = ['pokemon_id', 'base_experience', 'height', 'weight'];
  const measurementsPath = path.join(outputDir, 'pokemon_measurements.csv');

  // 2. pokemon_best_moves.csv
  const movesData = data.map(row => ({
    // FIX: Use parseId and trimStr
    pokemon_id: parseId(row.id),
    moves: trimStr(row.moves)
  }));
  const movesHeaders = ['pokemon_id', 'moves'];
  const movesPath = path.join(outputDir, 'pokemon_best_moves.csv');

  // Parallel writing
  await Promise.all([
    writeCSV(measurementsPath, measurementsData, measurementsHeaders),
    writeCSV(movesPath, movesData, movesHeaders),
  ]);

  console.log(`2 files from moves_height_weight created (${data.length} lines per file).`);
}

// --- Main function ---

async function main() {
  try {
    console.log('Starting data processing (Wrangling)...');
    
    // Making sure the output dir exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`output dir created: ${outputDir}`);
    }

    // Running all data processing in parallel
    await Promise.all([
      processEvolutions(),
      processCoreDataset(),
      processMovesHeightWeight()
    ]);

    console.log('Data processing completed successfully!');
    console.log(`All clean output files can be found under: ${outputDir}`);

  } catch (error) {
    console.error('Error during data processing:', error);
  }
}

// starting script
main();