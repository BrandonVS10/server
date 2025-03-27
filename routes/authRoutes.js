const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const suscripcion = require('../models/suscription');

const router = express.Router();

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

        res.json({ message: "Inicio de sesión exitoso", user });
    } catch (err) {
        console.error("❌ Error en el login:", err);
        res.status(500).json({ message: "Error en el servidor" });
    }
});

// Obtener lista de usuarios
router.get('/users', async (req, res) => {
    try {
        const userList = await User.find({}, 'id email suscripcion');
        res.status(200).json(userList);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// Actualizar la suscripción del usuario
router.post('/suscripcion', async (req, res) => {
    console.log('Solicitud para /suscripcion recibida');
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

        // Enviar notificación de prueba
        await sendPush(suscripcion, user.email);

        res.status(200).json({ message: 'Suscripción actualizada en el usuario', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Enviar notificación con la suscripción del usuario
router.post('/suscripcionMod', async (req, res) => {
    const { suscripcion, mensaje } = req.body;

    try {
        await sends(suscripcion, mensaje);

        res.status(200).json({ message: 'Mensaje enviado' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
