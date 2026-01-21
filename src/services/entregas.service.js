import { sheets } from '../config/googleSheets.js';
import { resolverCliente } from './clientes.service.js';


const ENTREGAS_SHEET = 'ENTREGAS_DB';

export async function crearEntrega(data, spreadsheetId) {
  // 1. Leer ENTREGAS_DB para calcular siguiente entrega_id
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${ENTREGAS_SHEET}!A2:A`,
  });

  const { cliente_id, telefono } = await resolverCliente({
  nombre: data.cliente_nombre,
  telefono: data.cliente_telefono,
  spreadsheetId,
});

  const filas = response.data.values || [];
  const siguienteNumero = filas.length + 1;
  const entregaId = `ENT-${String(siguienteNumero).padStart(5, '0')}`;

  function fechaLocalYYYYMMDD() {
  const ahora = new Date();
  const offsetMs = ahora.getTimezoneOffset() * 60000;
  const local = new Date(ahora.getTime() - offsetMs);
  return local.toISOString().slice(0, 10);
}

const fechaHoy = fechaLocalYYYYMMDD();


  // 2. Armar fila según contrato ENTREGAS_DB
  const nuevaFila = [
  entregaId,
  data.tracking || '',
  cliente_id,                  // ✅ USAR lo resuelto
  data.cliente_nombre || '',
  telefono,                    // ✅ USAR lo resuelto
  data.descripcion_producto || '',
  Number(data.cantidad_items) || '',
  Number(data.peso_cobrado) || '',
  Number(data.volumen) || '',
  data.departamento_destino || '',
  '',
  'en_almacen',
  fechaHoy,
  '',
  fechaHoy,
  Number(data.monto_total_bs) || '',
  'pendiente',
  ''
];

  // 3. Insertar fila
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: ENTREGAS_SHEET,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [nuevaFila],
    },
  });

  return {
    entrega_id: entregaId,
  };
}
