import { query } from '../db.js';
import { sendCriticalStockEmail } from '../utils/email.js';

/** Compute global stock for a product (respect include_in_global flag) */
export async function getGlobalStock(productId) {
  const { rows } = await query(`
    SELECT COALESCE(SUM(ws.quantity), 0) as qty
    FROM warehouse_stocks ws
    JOIN warehouses w ON w.id = ws.warehouse_id
    WHERE ws.product_id = $1 AND w.include_in_global = true
  `, [productId]);
  return Number(rows[0]?.qty || 0);
}

/** After a stock change, check thresholds and notify */
export async function checkAndNotifyCritical(productId, client=null) {
  const q = client ? (client.query.bind(client)) : query;
  const { rows: productRows } = await q(`SELECT id, name, critical_global, sku FROM products WHERE id=$1`, [productId]);
  if (!productRows[0]) return;
  const { id: pid, name, critical_global, sku } = productRows[0];

  // Collect warnings
  const global = await getGlobalStock(pid);
  const globalLines = [];
  if (critical_global !== null && global <= critical_global) {
    globalLines.push(`${name} (SKU: ${sku || '-'}) global stok: ${global} (kritik: ${critical_global})`);
  }

  const { rows: perRows } = await q(`
    SELECT ws.quantity, pw.critical as critical, w.name as wname, w.id as wid
    FROM warehouse_stocks ws
    JOIN warehouses w ON w.id = ws.warehouse_id
    LEFT JOIN per_warehouse_critical pw ON pw.product_id = ws.product_id AND pw.warehouse_id = ws.warehouse_id
    WHERE ws.product_id = $1
  `, [pid]);

  const perWarehouseLines = new Map(); // wid -> [lines]
  for (const r of perRows) {
    if (r.critical !== null && Number(r.quantity) <= Number(r.critical)) {
      const line = `${name} - ${r.wname} depo stok: ${r.quantity} (kritik: ${r.critical})`;
      if (!perWarehouseLines.has(r.wid)) perWarehouseLines.set(r.wid, []);
      perWarehouseLines.get(r.wid).push(line);
    }
  }

  // admin emails (always receive global + all details)
  const { rows: adminRows } = await q(`
    SELECT u.email FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE r.name = 'yonetici' AND u.verified = true
  `);
  const adminEmails = adminRows.map(r=>r.email);

  // Send global warning to admins only
  if (globalLines.length > 0 && adminEmails.length > 0) {
    await sendCriticalStockEmail(adminEmails.join(','), globalLines);
  }

  // Notify depocu(s) who are assigned to affected warehouses
  if (perWarehouseLines.size > 0) {
    for (const [wid, lines] of perWarehouseLines.entries()) {
      const { rows: depocuRows } = await q(`
        SELECT u.email
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id AND r.name = 'depocu'
        JOIN user_profiles up ON up.user_id = u.id
        WHERE up.assigned_warehouse_id = $1 AND u.verified = true
      `, [wid]);
      const recipients = [...adminEmails, ...depocuRows.map(r=>r.email)];
      if (recipients.length > 0) {
        await sendCriticalStockEmail(recipients.join(','), lines);
      }
    }
  }
}
