import express from 'express';
import {
  crearEntrega
} from '../controllers/entregas.controller.js';

const router = express.Router();

/**
 * POST /api/entregas
 * Crear nueva entrega (Google Sheets → Backend)
 */
router.post('/', crearEntrega);

export default router;
