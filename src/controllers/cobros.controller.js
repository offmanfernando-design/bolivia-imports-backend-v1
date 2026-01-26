import { SPREADSHEET_ID, sheets } from '../config/googleSheets.js';
import sheetsService from '../services/sheets.service.js';
import {
  filtrarTexto,
  filtrarTrackingLast4,
  filtrarFecha
} from '../utils/filtros.js';

const SHEET_NAME = 'ENTREGAS_DB';

/* =========================
   Helper batch update
   ========================= */
async function actualizarFilas(updates) {
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates
    }
  });
}

/* =========================
   GET /api/cobros
   (RESUMEN por cliente)
   ========================= */
export async function listarCobros(req, res) {
  try {
    const { estado_cobro, q, tracking_last4, fecha_desde, fecha_hasta } = req.query;
    if (!estado_cobro) {
      return res.status(400).json({ error: 'estado_cobro es obligatorio' });
    }

    const entregas = await sheetsService.getEntregas();

    const filtradas = entregas.filter(e =>
      e.estado_cobro === estado_cobro &&
      filtrarTexto(e, q) &&
      filtrarTrackingLast4(e, tracking_last4) &&
      filtrarFecha(e, estado_cobro, fecha_desde, fecha_hasta)
    );

    const porCliente = {};

    for (const e of filtradas) {
      if (!porCliente[e.cliente_id]) {
        porCliente[e.cliente_id] = {
          cliente_id: e.cliente_id,
          cliente_nombre: e.cliente_nombre,
          cliente_telefono: e.cliente_telefono,
          departamento_destino: e.departamento_destino,
          monto_total_bs: 0,
          avisos_count: Number(e.avisos_count || 0)
        };
      }
      porCliente[e.cliente_id].monto_total_bs += Number(e.monto_total_bs || 0);
    }

    res.json(Object.values(porCliente));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error listar cobros' });
  }
}

/* =========================
   GET /api/cobros/detalle/:cliente_id
   (DETALLE REAL PARA MENSAJE)
   ========================= */
export async function detalleCobro(req, res) {
  try {
    const { cliente_id } = req.params;
    const entregas = await sheetsService.getEntregas();

    const detalle = entregas.filter(e => e.cliente_id === cliente_id);

    res.json(detalle);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error detalle cobro' });
  }
}

/* =========================
   PUT /api/cobros/avisar
   ========================= */
export async function avisarCobro(req, res) {
  try {
    const { cliente_id } = req.body;
    if (!cliente_id) return res.status(400).json({ error: 'cliente_id requerido' });

    const entregas = await sheetsService.getEntregas();
    const hoy = new Date().toISOString().split('T')[0];

    const updates = [];
    let nuevoContador = 0;

    entregas.forEach((e, index) => {
      if (e.cliente_id === cliente_id && e.estado_cobro === 'pendiente') {
        const row = index + 2;
        nuevoContador = Number(e.avisos_count || 0) + 1;

        updates.push(
          { range: `${SHEET_NAME}!O${row}`, values: [[hoy]] },
          { range: `${SHEET_NAME}!Q${row}`, values: [['avisado']] },
          { range: `${SHEET_NAME}!U${row}`, values: [[nuevoContador]] }
        );
      }
    });

    await actualizarFilas(updates);
    res.json({ ok: true, avisos_count: nuevoContador });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error avisar' });
  }
}

/* =========================
   PUT /api/cobros/pagar
   ========================= */
export async function confirmarPago(req, res) {
  try {
    const { cliente_id } = req.body;
    const entregas = await sheetsService.getEntregas();
    const hoy = new Date().toISOString().split('T')[0];

    const updates = [];

    entregas.forEach((e, index) => {
      if (e.cliente_id === cliente_id && e.estado_cobro === 'avisado') {
        const row = index + 2;
        updates.push(
          { range: `${SHEET_NAME}!L${row}`, values: [['entregado']] },
          { range: `${SHEET_NAME}!N${row}`, values: [[hoy]] },
          { range: `${SHEET_NAME}!Q${row}`, values: [['pagado']] }
        );
      }
    });

    await actualizarFilas(updates);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error pagar' });
  }
}
