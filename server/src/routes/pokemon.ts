import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const allPokemon = await prisma.pokemon.findMany({
      orderBy: {
        pokedex_id: 'asc',
      },
    });
    res.json(allPokemon);
  } catch (error) {
    console.error('Error while calling Pokémon:', error);
    res.status(500).json({ error: 'Could not retrieve Pokémon data' });
  }
});

router.get('/:id', async (req, res) => {
  const pokedexId = parseInt(req.params.id);

  if (isNaN(pokedexId)) {
    return res.status(400).json({ error: 'Invalid ID. It has to be a number.' });
  }

  try {
    const pokemon = await prisma.pokemon.findUnique({
      where: {
        pokedex_id: pokedexId,
      },
    });

    if (!pokemon) {
      return res.status(404).json({ error: 'Pokémon not found.' });
    }

    res.json(pokemon);
  } catch (error) {
    console.error(`Error while retrieving Pokémon ${pokedexId}:`, error);
    res.status(500).json({ error: 'Could not retrieve Pokémon data' });
  }
});

export default router;