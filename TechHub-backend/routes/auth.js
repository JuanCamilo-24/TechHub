const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// REGISTRO
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre, apellido, carrera } = req.body;
    
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ success: false, message: 'El email ya está registrado' });
    }
    
    // Crear nuevo usuario
    const nuevoUsuario = new User({ email, password, nombre, apellido, carrera });
    await nuevoUsuario.save();
    
    // Generar token
    const token = jwt.sign({ id: nuevoUsuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña requeridos' });
    }
    
    // Buscar usuario
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }
    
    // Verificar contraseña
    const esValida = await usuario.comparePassword(password);
    if (!esValida) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }
    
    // Generar token
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        carrera: usuario.carrera
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//  VERIFICAR TOKEN
router.get('/verify', verificarToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.usuarioId).select('-password');
    res.json({ success: true, usuario });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;