const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const suscripcion = require('../models/suscription');
const router = express.Router();

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Acceso denegado' });

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// 🔹 Ruta para registrar usuarios
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validaciones básicas
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "El usuario ya existe" });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Guardar usuario en MongoDB
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "Usuario registrado correctamente" });
    } catch (error) {
        console.error("❌ Error en el registro:", error);
        res.status(500).json({ message: "Error al registrar el usuario" });
    }
});

// 🔹 Ruta de login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verificar si el usuario existe
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

        // Generar el JWT
        const token = jwt.sign({ userId: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });

        res.json({ message: "Inicio de sesión exitoso", token });
    } catch (err) {
        console.error("❌ Error en el login:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// Obtener lista de usuarios (protegida por JWT)
router.get('/users', authenticateToken, async (req, res) => {
    try {
        const userList = await User.find({}, 'id email suscripcion');
        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// Actualizar la suscripción del usuario
router.post('/suscripcion', authenticateToken, async (req, res) => {
    const { userId, suscripcion } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { suscripcion },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Suscripción actualizada en el usuario', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
