import express from 'express';
import { sheets, SPREADSHEET_ID } from '../config/googleSheets.js';


const router = express.Router();
const spreadsheetId = process.env.SPREADSHEET_ID;

// Calcular cotización
router.post('/calcular', async (req, res) => {
  try {
    const {
      fob, flete, seguro, categoria,
      alto, ancho, profundo, peso,
      cliente, codigo
    } = req.body;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'cotizador!B11:F11',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[fob, flete, seguro, '', categoria]]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'cotizador!R23:T25',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [
          [alto, ancho, profundo],
          [],
          [peso]
        ]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'cotizador!Q16:Q18',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[cliente], [new Date().toLocaleDateString()], [codigo]]
      }
    });

    const r = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'cotizador!R26:R30'
    });

    res.json({
      total: r.data.values[0][0],
      pago1: r.data.values[3][0],
      pago2: r.data.values[4][0]
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error cotizador' });
  }
});

// Vista cliente
router.get('/vista-cliente', async (req, res) => {
  try {
    const r = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'cotizador!Q16:R30'
    });

    const v = r.data.values;

    res.json({
      cliente: v[0][0],
      fecha: v[1][0],
      codigo: v[2][0],
      mercaderia: v[3][0],
      valorProducto: v[4][0],
      impuestos: v[5][0],
      kg: v[8][0],
      transporte: v[9][0],
      total: v[10][1],
      pago1: v[13][1],
      pago2: v[14][1]
    });

  } catch (e) {
    res.status(500).json({ error: 'Error vista cliente' });
  }
});

export default router;
