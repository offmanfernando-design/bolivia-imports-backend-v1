import express from 'express';
import {
  listarCobros,
  detalleCobro,
  avisarCobro,
  confirmarPago
} from '../controllers/cobros.controller.js';

const router = express.Router();

router.get('/', listarCobros);
router.get('/detalle/:cliente_id', detalleCobro);
router.put('/avisar', avisarCobro);
router.put('/pagar', confirmarPago);

export default router;
