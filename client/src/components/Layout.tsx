import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

function Layout() {
  return (
    <div className={styles.appLayout}>
      <Header />
      <main className={styles.mainContent}>
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}

export default Layout;