import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';

export const alertsRouter = Router();
alertsRouter.get('/', async (req, res, next) => {
  try {
    const query = z.object({ severity: z.enum(['High','Medium','Low']).optional(), limit: z.coerce.number().int().min(1).max(200).default(50) }).parse(req.query);
    const { rows } = await pool.query(`SELECT id,title,severity,description,what_to_do,created_at,acknowledged_at FROM alerts
      WHERE user_id=$1 AND ($2::text IS NULL OR severity=$2) ORDER BY created_at DESC LIMIT $3`, [req.userId,query.severity ?? null,query.limit]);
    res.json(rows);
  } catch (error) { next(error); }
});
alertsRouter.post('/', async (req, res, next) => {
  try {
    const data = z.object({ title: z.string().trim().min(1).max(200), severity: z.enum(['High','Medium','Low']), description: z.string().max(4000), whatToDo: z.array(z.string().max(500)).default([]) }).parse(req.body);
    const { rows } = await pool.query(`INSERT INTO alerts(user_id,title,severity,description,what_to_do) VALUES($1,$2,$3,$4,$5)
      RETURNING id,title,severity,description,what_to_do,created_at,acknowledged_at`, [req.userId,data.title,data.severity,data.description,JSON.stringify(data.whatToDo)]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});
alertsRouter.post('/:id/acknowledge', async (req, res, next) => {
  try {
    const { rows } = await pool.query('UPDATE alerts SET acknowledged_at=COALESCE(acknowledged_at,now()) WHERE id=$1 AND user_id=$2 RETURNING id,acknowledged_at', [req.params.id,req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Alert not found' }); res.json(rows[0]);
  } catch (error) { next(error); }
});
