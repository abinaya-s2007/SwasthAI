import 'dotenv/config';
import { app } from './app';
import { pool } from './db';

const port = Number(process.env.PORT || 4000);
if (!process.env.DATABASE_URL || !process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set DATABASE_URL and a JWT_SECRET of at least 32 characters in backend/.env');
}
const server = app.listen(port, () => console.log(`SwasthAI API listening on port ${port}`));
async function shutdown() { server.close(); await pool.end(); process.exit(0); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
