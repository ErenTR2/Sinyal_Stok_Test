import fs from 'fs';
import { query } from '../db.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: npm run db:init -- <path-to-sql>');
  process.exit(1);
}
const sql = fs.readFileSync(file, 'utf-8');
query(sql).then(()=>{
  console.log('SQL executed successfully.');
  process.exit(0);
}).catch(err=>{
  console.error(err);
  process.exit(1);
});
