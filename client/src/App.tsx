import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Importiere dein Layout
import Layout from '@/components/Layout'; 

// Importiere deine neuen Seiten
import HomePage from '@/pages/HomePage';
import AboutPage from '@/pages/AboutPage';
import PokedexPage from '@/pages/PokedexPage'
// import PokedexPage from './pages/PokedexPage'; // Platzhalter für später

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
           <Route path="pokedex" element={<PokedexPage />} /> 
           <Route path="*" element={<div>Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;