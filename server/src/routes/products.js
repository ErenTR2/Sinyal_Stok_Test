import { Router } from 'express';
import { query } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { checkAndNotifyCritical } from '../services/stock.js';
import { logAudit } from '../services/audit.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const search = (req.query.q || '').trim();
  let base = `SELECT id, name, location, barcode, sku, critical_global FROM products`;
  const params = [];
  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    base += ` WHERE LOWER(name) LIKE $${params.length}`;
  }
  base += ` ORDER BY name ASC LIMIT 500`;
  const { rows } = await query(base, params);
  return res.json(rows);
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { rows } = await query(`SELECT * FROM products WHERE id=$1`, [id]);
  if (!rows[0]) return res.status(404).json({ error: 'not_found' });

  const { rows: codes } = await query(`SELECT code FROM product_codes WHERE product_id=$1`, [id]);
  const { rows: stocks } = await query(`
    SELECT ws.warehouse_id, w.name, w.short_code, ws.quantity, pw.critical
    FROM warehouse_stocks ws
    JOIN warehouses w ON w.id = ws.warehouse_id
    LEFT JOIN per_warehouse_critical pw ON pw.product_id = ws.product_id AND pw.warehouse_id = ws.warehouse_id
    WHERE ws.product_id=$1
  `, [id]);

  return res.json({ ...rows[0], codes: codes.map(c=>c.code), stocks });
});

router.post('/', requireAuth, requireRole('yonetici'), async (req, res) => {
  const { name, location, barcode, sku, codes, critical_global } = req.body;
  if (!name) return res.status(400).json({ error: 'name_required' });
  const { rows } = await query(`
    INSERT INTO products (name, location, barcode, sku, critical_global)
    VALUES ($1, $2, $3, $4, $5) RETURNING id
  `, [name, location || null, barcode || null, sku || null, critical_global ?? null]);
  const productId = rows[0].id;
  if (Array.isArray(codes)) {
    for (const c of codes) {
      await query(`INSERT INTO product_codes (product_id, code) VALUES ($1, $2)`, [productId, c]);
    }
  }
  await logAudit({ entity: 'product', entity_id: productId, action: 'create', detail: { name, location, barcode, sku, codes }, user_id: req.user.id });
  return res.json({ ok: true, id: productId });
});

router.put('/:id/critical', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { critical_global, perWarehouse } = req.body;
  await query(`UPDATE products SET critical_global=$1 WHERE id=$2`, [critical_global ?? null, id]);
  if (Array.isArray(perWarehouse)) {
    for (const pw of perWarehouse) {
      await query(`
        INSERT INTO per_warehouse_critical (product_id, warehouse_id, critical)
        VALUES ($1, $2, $3)
        ON CONFLICT (product_id, warehouse_id) DO UPDATE SET critical = EXCLUDED.critical
      `, [id, pw.warehouse_id, pw.critical]);
    }
  }
  await logAudit({ entity: 'product', entity_id: Number(id), action: 'update_critical', detail: { critical_global, perWarehouse }, user_id: req.user.id });
  return res.json({ ok: true });
});

router.post('/:id/recalc', requireAuth, async (req, res) => {
  await checkAndNotifyCritical(req.params.id);
  await logAudit({ entity: 'product', entity_id: Number(id), action: 'update_critical', detail: { critical_global, perWarehouse }, user_id: req.user.id });
  return res.json({ ok: true });
});

export default router;
