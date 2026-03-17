const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/members
router.get('/', (_req, res) => {
  const members = db.prepare('SELECT * FROM members ORDER BY name ASC').all();
  res.json(members);
});

// POST /api/members  { name }
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const { lastInsertRowid } = db
    .prepare('INSERT INTO members (name) VALUES (?)')
    .run(name.trim());
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(lastInsertRowid);
  res.status(201).json(member);
});

// DELETE /api/members/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  if (!member) return res.status(404).json({ error: 'Member not found' });
  // Cascade delete handles steps via FK ON DELETE CASCADE
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
  res.json({ success: true });
});

module.exports = router;
