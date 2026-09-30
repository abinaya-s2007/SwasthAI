import express, { ErrorRequestHandler } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { requireAuth } from './auth';
import { authRouter } from './routes/auth';
import { profileRouter } from './routes/profile';
import { vitalsRouter } from './routes/vitals';
import { alertsRouter } from './routes/alerts';
import { sosRouter } from './routes/sos';
import { weatherRouter } from './routes/weather';

export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN === '*' ? '*' : (process.env.CORS_ORIGIN || '').split(',').filter(Boolean) }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRouter);
app.use('/profile', requireAuth, profileRouter);
app.use('/vitals', requireAuth, vitalsRouter);
app.use('/alerts', requireAuth, alertsRouter);
app.use('/sos', requireAuth, sosRouter);
app.use('/weather', requireAuth, weatherRouter);

const errors: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) return res.status(400).json({ error: 'Invalid request', details: error.issues });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
};
app.use(errors);
