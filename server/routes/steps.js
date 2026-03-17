const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/steps?member_id=&from=&to=
router.get('/', (req, res) => {
  const { member_id, from, to } = req.query;

  const clauses = [
    'SELECT s.*, m.name AS member_name',
    'FROM steps s',
    'JOIN members m ON s.member_id = m.id',
    'WHERE 1=1',
  ];
  const params = [];

  if (member_id) { clauses.push('AND s.member_id = ?'); params.push(member_id); }
  if (from)      { clauses.push('AND s.date >= ?');     params.push(from); }
  if (to)        { clauses.push('AND s.date <= ?');     params.push(to); }

  clauses.push('ORDER BY s.date DESC, m.name ASC');

  const steps = db.prepare(clauses.join(' ')).all(...params);
  res.json(steps);
});

// POST /api/steps  { member_id, date, steps, token? }
// Also supports Authorization: Bearer <token> header (for iOS Shortcuts)
router.post('/', (req, res) => {
  // Token auth — only enforced when API_TOKEN is set in env
  const { member_id, date, steps, token } = req.body;
  const authHeader = req.headers.authorization;
  const providedToken =
    token ||
    (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (process.env.API_TOKEN && providedToken && providedToken !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Validation
  if (!member_id || !date || steps === undefined || steps === null) {
    return res.status(400).json({ error: 'member_id, date, and steps are required' });
  }

  const stepsInt = parseInt(steps, 10);
  if (isNaN(stepsInt) || stepsInt < 0) {
    return res.status(400).json({ error: 'steps must be a non-negative integer' });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
  }

  const member = db.prepare('SELECT id FROM members WHERE id = ?').get(member_id);
  if (!member) return res.status(404).json({ error: 'Member not found' });

  // Upsert: update if entry already exists for that member+date
  const existing = db
    .prepare('SELECT id FROM steps WHERE member_id = ? AND date = ?')
    .get(member_id, date);

  let entry;
  if (existing) {
    db.prepare('UPDATE steps SET steps = ? WHERE id = ?').run(stepsInt, existing.id);
    entry = db.prepare('SELECT * FROM steps WHERE id = ?').get(existing.id);
  } else {
    const { lastInsertRowid } = db
      .prepare('INSERT INTO steps (member_id, date, steps) VALUES (?, ?, ?)')
      .run(member_id, date, stepsInt);
    entry = db.prepare('SELECT * FROM steps WHERE id = ?').get(lastInsertRowid);
  }

  res.status(201).json({ success: true, entry });
});

module.exports = router;
