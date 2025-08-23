import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(`SELECT id, name, short_code, include_in_global FROM warehouses ORDER BY name ASC`);
  res.json(rows);
});

router.post('/', requireAuth, requireRole('yonetici'), async (req, res) => {
  const { name, short_code, include_in_global } = req.body;
  if (!name || !short_code) return res.status(400).json({ error: 'Eksik alan' });
  const { rows } = await query(`
    INSERT INTO warehouses (name, short_code, include_in_global) VALUES ($1, $2, $3) RETURNING id
  `, [name, short_code, include_in_global !== false]);
  res.json({ ok: true, id: rows[0].id });
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { rows: wrows } = await query(`SELECT id, name, short_code, include_in_global FROM warehouses WHERE id=$1`, [id]);
  if (!wrows[0]) return res.status(404).json({ error: 'not_found' });
  const { rows: stocks } = await query(`
    SELECT p.id as product_id, p.name, ws.quantity
    FROM warehouse_stocks ws
    JOIN products p ON p.id = ws.product_id
    WHERE ws.warehouse_id=$1
    ORDER BY p.name ASC
  `, [id]);
  res.json({ ...wrows[0], stocks });
});

export default router;
