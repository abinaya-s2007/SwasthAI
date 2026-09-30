type DeliveryChannel = 'sms' | 'whatsapp';
type EmergencyContact = { id: string; name: string; phone: string; delivery_channel: DeliveryChannel };
type SOSMessage = { eventType: 'manual_sos' | 'fall' | 'heat_stress'; latitude?: number; longitude?: number };
export type NotificationAttempt = {
  contactId: string;
  contactName: string;
  channel: DeliveryChannel;
  status: 'queued' | 'failed' | 'not_configured';
  providerMessageId?: string;
  error?: string;
};

function e164(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+') && digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  const countryCode = (process.env.DEFAULT_PHONE_COUNTRY_CODE || '+91').replace(/\D/g, '');
  if (!trimmed.startsWith('+') && digits.length >= 7 && digits.length <= 12) return `+${countryCode}${digits}`;
  throw new Error('Enter the contact number with its country code, such as +91…');
}

function channelConfig(channel: DeliveryChannel): { from: string; to: (phone: string) => string } | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  if (channel === 'sms') {
    const from = process.env.TWILIO_FROM_NUMBER;
    return from ? { from, to: (phone) => phone } : null;
  }
  const from = process.env.TWILIO_WHATSAPP_FROM;
  return from ? {
    from: from.startsWith('whatsapp:') ? from : `whatsapp:${from}`,
    to: (phone) => `whatsapp:${phone}`,
  } : null;
}

function makeBody(event: SOSMessage, userName: string): string {
  const reason = event.eventType === 'fall' ? 'A possible fall was detected'
    : event.eventType === 'heat_stress' ? 'A possible heat-stress alert was triggered'
      : 'An SOS was triggered';
  const map = typeof event.latitude === 'number' && typeof event.longitude === 'number'
    ? `\nLocation: https://maps.google.com/?q=${event.latitude},${event.longitude}`
    : '\nThe phone could not provide a GPS location.';
  return `SwasthAI emergency alert: ${reason} for ${userName || 'your contact'}.${map}\nPlease contact them and call local emergency services if needed.`;
}

export async function notifyEmergencyContacts(
  contacts: EmergencyContact[],
  event: SOSMessage,
  userName: string,
): Promise<NotificationAttempt[]> {
  const body = makeBody(event, userName);
  return Promise.all(contacts.map(async (contact): Promise<NotificationAttempt> => {
    const result: NotificationAttempt = {
      contactId: contact.id,
      contactName: contact.name,
      channel: contact.delivery_channel,
      status: 'failed',
    };
    const config = channelConfig(contact.delivery_channel);
    if (!config) {
      result.status = 'not_configured';
      result.error = contact.delivery_channel === 'sms'
        ? 'Server SMS provider is not configured.'
        : 'Server WhatsApp provider is not configured.';
      return result;
    }

    try {
      const to = e164(contact.phone);
      const sid = process.env.TWILIO_ACCOUNT_SID!;
      const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const form = new URLSearchParams({ To: config.to(to), From: config.from, Body: body });
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
        signal: AbortSignal.timeout(12000),
      });
      const payload = await response.json().catch(() => ({})) as { sid?: string; message?: string; code?: number };
      if (!response.ok) {
        result.error = payload.message || `Message provider rejected the request (${response.status}).`;
        return result;
      }
      result.status = 'queued';
      result.providerMessageId = payload.sid;
      return result;
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Could not contact the message provider.';
      return result;
    }
  }));
}
