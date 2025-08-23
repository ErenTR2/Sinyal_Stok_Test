import { query } from '../db.js';

export async function injectUserRoles(req, res, next) {
  if (!req.user) return next();
  const { rows } = await query(
    `SELECT r.name FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = $1`,
    [req.user.id]
  );
  req.user.roles = rows.map(r => r.name);
  next();
}
