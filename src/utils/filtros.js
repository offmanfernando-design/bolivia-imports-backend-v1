function normalizar(texto) {
  return String(texto || '').toLowerCase().trim();
}

export function filtrarTexto(entrega, q) {
  if (!q) return true;
  q = normalizar(q);

  return (
    normalizar(entrega.cliente_nombre).includes(q) ||
    normalizar(entrega.cliente_telefono).includes(q) ||
    normalizar(entrega.tracking).includes(q)
  );
}

export function filtrarTrackingLast4(entrega, last4) {
  if (!last4) return true;
  return String(entrega.tracking || '').slice(-4) === String(last4);
}

export function filtrarFecha(entrega, estadoCobro, desde, hasta) {
  if (!desde && !hasta) return true;

  let fechaBase;

  switch (estadoCobro) {
    case 'pendiente':
      fechaBase = entrega.fecha_creacion_entrega;
      break;
    case 'avisado':
      fechaBase = entrega.fecha_ultima_actualizacion;
      break;
    case 'pagado':
      fechaBase = entrega.fecha_entrega;
      break;
    default:
      return false;
  }

  if (!fechaBase) return false;

  const fecha = new Date(fechaBase);
  if (desde && fecha < new Date(desde)) return false;
  if (hasta && fecha > new Date(hasta)) return false;

  return true;
}
