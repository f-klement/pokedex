// src/index.ts
import express, { Request, Response } from 'express';
import pokemonRoutes from './routes/pokemon';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 

app.get('/', (req: Request, res: Response) => {
  res.send('Hallo vom Pokédex-Server!');
});

app.use('/public', express.static(path.join(__dirname, '..', 'public')));

app.use('/api/pokemon', pokemonRoutes);

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});