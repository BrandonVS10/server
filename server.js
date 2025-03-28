require('dotenv').config(); // Cargar variables de entorno desde un archivo .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes'); // Asegúrate de tener las rutas correctas

const app = express();
const port = process.env.PORT || 5000;

// Acceder a las claves desde las variables de entorno
const publicKey = process.env.PUBLIC_KEY;
const privateKey = process.env.PRIVATE_KEY;

console.log('Clave Pública:', publicKey);
console.log('Clave Privada:', privateKey);

// Middleware
app.use(express.json());
app.use(cors()); // Habilitar CORS

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((err) => {
  console.error('❌ Error al conectar con MongoDB', err);
});

// Usar las rutas de autenticación
app.use('/auth', authRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});

