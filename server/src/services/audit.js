import { query } from '../db.js';

export async function logAudit({ entity, entity_id, action, detail, user_id }) {
  await query(`
    INSERT INTO audit_logs (entity, entity_id, action, detail, user_id)
    VALUES ($1, $2, $3, $4, $5)
  `, [entity, entity_id, action, detail ? JSON.stringify(detail) : null, user_id]);
}
