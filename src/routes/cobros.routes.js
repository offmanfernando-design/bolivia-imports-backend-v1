import express from 'express';
import {
  listarCobros,
  avisarCobro,
  confirmarPago
} from '../controllers/cobros.controller.js';

console.log('COBROS ROUTES FILE LOADED');

const router = express.Router();

router.get('/', listarCobros);
router.put('/avisar', avisarCobro);
router.put('/pagar', confirmarPago);

export default router;
