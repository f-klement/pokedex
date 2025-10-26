import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { prisma } from '../db'; // Import our Prisma client instance
import type { Prisma } from '@prisma/client';

// Define a type for our Transaction Client
type TxClient = Prisma.TransactionClient;

// --- Path Definitions ---
const dataDir = path.join(__dirname, '..', '..', 'data', 'processed');

// --- Helper: Read CSV ---
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

// --- Helper: Type Conversion ---
function toInt(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function toOptionalInt(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

function toBoolean(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.toLowerCase() === 'true';
}

function toOptionalString(value: string | null | undefined): string | null {
  if (!value || value.toLowerCase() === 'null' || value.toLowerCase() === 'n/a') {
    return null;
  }
  return value;
}

// --- Seeding Functions for Each Table (Now accept tx and validIdSet) ---

async function seedPokemon(tx: TxClient) {
  const filePath = path.join(dataDir, 'pokemon.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    name: row.name,
    type_01: row.type_01,
    type_02: toOptionalString(row.type_02),
  }));

  await tx.pokemon.createMany({ // Use tx
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon`);
}

async function seedAbilities(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_abilities.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      ability_01: toOptionalString(row.ability_01),
      ability_02: toOptionalString(row.ability_02),
      hidden_ability: toOptionalString(row.hidden_ability),
      egg_group_01: toOptionalString(row.egg_group_01),
      egg_group_02: toOptionalString(row.egg_group_02),
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs

  if (data.length !== formattedData.length) {
    console.warn(`[seedAbilities] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_abilities.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon abilities`);
}

async function seedLegendaryStatus(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_legendary_status.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      is_legendary: toBoolean(row.is_legendary),
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs

  if (data.length !== formattedData.length) {
    console.warn(`[seedLegendaryStatus] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_legendary_status.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} legendary statuses`);
}

async function seedStatistics(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_statistics.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      hp: toInt(row.hp),
      attack: toInt(row.attack),
      defense: toInt(row.defense),
      sp_attack: toInt(row.sp_attack),
      sp_defense: toInt(row.sp_defense),
      speed: toInt(row.speed),
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs
  
  if (data.length !== formattedData.length) {
    console.warn(`[seedStatistics] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_statistics.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon statistics`);
}

async function seedPokedexEntries(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_pokedex_entries.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      pokedex_entry: row.pokedex_entry,
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs
  
  if (data.length !== formattedData.length) {
    console.warn(`[seedPokedexEntries] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_pokedex_entries.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokédex entries`);
}

async function seedMeasurements(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_measurements.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      base_experience: toInt(row.base_experience),
      height: toInt(row.height),
      weight: toInt(row.weight),
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs
  
  if (data.length !== formattedData.length) {
    console.warn(`[seedMeasurements] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_measurements.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon measurements`);
}

async function seedBestMoves(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'pokemon_best_moves.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      pokemon_id: toInt(row.pokemon_id),
      moves: row.moves,
    }))
    .filter(row => validIdSet.has(row.pokemon_id)); // Filter invalid IDs
  
  if (data.length !== formattedData.length) {
    console.warn(`[seedBestMoves] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.pokemon_best_moves.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon moves`);
}

async function seedEvolutions(tx: TxClient, validIdSet: Set<number>) {
  const filePath = path.join(dataDir, 'evolutions.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data
    .map(row => ({
      evolving_from_id: toOptionalInt(row.evolving_from_id),
      evolving_to_id: toOptionalInt(row.evolving_to_id),
      evolving_from: row.evolving_from,
      evolving_to: row.evolving_to,
      trigger: toOptionalString(row.trigger),
      condition: toOptionalString(row.condition),
      value: toOptionalString(row.value),
    }))
    .filter(row => {
      // Keep if 'from' is null OR 'from' is a valid ID
      const fromOk = row.evolving_from_id === null || validIdSet.has(row.evolving_from_id);
      // Keep if 'to' is null OR 'to' is a valid ID
      const toOk = row.evolving_to_id === null || validIdSet.has(row.evolving_to_id);
      return fromOk && toOk;
    });
  
  if (data.length !== formattedData.length) {
    console.warn(`[seedEvolutions] Filtered out ${data.length - formattedData.length} rows with invalid pokemon_id.`);
  }

  await tx.evolutions.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} evolution entries`);
}

// --- Main Seeding Function ---

async function main() {
  console.log('Starting seed process...');
  try {
    await prisma.$transaction(async (tx: TxClient) => {
      // 1. Clear all data in reverse order of dependencies
      console.log('Clearing old data...');
      await tx.evolutions.deleteMany({});
      await tx.pokemon_best_moves.deleteMany({});
      await tx.pokemon_measurements.deleteMany({});
      await tx.pokemon_pokedex_entries.deleteMany({});
      await tx.pokemon_statistics.deleteMany({});
      await tx.pokemon_legendary_status.deleteMany({});
      await tx.pokemon_abilities.deleteMany({});
      await tx.pokemon.deleteMany({});

      // 2. Seed the PRIMARY pokemon table
      console.log('Seeding new data...');
      await seedPokemon(tx); 
      
      // 3. Get the set of valid IDs we just created
      console.log('Fetching valid Pokemon IDs...');
      const validPokemon: { pokemon_id: number }[] = await tx.pokemon.findMany({
        select: { pokemon_id: true }
      });
      const validIdSet = new Set(validPokemon.map(p => p.pokemon_id));
      console.log(`Found ${validIdSet.size} valid IDs.`);

      // 4. Seed all dependent tables in parallel, passing the validIdSet
      await Promise.all([
        seedAbilities(tx, validIdSet),
        seedLegendaryStatus(tx, validIdSet),
        seedStatistics(tx, validIdSet),
        seedPokedexEntries(tx, validIdSet),
        seedMeasurements(tx, validIdSet),
        seedBestMoves(tx, validIdSet),
      ]);

      // 5. Seed Evolutions (also needs the set)
      await seedEvolutions(tx, validIdSet);
    });

    console.log('Seed process completed successfully!');

  } catch (error) {
    console.error('Error during seed process:', error);
    process.exit(1);
  } finally {
    // Disconnect Prisma client
    await prisma.$disconnect();
  }
}

// Run the seed script
main();