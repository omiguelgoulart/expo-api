import express from 'express';
import categoriaRoutes from './routes/categorias';

import usuarioRoutes from './routes/usuarios';
import loginRoutes from './routes/login';
import produtoRoutes from './routes/produtos';
import pedidoRoutes from './routes/pedidoItens';
import comandaRoutes from './routes/comandas';

import cors from 'cors';


const app = express();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'API comandas!' });
});


app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/produto', produtoRoutes);
app.use('/pedido', pedidoRoutes);
app.use('/comanda', comandaRoutes);


const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});