import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';

export const vitalsRouter = Router();
const reading = z.object({
  heartRate: z.number().int().min(0).max(300).nullable().optional(),
  spo2: z.number().min(0).max(100).nullable().optional(),
  skinTemp: z.number().min(-20).max(100).nullable().optional(),
  steps: z.number().int().min(0).nullable().optional(),
  recordedAt: z.string().datetime().optional(),
  source: z.string().trim().min(1).max(80).default('mobile'),
});

vitalsRouter.post('/', async (req, res, next) => {
  try {
    const list = z.array(reading).min(1).max(500).or(reading).parse(req.body);
    const items = Array.isArray(list) ? list : [list];
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saved = [];
      for (const v of items) {
        const { rows } = await client.query(`INSERT INTO vital_readings(user_id,heart_rate,spo2,skin_temp,steps,recorded_at,source)
          VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id,heart_rate,spo2,skin_temp,steps,recorded_at,source`,
          [req.userId,v.heartRate ?? null,v.spo2 ?? null,v.skinTemp ?? null,v.steps ?? null,v.recordedAt ?? new Date().toISOString(),v.source]);
        saved.push(rows[0]);
      }
      await client.query('COMMIT');
      res.status(201).json(saved);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } catch (error) { next(error); }
});

vitalsRouter.get('/', async (req, res, next) => {
  try {
    const query = z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional(), limit: z.coerce.number().int().min(1).max(500).default(100) }).parse(req.query);
    const { rows } = await pool.query(`SELECT id,heart_rate,spo2,skin_temp,steps,recorded_at,source FROM vital_readings
      WHERE user_id=$1 AND ($2::timestamptz IS NULL OR recorded_at >= $2) AND ($3::timestamptz IS NULL OR recorded_at <= $3)
      ORDER BY recorded_at DESC LIMIT $4`, [req.userId,query.from ?? null,query.to ?? null,query.limit]);
    res.json(rows);
  } catch (error) { next(error); }
});
