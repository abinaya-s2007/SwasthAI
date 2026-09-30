import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';

export const profileRouter = Router();
const profileInput = z.object({
  fullName: z.string().trim().min(1).max(160).optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  sex: z.enum(['Male','Female','Other']).nullable().optional(),
  chronicConditions: z.array(z.string()).optional(),
  medications: z.array(z.object({ id: z.string().optional(), name: z.string(), dose: z.string(), frequency: z.string(), remindMe: z.boolean() })).optional(),
  allergies: z.array(z.string()).optional(),
  mobility: z.record(z.unknown()).optional(),
  consent: z.record(z.boolean()).optional(),
});

profileRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id,u.full_name,u.email,u.phone,u.date_of_birth,u.sex,u.created_at,
       p.chronic_conditions,p.medications,p.allergies,p.mobility,p.consent
       FROM users u LEFT JOIN user_health_profiles p ON p.user_id=u.id WHERE u.id=$1`, [req.userId]);
    if (!rows[0]) return res.status(404).json({ error: 'Profile not found' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

profileRouter.patch('/', async (req, res, next) => {
  try {
    const data = profileInput.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (data.fullName !== undefined || data.dateOfBirth !== undefined || data.sex !== undefined) {
        await client.query(`UPDATE users SET full_name=COALESCE($2,full_name), date_of_birth=COALESCE($3::date,date_of_birth), sex=COALESCE($4,sex) WHERE id=$1`,
          [req.userId, data.fullName ?? null, data.dateOfBirth ?? null, data.sex ?? null]);
      }
      await client.query(`UPDATE user_health_profiles SET
        chronic_conditions=COALESCE($2::jsonb,chronic_conditions), medications=COALESCE($3::jsonb,medications),
        allergies=COALESCE($4::jsonb,allergies), mobility=COALESCE($5::jsonb,mobility),
        consent=COALESCE($6::jsonb,consent), updated_at=now() WHERE user_id=$1`,
        [req.userId, data.chronicConditions && JSON.stringify(data.chronicConditions), data.medications && JSON.stringify(data.medications),
          data.allergies && JSON.stringify(data.allergies), data.mobility && JSON.stringify(data.mobility), data.consent && JSON.stringify(data.consent)]);
      await client.query('COMMIT');
      res.json({ ok: true });
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  } catch (error) { next(error); }
});

const contact = z.object({
  name: z.string().trim().min(1).max(160),
  relation: z.string().trim().max(80).default('Emergency contact'),
  phone: z.string().trim().min(5).max(32),
  deliveryChannel: z.enum(['sms', 'whatsapp']).default('sms'),
});
profileRouter.get('/contacts', async (req, res, next) => {
  try { const { rows } = await pool.query('SELECT id,name,relation,phone,delivery_channel AS "deliveryChannel",created_at FROM emergency_contacts WHERE user_id=$1 ORDER BY created_at', [req.userId]); res.json(rows); }
  catch (error) { next(error); }
});
profileRouter.post('/contacts', async (req, res, next) => {
  try {
    const data = contact.parse(req.body);
    const { rows } = await pool.query(
      `INSERT INTO emergency_contacts(user_id,name,relation,phone,delivery_channel) VALUES($1,$2,$3,$4,$5)
       RETURNING id,name,relation,phone,delivery_channel AS "deliveryChannel",created_at`,
      [req.userId,data.name,data.relation || 'Emergency contact',data.phone,data.deliveryChannel],
    );
    res.status(201).json(rows[0]);
  }
  catch (error) { next(error); }
});
profileRouter.delete('/contacts/:id', async (req, res, next) => {
  try { const result = await pool.query('DELETE FROM emergency_contacts WHERE id=$1 AND user_id=$2', [req.params.id,req.userId]); if (!result.rowCount) return res.status(404).json({ error: 'Contact not found' }); res.status(204).end(); }
  catch (error) { next(error); }
});
