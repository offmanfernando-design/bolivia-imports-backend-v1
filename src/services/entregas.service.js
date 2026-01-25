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

// 🔹 LEER UBICACION DESDE RKT Jacke (columna AD)
const RKT_SHEET = 'RKT Jacke';

const rktRes = await sheets.spreadsheets.values.get({
  spreadsheetId,
  range: `${RKT_SHEET}!A2:AD`,
});

const filasRKT = rktRes.data.values || [];

// buscamos por tracking
const filaRKT = filasRKT.find(r => String(r[0]) === String(data.tracking));

// Columna AD = índice 29 (A=0)
const ubicacion_fisica = filaRKT ? filaRKT[29] || '' : '';


  // 2. Armar fila según contrato ENTREGAS_DB
const nuevaFila = [
  entregaId,
  data.tracking || '',
  cliente_id,
  data.cliente_nombre || '',
  telefono,
  data.descripcion_producto || '',
  Number(data.cantidad_items) || '',
  Number(data.peso_cobrado) || '',
  Number(data.volumen) || '',
  data.departamento_destino || '',
  data.ubicacion_fisica || '',   // ← COLUMNA K (LISTO)
  'en_almacen',
  fechaHoy,
  '',
  fechaHoy,
  Number(data.monto_total_bs) || '',
  'pendiente',
  '',
  data.tipo_de_cobro !== undefined ? Number(data.tipo_de_cobro) : '',
  data.dolar_cliente !== undefined ? Number(data.dolar_cliente) : ''
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
