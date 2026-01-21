import { crearEntrega } from '../services/entregas.service.js';

export async function crearEntregaController(req, res) {
  try {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    const data = req.body;

    if (!data.tracking || !data.cliente_nombre) {
      return res.status(400).json({
        ok: false,
        error: 'Datos obligatorios faltantes',
      });
    }

    const result = await crearEntrega(data, spreadsheetId);

    res.json({
      ok: true,
      entrega_id: result.entrega_id,
    });
} catch (error) {
  console.error('ERROR REAL CREAR ENTREGA:', error);

  res.status(500).json({
    ok: false,
    error: error.message || String(error),
    stack: error.stack,
  });
}

}
