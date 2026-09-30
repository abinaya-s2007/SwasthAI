ALTER TABLE emergency_contacts
  ADD COLUMN IF NOT EXISTS delivery_channel TEXT NOT NULL DEFAULT 'sms';

DO $$ BEGIN
  ALTER TABLE emergency_contacts
    ADD CONSTRAINT emergency_contacts_delivery_channel_check
    CHECK (delivery_channel IN ('sms', 'whatsapp'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE sos_events
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'manual_sos';

DO $$ BEGIN
  ALTER TABLE sos_events
    ADD CONSTRAINT sos_events_event_type_check
    CHECK (event_type IN ('manual_sos', 'fall', 'heat_stress'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sos_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sos_event_id UUID NOT NULL REFERENCES sos_events(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES emergency_contacts(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp')),
  recipient_phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'failed', 'not_configured')),
  provider_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sos_notifications_event_idx ON sos_notifications(sos_event_id);
