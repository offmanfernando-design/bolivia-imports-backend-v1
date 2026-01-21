// src/routes/etiquetas.routes.js
import express from 'express';
import getEtiquetasPorEntrega from '../controllers/etiquetas.controller.js';

const router = express.Router();

router.get('/entregas/:entrega_id/etiquetas', getEtiquetasPorEntrega);

export default router;
