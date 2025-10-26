import { useState, useEffect } from 'react';
import styles from './PokedexPage.module.css';

// --- Define a Type for our Pokémon Data ---
// This should match the JSON from your API
// We can start simple and add more fields later
type Pokemon = {
  id: number;
  pokemon_id: number;
  name: string;
  type_01: string;
  type_02: string | null;
  // add statistics, abilities, etc. here later
};

function PokedexPage() {
  // --- State Variables ---
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    // This function fetches the data
    const fetchPokemon = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Thanks to the proxy, '/api/pokemon' goes to 'http://localhost:3000/api/pokemon'
        const response = await fetch('/api/pokemon');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Pokemon[] = await response.json();
        setPokemonList(data);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch Pokémon data.');
      } finally {
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchPokemon();
  }, []); // The empty array [] means this effect runs once when the component mounts

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading Pokédex...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  // Success: Render the list
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Pokédex</h1>
      <div className={styles.grid}>
        {pokemonList.map((pokemon) => (
          <div key={pokemon.pokemon_id} className={styles.card}>
            {/* We'll add images later */}
            <span className={styles.pokemonId}>#{String(pokemon.pokemon_id).padStart(3, '0')}</span>
            <h2 className={styles.pokemonName}>{pokemon.name}</h2>
            <div className={styles.types}>
              <span className={`${styles.type} ${styles[pokemon.type_01.toLowerCase()]}`}>
                {pokemon.type_01}
              </span>
              {pokemon.type_02 && (
                <span className={`${styles.type} ${styles[pokemon.type_02.toLowerCase()]}`}>
                  {pokemon.type_02}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PokedexPage;