# SwasthAI backend

Standalone Node.js, TypeScript, Express, and PostgreSQL API for the SwasthAI mobile app. It is intentionally isolated from the React Native package and does not handle Bluetooth; the phone remains responsible for communicating with hardware and can upload readings over HTTP when online.

## Setup

Requires Node.js 22.11+ and PostgreSQL 14+.

1. Create a PostgreSQL database, for example `swasthai`.
2. From this directory, install dependencies: `npm install`.
3. Copy `.env.example` to `.env`, then set `DATABASE_URL`, a random `JWT_SECRET` of at least 32 characters, and `OPENWEATHER_API_KEY`. Keep `.env` private.
4. Apply database migrations: `npm run db:migrate` (run this again after pulling schema changes).
5. Start the development server: `npm run dev` (or `npm run build` then `npm start`).
6. Check `http://localhost:4000/health` for `{ "status": "ok" }`.

## API

All data routes require `Authorization: Bearer <token>`. Register and login return a JWT.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Liveness check |
| GET | `/weather/current?lat=<lat>&lon=<lon>` | Current conditions for coordinates, in metric units; alternatively pass `city=<name>` when GPS is unavailable |
| POST | `/auth/register` | Create account (`fullName`, `email` or `phone`, `password`) |
| POST | `/auth/login` | Login (`identifier`, `password`) |
| GET, PATCH | `/profile` | Read/update personal and health profile |
| GET, POST | `/profile/contacts` | List/add emergency contacts |
| DELETE | `/profile/contacts/:id` | Remove an owned contact |
| GET, POST | `/vitals` | Query/upload readings; POST accepts one reading or a batch |
| GET, POST | `/alerts` | Read alerts or upload an alert |
| POST | `/alerts/:id/acknowledge` | Acknowledge an owned alert |
| GET, POST | `/sos` | List/create SOS events with optional location |
| PATCH | `/sos/:id` | Resolve or cancel an active SOS event |

Vitals include `heartRate`, `spo2`, `skinTemp`, `steps`, optional ISO `recordedAt`, and optional `source`. Profile health data is JSON to accommodate the app's onboarding types. Responses use standard JSON and errors include an `error` field.

## Emergency contacts and SOS delivery

Emergency contacts are stored in PostgreSQL and scoped to the authenticated user. Each contact selects SMS or WhatsApp. After a real SOS is triggered, the backend attempts to send the current GPS map link to each saved contact. Delivery is disabled until a messaging provider is configured; the mobile app then opens the selected messaging app so the user can review and send the message manually.

For automatic SMS delivery, configure these values in the backend `.env`:

```dotenv
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+15551234567
DEFAULT_PHONE_COUNTRY_CODE=+91
```

For WhatsApp, also configure `TWILIO_WHATSAPP_FROM` to the WhatsApp sender provisioned for your Twilio account (for example, the approved sandbox sender during development). The recipient must be reachable under the provider's WhatsApp rules; production use may require opt-in and approved message templates. Never put provider credentials in the mobile app or commit the real `.env` file.

Save contact numbers in international format, such as `+919876543210`. The default country code is only applied to numbers without a `+`; set it to the users' expected country code. Restart the backend after changing `.env`.

The API returns `queued` when the provider accepts a message request. That is not proof that the message reached the contact. Review provider delivery status/logs for final status. A notification attempt is created only by an actual authenticated `POST /sos`; simulation controls must not trigger provider messages. Automatic alerts also require the phone to have GPS permission/location enabled and network access to the backend and provider. If the backend/provider is unavailable, the app uses the native compose/share fallback, which requires the user to tap Send.

The mobile app uses its API client and authenticated session for profile contacts and SOS. Bluetooth pairing/sensor streaming is a separate feature; use a reachable development host address rather than `localhost` when accessing the API from a physical phone or emulator.
