import styles from './Footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} by local ghost. All Pokémon data is property of Nintendo.</p>
    </footer>
  );
}

export default Footer;