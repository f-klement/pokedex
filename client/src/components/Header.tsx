import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
      <NavLink to="/" className={styles.logoLink}>
          <img 
            src="/pokeball-logo.png" 
            alt="Pokédex Logo" 
            className={styles.logo} 
          />
        </NavLink>
        <ul>
          <li>
            <NavLink 
              to="/"
              className={({ isActive }) => isActive ? styles.active : ''}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/pokedex"
              className={({ isActive }) => isActive ? styles.active : ''}
            >
              Pokédex
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/about"
              className={({ isActive }) => isActive ? styles.active : ''}
            >
              About
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;