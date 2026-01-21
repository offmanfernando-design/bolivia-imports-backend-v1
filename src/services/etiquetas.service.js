import { sheets } from '../config/googleSheets.js';

const ENTREGAS_SHEET = 'ENTREGAS_DB';

export default async function obtenerDatosEtiqueta(entrega_id, spreadsheetId)  {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${ENTREGAS_SHEET}!A2:Z`,
  });

  const filas = res.data.values || [];

  const fila = filas.find(r => r[0] === entrega_id);

  if (!fila) {
    throw new Error(`Entrega ${entrega_id} no encontrada`);
  }

  return {
    entrega_id: fila[0],
    cliente_id: fila[2],
    cliente_nombre: fila[3],
    cliente_telefono: fila[4],
    descripcion_producto: fila[5],
    cantidad_items: fila[6],
    peso_cobrado: fila[7],
    departamento_destino: fila[9],
    ubicacion_fisica: fila[10],
    monto_total_bs: fila[15],
  };
}
