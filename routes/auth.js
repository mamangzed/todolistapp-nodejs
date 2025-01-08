const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const { validEmail } = require('../utils/validator');
const { db } = require('../utils/db');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
const SECRET_KEY = process.env.JWT_SECRET || 'jwtsecret';
const REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || 'refreshsecret';

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected');
});

const loginRoute = express.Router();
const registerRoute = express.Router();
const refreshRoute = express.Router();

registerRoute.post('/register', async (req, res) => {
  const { device_id, email, password, first_name, last_name } = req.body;
  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ message: 'Silahkan lengkapi semua formulir' });
  }
  if (!validEmail(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }
  const passwordHash = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (device_id, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [device_id, email, passwordHash, first_name, last_name], (err) => {
    if (err) {
      delete err.sql;
      delete err.sqlMessage;  
      return res.status(500).json({ message: 'User gagal dibuat', error: err });
    }
    res.status(201).json({ message: `Pembuatan user berhasil` });
  });
});

loginRoute.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password tidak boleh kosong' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Kesalahan server', error: err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const user = results[0];
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: user.id, email: user.email }, REFRESH_SECRET_KEY, { expiresIn: '7d' });

    const updateToken = 'UPDATE users SET refresh_token = ? WHERE id = ?';
    db.query(updateToken, [refreshToken, user.id], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Gagal menyimpan refresh token', error: err.message });
      }
      res.json({ accessToken, refreshToken });
    });
  });
});

refreshRoute.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Parameter tidak lengkap' });
  }

  jwt.verify(refreshToken, REFRESH_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Refresh token tidak valid' });
    }

    const sql = 'SELECT * FROM users WHERE id = ? AND refresh_token = ?';
    db.query(sql, [user.id, refreshToken], (err, results) => {
      if (err || results.length === 0) {
        return res.status(403).json({ message: 'Refresh token tidak valid' });
      }

      const accessToken = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: '12m' });
      res.json({ accessToken });
    });
  });
});

function checkToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Akses ditolak' });

  jwt.verify(token.replace('Bearer ', ''), SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa' });
    req.user = user;
    next();
  });
}

module.exports = { registerRoute, loginRoute, refreshRoute, checkToken };
