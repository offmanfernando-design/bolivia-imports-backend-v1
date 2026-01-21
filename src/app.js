import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import entregasRoutes from './routes/entregas.routes.js';
import etiquetasRoutes from './routes/etiquetas.routes.js';
import cobrosRoutes from './routes/cobros.routes.js';
console.log('ETIQUETAS ROUTES LOADED');
console.log('APP.JS LOADED DESDE:', process.cwd());


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/entregas', entregasRoutes);
app.use('/api', etiquetasRoutes);
app.use('/api/cobros', cobrosRoutes);


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Bolivia Imports API'
  });
});

export default app;

