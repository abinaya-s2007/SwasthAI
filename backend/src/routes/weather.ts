import { Router } from 'express';
import { z } from 'zod';

export const weatherRouter = Router();

const coordinatesSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});
const citySchema = z.object({ city: z.string().trim().min(1).max(100) });

weatherRouter.get('/current', async (req, res, next) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Weather service is not configured on the server' });

  const coordinates = coordinatesSchema.safeParse(req.query);
  const city = citySchema.safeParse(req.query);
  if (!coordinates.success && !city.success) return res.status(400).json({ error: 'Provide valid latitude and longitude, or a city name' });

  try {
    let query: string;
    if (coordinates.success) query = `lat=${coordinates.data.lat}&lon=${coordinates.data.lon}`;
    else if (city.success) query = `q=${encodeURIComponent(city.data.city)}`;
    else return res.status(400).json({ error: 'Provide valid latitude and longitude, or a city name' });
    const url = `https://api.openweathermap.org/data/2.5/weather?${query}&units=metric&appid=${encodeURIComponent(apiKey)}`;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const response = await Promise.race([
      fetch(url),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error('WEATHER_PROVIDER_TIMEOUT')), 10000);
      }),
    ]).finally(() => {
      if (timeout) clearTimeout(timeout);
    });
    if (!response.ok) {
      if (response.status === 401) {
        return res.status(502).json({ error: 'OpenWeather rejected the API key. Check that it is active in backend/.env.' });
      }
      if (response.status === 429) return res.status(503).json({ error: 'Weather provider rate limit reached. Try again later.' });
      return res.status(response.status === 404 ? 404 : 502).json({ error: 'Could not get current weather from the provider' });
    }

    const data = await response.json() as {
      name?: string;
      sys?: { country?: string };
      main?: { temp?: number; feels_like?: number; humidity?: number };
      weather?: Array<{ main?: string; description?: string }>;
      wind?: { speed?: number };
    };
    if (typeof data.main?.temp !== 'number' || typeof data.main.humidity !== 'number') {
      return res.status(502).json({ error: 'Weather provider returned incomplete data' });
    }

    return res.json({
      location: [data.name, data.sys?.country].filter(Boolean).join(', '),
      temperature: Math.round(data.main.temp),
      feelsLike: typeof data.main.feels_like === 'number' ? Math.round(data.main.feels_like) : null,
      humidity: data.main.humidity,
      condition: data.weather?.[0]?.description ?? data.weather?.[0]?.main ?? 'Current conditions',
      windSpeed: typeof data.wind?.speed === 'number' ? data.wind.speed : null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'WEATHER_PROVIDER_TIMEOUT') {
      return res.status(504).json({ error: 'Weather provider took too long to respond' });
    }
    return next(error);
  }
});
