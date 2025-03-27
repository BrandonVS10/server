const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5000;
const SECRET_KEY = "clave_secreta_super_segura"; // ⚠️ Cambia esto en producción

// Middleware
app.use(express.json());

const cors = require('cors');

app.use(cors({
  origin: 'https://pwa-m875.onrender.com', // Permitir solo este origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://albertovs:ola123@cluster0.6zb2ogr.mongodb.net/celeste', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Conectado a MongoDB');
}).catch((err) => {
  console.error('❌ Error al conectar con MongoDB', err);
});

app.use('/auth', authRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});
