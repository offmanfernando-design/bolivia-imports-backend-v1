import express from 'express';
import { crearEntregaController } from '../controllers/entregas.controller.js';

const router = express.Router();

/**
 * POST /api/entregas
 */
router.post('/', crearEntregaController);

export default router;
