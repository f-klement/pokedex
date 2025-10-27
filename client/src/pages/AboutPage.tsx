import styles from './AboutPage.module.css';

function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      <h1 className={styles.title}>About this project</h1>
      
      <section className={styles.section}>
        <h2>The idea</h2>
        <p>
          This project is intended as a "fun side project" in order to learn and apply a
          modern webstack. A Pokédex is a classic example for retrieval of data from a
          server that does additional processing before rendering it on the frontend (client).
        </p>
      </section>

      <section className={styles.section}>
        <h2>Tech-Stack</h2>
        <p>The following technologies are in use:</p>
        <ul className={styles.techList}>
          <li><strong>Client:</strong> React, TypeScript, Vite</li>
          <li><strong>Server:</strong> Express, TypeScript</li>
          <li><strong>Runtime Environment:</strong> Bun</li>
          <li><strong>Object Relational Mapper:</strong> Prisma</li>
          <li><strong>Database:</strong> Postgres</li>
          <li><strong>Containerization:</strong> Docker & Docker Compose</li>
          <li><strong>DB-Management:</strong> pgAdmin</li>
          <li><strong>Data Source:</strong> kaggle datasets, pokeapi, Purukitto/pokemon-data.json</li>
        </ul>
      </section>
    </div>
  );
}

export default AboutPage;
