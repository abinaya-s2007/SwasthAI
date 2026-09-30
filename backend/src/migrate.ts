import 'dotenv/config';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pool } from './db';

async function migrate() {
  const migrationsDir = join(__dirname, '..', 'migrations');
  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  const baseline = await pool.query('SELECT to_regclass($1) AS users_table', ['public.users']);
  if (baseline.rows[0]?.users_table) {
    await pool.query(`INSERT INTO schema_migrations(name) VALUES('001_initial_schema.sql') ON CONFLICT DO NOTHING`);
  }
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith('.sql')).sort();
  for (const name of files) {
    const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
    if (applied.rowCount) continue;
    const sql = await readFile(join(migrationsDir, name), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
      await client.query('COMMIT');
      console.log(`Applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  console.log('Database schema is up to date.');
  await pool.end();
}
migrate().catch(async (error) => { console.error(error); await pool.end(); process.exit(1); });
