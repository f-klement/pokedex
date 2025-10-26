import styles from './PokedexPage.module.css';

function PokedexPage() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Pokédex</h2>
      <p className={styles.message}>
        Sorry, the pokedex is still under development, but will be coming soon
      </p>
    </div>
  );
}

export default PokedexPage;