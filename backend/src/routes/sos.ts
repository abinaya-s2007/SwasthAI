import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../db';
import { notifyEmergencyContacts } from '../notifications';

export const sosRouter = Router();
sosRouter.get('/', async (req, res, next) => {
  try { const { rows } = await pool.query('SELECT id,status,event_type,latitude,longitude,note,created_at,resolved_at FROM sos_events WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100', [req.userId]); res.json(rows); }
  catch (error) { next(error); }
});
sosRouter.post('/', async (req, res, next) => {
  try {
    const data = z.object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      note: z.string().max(2000).optional(),
      eventType: z.enum(['manual_sos', 'fall', 'heat_stress']).default('manual_sos'),
    }).refine((v) => (v.latitude === undefined) === (v.longitude === undefined), { message: 'Provide both coordinates or neither' }).parse(req.body);
    const client = await pool.connect();
    let event: Record<string, unknown>;
    let contacts: Array<{ id: string; name: string; phone: string; delivery_channel: 'sms' | 'whatsapp' }>;
    let userName = 'SwasthAI user';
    try {
      await client.query('BEGIN');
      const inserted = await client.query(
        `INSERT INTO sos_events(user_id,event_type,latitude,longitude,note) VALUES($1,$2,$3,$4,$5)
         RETURNING id,status,event_type,latitude,longitude,note,created_at,resolved_at`,
        [req.userId,data.eventType,data.latitude ?? null,data.longitude ?? null,data.note ?? null],
      );
      event = inserted.rows[0];
      const savedContacts = await client.query(
        'SELECT id,name,phone,delivery_channel FROM emergency_contacts WHERE user_id=$1 ORDER BY created_at',
        [req.userId],
      );
      contacts = savedContacts.rows;
      const profile = await client.query('SELECT full_name FROM users WHERE id=$1', [req.userId]);
      userName = profile.rows[0]?.full_name || userName;
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    const notifications = await notifyEmergencyContacts(contacts, data, userName);
    for (const notification of notifications) {
      try {
        await pool.query(
          `INSERT INTO sos_notifications(sos_event_id,contact_id,channel,recipient_phone,status,provider_message_id,error_message)
           VALUES($1,$2,$3,$4,$5,$6,$7)`,
          [event.id,notification.contactId,notification.channel,
            contacts.find((contact) => contact.id === notification.contactId)?.phone ?? '',
            notification.status,notification.providerMessageId ?? null,notification.error ?? null],
        );
      } catch (error) {
        // Keep a recorded SOS response usable even if the notification audit table is temporarily unavailable.
        console.error('Could not save SOS notification audit entry:', error);
      }
    }
    res.status(201).json({
      event,
      notifications,
      message: contacts.length ? 'Emergency contact notification attempts completed.' : 'No emergency contacts are saved to this account.',
    });
  } catch (error) { next(error); }
});
sosRouter.patch('/:id', async (req, res, next) => {
  try {
    const { status } = z.object({ status: z.enum(['resolved','cancelled']) }).parse(req.body);
    const { rows } = await pool.query(`UPDATE sos_events SET status=$3,resolved_at=now() WHERE id=$1 AND user_id=$2 AND status='active'
      RETURNING id,status,latitude,longitude,note,created_at,resolved_at`, [req.params.id,req.userId,status]);
    if (!rows[0]) return res.status(404).json({ error: 'Active SOS event not found' }); res.json(rows[0]);
  } catch (error) { next(error); }
});
