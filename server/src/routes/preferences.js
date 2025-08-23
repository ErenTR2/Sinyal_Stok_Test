import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/columns', requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT column_order FROM user_preferences WHERE user_id=$1`, [req.user.id]);
  res.json(rows[0]?.column_order || []);
});

router.post('/columns', requireAuth, async (req, res) => {
  const order = Array.isArray(req.body) ? req.body : (req.body.order || []);
  await query(`
    INSERT INTO user_preferences (user_id, column_order)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET column_order = EXCLUDED.column_order
  `, [req.user.id, order]);
  res.json({ ok: true });
});

export default router;
