import express from 'express';
import itemComandaRoutes from './routes/pedidoItens';
import comandaRoutes from './routes/comandas';
import pedidoRoutes from './routes/categorias';
import usuarioRoutes from './routes/usuarios';
import loginRoutes from './routes/login';
import cors from 'cors';


const app = express();


app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'API comandas!' });
});


app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/itens', itemComandaRoutes);
app.use('/itens', itemComandaRoutes);
app.use('/comandas', comandaRoutes);
app.use('/pedidos', pedidoRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});