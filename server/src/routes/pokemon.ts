import { Router } from 'express';
import { prisma } from '../db'; // Import our Prisma instance

const router = Router();

/**
 * Defines the related data to include in a full Pokémon query.
 * We create this object so we don't have to repeat it for both routes.
 */
const pokemonInclude = {
  abilities: true,
  legendary_status: true,
  statistics: true,
  pokedex_entry: true,
  measurements: true,
  best_moves: true,
  evolutions_from: true, // Evolutions this Pokémon evolves FROM
  evolutions_to: true,   // Evolutions this Pokémon evolves TO
};

/**
 * GET /api/pokemon
 * Retrieves a list of ALL Pokémon, including their related data.
 */
router.get('/', async (req, res) => {
  try {
    const allPokemon = await prisma.pokemon.findMany({
      // Sort by Pokedex ID
      orderBy: {
        pokemon_id: 'asc',
      },
      // Include all related tables
      include: pokemonInclude,
    });
    res.json(allPokemon);
  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
    res.status(500).json({ error: 'Failed to retrieve Pokémon data' });
  }
});

/**
 * GET /api/pokemon/:id
 * Retrieves a SINGLE Pokémon by its POKEDEX_ID,
 * including all related data.
 */
router.get('/:id', async (req, res) => {
  const pokedexId = parseInt(req.params.id);

  if (isNaN(pokedexId)) {
    return res.status(400).json({ error: 'Invalid ID. Must be a number.' });
  }

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: {
        pokemon_id: pokedexId, // Search by the unique pokedex_id
      },
      // Include all related tables
      include: pokemonInclude,
    });

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon not found' });
    }

    res.json(pokemon);
  } catch (error) {
    console.error(`Error fetching Pokémon ${pokedexId}:`, error);
    res.status(500).json({ error: 'Failed to retrieve Pokémon data' });
  }
});

export default router;