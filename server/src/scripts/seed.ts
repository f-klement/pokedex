import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { prisma } from '../db'; // importing singleton instance

// Pfad zur CSV-Datei
const dataDir = path.join(__dirname, '..', '..', 'data');
const csvFilePath = path.join(dataDir, 'pokemon.csv');

interface PokemonRow {
  id: string; // Annahme: ID ist in der CSV als String/Nummer
  name: string;
  type1: string;
  type2?: string;
}

async function seedDatabase() {
  try {
    console.log('Beginne mit dem Seed-Prozess (mit Prisma)...');
    
    // 1. Daten aus CSV lesen
    console.log(`Lese Daten aus ${csvFilePath}...`);
    const rows: PokemonRow[] = [];
    
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(csvFilePath)
        .pipe(csv())
        .on('data', (row: PokemonRow) => {
          rows.push(row);
        })
        .on('end', () => {
          console.log(`CSV-Datei erfolgreich gelesen. ${rows.length} Einträge gefunden.`);
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    // 2. Tabelle leeren (optional, aber empfohlen für wiederholbare Seeds)
    console.log('Leere bestehende Pokémon-Tabelle...');
    await prisma.pokemon.deleteMany({}); // deleteMany statt TRUNCATE
    
    // 3. Daten für Prisma vorbereiten (Batch-Insert)
    // Wir wandeln die CSV-Reihen in das Prisma-Datenformat um
    const dataToInsert = rows.map(row => ({
      pokedex_id: parseInt(row.id),
      name: row.name,
      type1: row.type1,
      type2: row.type2 || null,
    }));

    // 4. Daten in die Datenbank einfügen
    console.log('Füge Daten in die Datenbank ein (Batch)...');
    
    // createMany ist viel schneller als einzelne Inserts in einer Schleife
    const result = await prisma.pokemon.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Überspringt Duplikate, falls vorhanden
    });

    console.log(`✅ Seed-Prozess erfolgreich abgeschlossen! ${result.count} Einträge erstellt.`);
    
  } catch (error) {
    console.error('❌ Fehler während des Seed-Prozesses:', error);
  } finally {
    // Prisma-Verbindung trennen
    await prisma.$disconnect();
  }
}

seedDatabase();