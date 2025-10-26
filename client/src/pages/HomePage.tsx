import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

function HomePage() {
  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>Welcome to my Pokédex</h1>
      <p className={styles.introText}>
        This project was created with React, Express, Bun, Prisma, and Postgres.
        Discover more than 1000 pokemon.
      </p>
      <Link to="/pokedex" className={styles.ctaButton}>
        To the Pokédex
      </Link>
    </div>
  );
}

export default HomePage;