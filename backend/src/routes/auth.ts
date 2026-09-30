import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../db';

export const authRouter = Router();
const registrationCredentials = z.object({
  fullName: z.string().trim().min(1).max(160).optional(),
  email: z.string().email().transform((v) => v.toLowerCase()).optional(),
  phone: z.string().trim().min(5).max(32).optional(),
  password: z.string().min(8).max(128),
  dateOfBirth: z.string().date().optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
}).refine((v) => Boolean(v.email || v.phone), { message: 'Email or phone is required' });

function issueToken(userId: string) {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
  return jwt.sign({}, process.env.JWT_SECRET!, { subject: userId, expiresIn });
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = registrationCredentials.parse(req.body);
    const hash = await bcrypt.hash(input.password, 12);
    const { rows } = await pool.query(
      `INSERT INTO users(full_name,email,phone,password_hash,date_of_birth,sex) VALUES($1,$2,$3,$4,$5,$6)
       RETURNING id,full_name,email,phone,date_of_birth,sex,created_at`,
      [input.fullName || 'SwasthAI Member', input.email ?? null, input.phone ?? null, hash, input.dateOfBirth ?? null, input.sex ?? null],
    );
    await pool.query('INSERT INTO user_health_profiles(user_id) VALUES($1)', [rows[0].id]);
    res.status(201).json({ user: rows[0], token: issueToken(rows[0].id) });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'An account with that email or phone already exists' });
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = z.object({ identifier: z.string().min(1), password: z.string().min(1) }).parse(req.body);
    const { rows } = await pool.query(
      `SELECT id,full_name,email,phone,date_of_birth,sex,password_hash,created_at FROM users WHERE lower(email)=lower($1) OR phone=$1 LIMIT 1`,
      [input.identifier],
    );
    if (!rows[0] || !(await bcrypt.compare(input.password, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const { password_hash: _, ...user } = rows[0];
    res.json({ user, token: issueToken(user.id) });
  } catch (error) { next(error); }
});
