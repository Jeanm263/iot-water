const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('./models/Usuario');
const sequelize = require('./config/database');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(cors());

sequelize.sync().then(() => console.log('Database connected'));

// Middleware para verificar el token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'secret', (err, usuario) => {
    if (err) return res.sendStatus(403);
    req.usuario = usuario;
    next();
  });
};

app.post('/register', async (req, res) => {
  const { nombre, apellido, correo, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 8);

  try {
    const usuario = await Usuario.create({nombre, apellido, correo, password: hashedPassword });
    res.status(201).json(usuario);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { correo, password } = req.body; 
  const usuario = await Usuario.findOne({ where: { correo } }); 
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
  
  const isMatch = await bcrypt.compare(password, usuario.password);
  if (!isMatch) return res.status(400).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ id: usuario.id }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

// Ejemplo de una ruta protegida no tocar esta ruta
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Esta es una ruta protegida', usuario: req.usuario });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
