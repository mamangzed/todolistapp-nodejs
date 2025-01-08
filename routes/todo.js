const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const {db} = require('../utils/db')
const {checkToken} = require('./auth')
const router = express.Router();
router.use(bodyParser.json());
require('dotenv').config()

db.connect((err) => {
  if (err) throw err;
  console.log('Database connected');
});



router.post('/checklists', checkToken, (req, res) => {
  const { name } = req.body;
  const user_id = req.user.id;
  if(!name){
    return res.status(400).json({message: 'Nama Checklist tidak boleh kosong'});
  }

  const sql = 'INSERT INTO checklists (user_id, name) VALUES (?, ?)';
  db.query(sql, [user_id, name], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Checklist dengan nama ' + name + ' Berhasil dibuat', data: {id: result.insertId} });
  });
});

router.delete('/checklists/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  if(!id){
    return res.status(400).json({message: 'Checklist id tidak boleh kosong, silahkan lengkapi parameter'})
  }
  const sql = 'DELETE FROM checklists WHERE id = ? AND user_id = ?';

  db.query(sql, [id, user_id], (err,result) => {
    if (err) return res.status(500).json({ error: err.message });
    if(result.affectedRows === 0) return res.status(404).json({message: 'Data yang kamu cari tidak ditemukan'})
    res.json({ message: 'Checlist item berhasil dihapus' });
  });
});

router.get('/checklists', checkToken, (req, res) => {
  const user_id = req.user.id;
  const sql = 'SELECT * FROM checklists WHERE user_id = ?';
  db.query(sql, [user_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({data: results});
  });
});

router.get('/checklists/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const checklistSql = 'SELECT * FROM checklists WHERE id = ? AND user_id = ?';
  const itemsSql = 'SELECT * FROM items WHERE checklist_id = ?';

  db.query(checklistSql, [id, user_id], (err, checklist) => {
    if (err) return res.status(500).json({ error: err.message });
    if (checklist.length === 0) return res.status(404).json({ message: 'Data checklist tidak ditemukan' });

    db.query(itemsSql, [id], (err, items) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({data: { checklist: checklist[0], items }});
    });
  });
});

router.post('/checklists/:id/items', checkToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const user_id = req.user.id;
  if(!id || !name){
    return res.status(400).json({message: 'Silahkan lengkapi parameter'})
  }

  const checklistSql = 'SELECT * FROM checklists WHERE id = ? AND user_id = ?';
  db.query(checklistSql, [id, user_id], (err, checklist) => {
    if (err) return res.status(500).json({ error: err.message });
    if (checklist.length === 0) return res.status(404).json({ message: 'Checlist kamu tidak ditemukan' });

    const sql = 'INSERT INTO items (checklist_id, name) VALUES (?, ?)';
    db.query(sql, [id, name], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Item todo berhasil ditambahkan ', data: {id: result.insertId} });
    });
  });
});

router.get('/items/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM items WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.length === 0) return res.status(404).json({ message: 'Todo item tidak ditemukan' });
    res.json(result[0]);
  });
});

router.put('/items/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if(!id || !name){
    return res.status(400).json({message: 'Silahkan lengkapi parameter'})
  }
  const sql = 'UPDATE items SET name = ? WHERE id = ?';
  db.query(sql, [name, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Todo list kamu berhasil diupdate' });
  });
});

router.patch('/items/:id/status', checkToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if(!id || !status) {
    return res.json(400).message({message: 'Silahkan lengkapi parameter'})
  }
  if (status !== 'pending' && status !== 'completed' && status !== 'cancel') {
    return res.status(400).json({ error: 'Status harus berupa pending,cancel atau completed' });
  }
  const sql = 'UPDATE items SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err,result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Todo status berhasil diupdate' });
  });
});

router.delete('/items/:id', checkToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM items WHERE id = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Todo items berhasil didelete' });
  });
});

module.exports = router;
