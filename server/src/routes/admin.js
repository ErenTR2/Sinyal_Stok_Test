import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/assign-role', requireAuth, requireRole('yonetici'), async (req, res) => {
  const { user_id, role } = req.body; // role: 'depocu' | 'kullanici' | 'yonetici'
  const { rows: r } = await query(`SELECT id FROM roles WHERE name=$1`, [role]);
  if (!r[0]) return res.status(400).json({ error: 'role_not_found' });
  await query(`DELETE FROM user_roles WHERE user_id=$1`, [user_id]);
  await query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`, [user_id, r[0].id]);
  res.json({ ok: true });
});

router.post('/assign-warehouse', requireAuth, requireRole('yonetici'), async (req, res) => {
  const { user_id, warehouse_id } = req.body;
  await query(`
    INSERT INTO user_profiles (user_id, assigned_warehouse_id)
    VALUES ($1, $2)
    ON CONFLICT (user_id) DO UPDATE SET assigned_warehouse_id = EXCLUDED.assigned_warehouse_id
  `, [user_id, warehouse_id]);
  res.json({ ok: true });
});

export default router;
