import { sheets } from '../config/googleSheets.js';

const CLIENTES_SHEET = 'Clientes_ID';

function generarIniciales(nombre) {
  return nombre
    .toString()
    .trim()
    .split(/\s+/)
    .map(p => p[0]?.toUpperCase())
    .join('');
}

export async function resolverCliente({ nombre, telefono, spreadsheetId }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${CLIENTES_SHEET}!A2:C`, // sin encabezado
  });

  const filas = res.data.values || [];

  // 1️⃣ Buscar cliente existente por teléfono
  for (let i = 0; i < filas.length; i++) {
    const [nombreExistente, clienteId, telefonoExistente] = filas[i];

    if (
      telefonoExistente &&
      telefono &&
      String(telefonoExistente) === String(telefono)
    ) {
      return {
        cliente_id: clienteId,
        telefono: telefonoExistente,
      };
    }
  }

  // 2️⃣ Cliente nuevo → correlativo = filas existentes
  // fila 2 = correlativo 1
  // filas.length = último correlativo
  const correlativo = filas.length + 1;

  const iniciales = generarIniciales(nombre || 'CL');
  const nuevoClienteId = `${iniciales}-${correlativo}`;

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: CLIENTES_SHEET,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[nombre || '', nuevoClienteId, telefono || '']],
    },
  });

  return {
    cliente_id: nuevoClienteId,
    telefono,
  };
}
