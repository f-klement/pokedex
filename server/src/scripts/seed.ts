// server/src/scripts/seed.ts
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { prisma } from '../db'; // Import our Prisma client instance
import type { Prisma } from '@prisma/client';

// --- Path Definitions ---
const dataDir = path.join(__dirname, '..', '..', 'data', 'processed');

// --- Helper: Read CSV ---
// (We need this helper again here)
function readCSV<T>(filePath: string): Promise<T[]> {
  const results: T[] = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv()) // Assumes headers: true
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// --- Helper: Type Conversion ---
// CSVs load everything as strings, so we must convert to Int, Boolean, etc.

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


// --- Seeding Functions for Each Table ---

async function seedPokemon() {
  const filePath = path.join(dataDir, 'pokemon.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    name: row.name,
    type_01: row.type_01,
    type_02: toOptionalString(row.type_02),
  }));

  await prisma.pokemon.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon`);
}

async function seedAbilities() {
  const filePath = path.join(dataDir, 'pokemon_abilities.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    ability_01: toOptionalString(row.ability_01),
    ability_02: toOptionalString(row.ability_02),
    hidden_ability: toOptionalString(row.hidden_ability),
    egg_group_01: toOptionalString(row.egg_group_01),
    egg_group_02: toOptionalString(row.egg_group_02),
  }));

  await prisma.pokemon_abilities.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon abilities`);
}

async function seedLegendaryStatus() {
  const filePath = path.join(dataDir, 'pokemon_legendary_status.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    is_legendary: toBoolean(row.is_legendary),
  }));

  await prisma.pokemon_legendary_status.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} legendary statuses`);
}

async function seedStatistics() {
  const filePath = path.join(dataDir, 'pokemon_statistics.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    hp: toInt(row.hp),
    attack: toInt(row.attack),
    defense: toInt(row.defense),
    sp_attack: toInt(row.sp_attack),
    sp_defense: toInt(row.sp_defense),
    speed: toInt(row.speed),
  }));

  await prisma.pokemon_statistics.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon statistics`);
}

async function seedPokedexEntries() {
  const filePath = path.join(dataDir, 'pokemon_pokedex_entries.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    pokedex_entry: row.pokedex_entry,
  }));

  await prisma.pokemon_pokedex_entries.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokédex entries`);
}

async function seedMeasurements() {
  const filePath = path.join(dataDir, 'pokemon_measurements.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    base_experience: toInt(row.base_experience),
    height: toInt(row.height),
    weight: toInt(row.weight),
  }));

  await prisma.pokemon_measurements.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon measurements`);
}

async function seedBestMoves() {
  const filePath = path.join(dataDir, 'pokemon_best_moves.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    pokemon_id: toInt(row.pokemon_id),
    moves: row.moves,
  }));

  await prisma.pokemon_best_moves.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} Pokémon moves`);
}

async function seedEvolutions() {
  const filePath = path.join(dataDir, 'evolutions.csv');
  const data = await readCSV<any>(filePath);

  const formattedData = data.map(row => ({
    evolving_from_id: toOptionalInt(row.evolving_from_id),
    evolving_to_id: toOptionalInt(row.evolving_to_id),
    evolving_from: row.evolving_from,
    evolving_to: row.evolving_to,
    trigger: toOptionalString(row.trigger),
    condition: toOptionalString(row.condition),
    value: toOptionalString(row.value),
  }));

  await prisma.evolutions.createMany({
    data: formattedData,
    skipDuplicates: true,
  });
  console.log(`Seeded ${formattedData.length} evolution entries`);
}

// --- Main Seeding Function ---

async function main() {
  console.log('Starting seed process...');
  try {
    // We wrap the seeding in a transaction to ensure all or nothing
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Clear all data in reverse order of dependencies
      console.log('Clearing old data...');
      await tx.evolutions.deleteMany({});
      await tx.pokemon_best_moves.deleteMany({});
      await tx.pokemon_measurements.deleteMany({});
      await tx.pokemon_pokedex_entries.deleteMany({});
      await tx.pokemon_statistics.deleteMany({});
      await tx.pokemon_legendary_status.deleteMany({});
      await tx.pokemon_abilities.deleteMany({});
      await tx.pokemon.deleteMany({});

      // Seed new data in order of dependencies
      console.log('Seeding new data...');
      
      // 1. Seed Pokemon (PRIMARY table)
      await seedPokemon(); 
      
      // 2. Seed dependent tables (can run in parallel)
      await Promise.all([
        seedAbilities(),
        seedLegendaryStatus(),
        seedStatistics(),
        seedPokedexEntries(),
        seedMeasurements(),
        seedBestMoves(),
      ]);

      // 3. Seed Evolutions (depends on Pokemon IDs being present)
      await seedEvolutions();
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