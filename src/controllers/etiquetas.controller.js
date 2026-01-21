// FIX EXPORT FOR RENDER
import obtenerDatosEtiqueta from '../services/etiquetas.service.js';

export async function getEtiquetasPorEntrega(req, res) {
  try {
    const { entrega_id } = req.params;
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const data = await obtenerDatosEtiqueta(entrega_id, spreadsheetId);

    const esSantaCruz =
      (data.departamento_destino || '').toLowerCase() === 'santa cruz';

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${entrega_id}`;

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title>Etiquetas</title>

<style>
@page {
  size: letter;
  margin: 8mm;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  text-transform: uppercase;
}

.envio {
  display: ${esSantaCruz ? 'none' : 'flex'};
  height: 45%;
  border: 2px solid #000;
  padding: 10mm;
  box-sizing: border-box;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.envio .cliente {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 6mm;
}

.envio .destino {
  font-size: 38px;
  font-weight: bold;
  margin-bottom: 6mm;
}

.envio .telefono {
  font-size: 26px;
}

.almacen-zone {
  margin-top: ${esSantaCruz ? '0' : '8mm'};
}

.almacen {
  width: 100%;
  height: 45mm;
  border: 2px solid #000;
  box-sizing: border-box;
  padding: 5mm;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8mm;
}

.qr {
  width: 35mm;
  height: 35mm;
  flex-shrink: 0;
}

.qr img {
  width: 100%;
  height: 100%;
}

.info {
  font-size: 12px;
  line-height: 1.5;
}

.info .nombre {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 2mm;
}
</style>
</head>

<body>

<div class="envio">
  <div class="cliente">${data.cliente_nombre}</div>
  <div class="destino">${data.departamento_destino}</div>
  <div class="telefono">${data.cliente_telefono}</div>
</div>

<div class="almacen-zone">
  <div class="almacen">
    <div class="qr">
      <img src="${qrUrl}" />
    </div>
    <div class="info">
      <div class="nombre">${data.cliente_nombre}</div>
      ID CLIENTE: ${data.cliente_id}<br>
      BS ${data.monto_total_bs}<br>
      ÍTEMS: ${data.cantidad_items}<br>
      UBICACIÓN: ${data.ubicacion_fisica || '-'}
    </div>
  </div>
</div>

</body>
</html>
`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error(err);
    res.status(500).send('Error generando etiquetas');
  }
}
