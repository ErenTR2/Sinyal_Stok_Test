import { Router } from 'express';
import { getClient } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { checkAndNotifyCritical } from '../services/stock.js';
import { logAudit } from '../services/audit.js';

const router = Router();

// Stok düzeltme
router.post('/adjust', requireAuth, requireRole('depocu','yonetici'), async (req, res) => {
  const { warehouse_id, product_id, delta, reason } = req.body;
  if (!warehouse_id || !product_id || typeof delta !== 'number') {
    return res.status(400).json({ error: 'Eksik veya hatalı alan' });
  }
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(`
      INSERT INTO inventory_adjustments (warehouse_id, product_id, delta, reason, user_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [warehouse_id, product_id, delta, reason || null, req.user.id]);

    await client.query(`
      INSERT INTO warehouse_stocks (warehouse_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = GREATEST(warehouse_stocks.quantity + EXCLUDED.quantity, 0)
    `, [warehouse_id, product_id, delta]);

    await checkAndNotifyCritical(product_id, client);
    await client.query('COMMIT');
    await logAudit({ entity: 'adjustment', entity_id: 0, action: 'create', detail: { warehouse_id, product_id, delta, reason }, user_id: req.user.id });
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('adjust error', e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// İrsaliye (gelen/giden) - type: inbound | outbound
router.post('/receipt', requireAuth, requireRole('depocu','yonetici'), async (req, res) => {
  const { type, warehouse_id, items, description, date } = req.body;
  if (!['inbound', 'outbound'].includes(type) || !warehouse_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Eksik veya hatalı alan' });
  }
  const ts = date ? new Date(date) : new Date();
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: rrows } = await client.query(`
      INSERT INTO receipts (type, warehouse_id, occurred_at, description, created_by)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [type, warehouse_id, ts.toISOString(), description || null, req.user.id]);
    const rid = rrows[0].id;

    for (const it of items) {
      const qty = Number(it.qty || it.quantity || 0);
      if (!it.product_id || qty <= 0) continue;
      await client.query(`
        INSERT INTO receipt_items (receipt_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [rid, it.product_id, qty]);

      const delta = type === 'inbound' ? qty : -qty;
      await client.query(`
        INSERT INTO warehouse_stocks (warehouse_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = GREATEST(warehouse_stocks.quantity + EXCLUDED.quantity, 0)
      `, [warehouse_id, it.product_id, delta]);

      await checkAndNotifyCritical(it.product_id, client);
    }
    await client.query('COMMIT');
    await logAudit({ entity: 'receipt', entity_id: rid, action: 'create', detail: { type, warehouse_id, items, description, date: ts }, user_id: req.user.id });
    res.json({ ok: true, id: rid });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('receipt error', e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// Depolar arası transfer (tek tarih)
router.post('/transfer', requireAuth, requireRole('depocu','yonetici'), async (req, res) => {
  const { from_warehouse_id, to_warehouse_id, items, description, date } = req.body;
  if (!from_warehouse_id || !to_warehouse_id || from_warehouse_id === to_warehouse_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Eksik veya hatalı alan' });
  }
  const ts = date ? new Date(date) : new Date();
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const { rows: trows } = await client.query(`
      INSERT INTO transfers (from_warehouse_id, to_warehouse_id, occurred_at, description, created_by)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [from_warehouse_id, to_warehouse_id, ts.toISOString(), description || null, req.user.id]);
    const tid = trows[0].id;

    for (const it of items) {
      const qty = Number(it.qty || it.quantity || 0);
      if (!it.product_id || qty <= 0) continue;
      await client.query(`
        INSERT INTO transfer_items (transfer_id, product_id, quantity)
        VALUES ($1, $2, $3)
      `, [tid, it.product_id, qty]);

      // decrease from
      await client.query(`
        INSERT INTO warehouse_stocks (warehouse_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = GREATEST(warehouse_stocks.quantity + EXCLUDED.quantity, 0)
      `, [from_warehouse_id, it.product_id, -qty]);

      // increase to
      await client.query(`
        INSERT INTO warehouse_stocks (warehouse_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (warehouse_id, product_id) DO UPDATE SET quantity = GREATEST(warehouse_stocks.quantity + EXCLUDED.quantity, 0)
      `, [to_warehouse_id, it.product_id, qty]);

      await checkAndNotifyCritical(it.product_id, client);
    }
    await client.query('COMMIT');
    await logAudit({ entity: 'transfer', entity_id: tid, action: 'create', detail: { from_warehouse_id, to_warehouse_id, items, description, date: ts }, user_id: req.user.id });
    res.json({ ok: true, id: tid });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('transfer error', e);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

export default router;
