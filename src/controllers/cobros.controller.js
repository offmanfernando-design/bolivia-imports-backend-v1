import { sheets, SPREADSHEET_ID } from '../config/googleSheets.js';
import sheetsService from '../services/sheets.service.js';
import {
  filtrarTexto,
  filtrarTrackingLast4,
  filtrarFecha
} from '../utils/filtros.js';

const SHEET_NAME = 'entregas_DB';

/* =========================
   Helper: actualizar filas
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
   ========================= */
export async function listarCobros(req, res) {
  try {
    const {
      estado_cobro,
      q,
      tracking_last4,
      fecha_desde,
      fecha_hasta
    } = req.query;

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
      const id = e.cliente_id;

      if (!porCliente[id]) {
        porCliente[id] = {
          cliente_id: e.cliente_id,
          cliente_nombre: e.cliente_nombre,
          cliente_telefono: e.cliente_telefono,
          departamento_destino: e.departamento_destino,
          cantidad_items: 0,
          monto_total_bs: 0,
          entregas: []
        };
      }

      porCliente[id].cantidad_items += Number(e.cantidad_items || 0);
      porCliente[id].monto_total_bs += Number(e.monto_total_bs || 0);

      porCliente[id].entregas.push({
        entrega_id: e.entrega_id,
        tracking: e.tracking,
        descripcion_producto: e.descripcion_producto,
        cantidad_items: Number(e.cantidad_items || 0),
        monto_total_bs: Number(e.monto_total_bs || 0)
      });
    }

    res.json(Object.values(porCliente));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cobros' });
  }
}

/* =========================
   PUT /api/cobros/avisar
   ========================= */
export async function avisarCobro(req, res) {
  try {
    const { cliente_id } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es obligatorio' });
    }

    const entregas = await sheetsService.getEntregas();
    const hoy = new Date().toISOString().split('T')[0];

    const updates = [];

    entregas.forEach((e, index) => {
      if (e.cliente_id === cliente_id && e.estado_cobro === 'pendiente') {
        const rowNumber = index + 2;

        updates.push(
          { range: `${SHEET_NAME}!O${rowNumber}`, values: [[hoy]] },
          { range: `${SHEET_NAME}!P${rowNumber}`, values: [[e.monto_total_bs || '']] },
          { range: `${SHEET_NAME}!Q${rowNumber}`, values: [['avisado']] }
        );
      }
    });

    if (!updates.length) {
      return res.status(400).json({
        error: 'No hay entregas pendientes para este cliente'
      });
    }

    await actualizarFilas(updates);

    res.json({ ok: true, mensaje: 'Cobros avisados correctamente' });
  } catch (error) {
    console.error('ERROR AVISAR COBRO:', error);
    res.status(500).json({ error: 'Error al avisar cobro' });
  }
}

/* =========================
   PUT /api/cobros/pagar
   ========================= */
export async function confirmarPago(req, res) {
  try {
    const { cliente_id } = req.body;

    if (!cliente_id) {
      return res.status(400).json({ error: 'cliente_id es obligatorio' });
    }

    const entregas = await sheetsService.getEntregas();
    const hoy = new Date().toISOString().split('T')[0];

    const updates = [];

    entregas.forEach((e, index) => {
      if (e.cliente_id === cliente_id && e.estado_cobro === 'avisado') {
        const rowNumber = index + 2;

        updates.push(
          { range: `${SHEET_NAME}!L${rowNumber}`, values: [['entregado']] },
          { range: `${SHEET_NAME}!N${rowNumber}`, values: [[hoy]] },
          { range: `${SHEET_NAME}!O${rowNumber}`, values: [[hoy]] },
          { range: `${SHEET_NAME}!Q${rowNumber}`, values: [['pagado']] }
        );
      }
    });

    if (!updates.length) {
      return res.status(400).json({
        error: 'No hay entregas avisadas para este cliente'
      });
    }

    await actualizarFilas(updates);

    res.json({ ok: true, mensaje: 'Pago confirmado correctamente' });
  } catch (error) {
    console.error('ERROR CONFIRMAR PAGO:', error);
    res.status(500).json({ error: 'Error al confirmar pago' });
  }
}
