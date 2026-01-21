import 'dotenv/config'; // 👈 ESTA LÍNEA ES LA CLAVE

import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});

app.get('/', (req, res) => {
  res.send('Bolivia Imports API is running');
});
