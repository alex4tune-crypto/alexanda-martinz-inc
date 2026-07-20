import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Gemini API endpoint (using Google's Generative AI API)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Helper function to call Gemini API
async function callGeminiApi(prompt: string): Promise<string> {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to get response from Gemini API');
  }
}

// Routes

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Tenants endpoints
app.get('/api/tenants', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('tenants').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/tenants/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('tenants').select('*').eq('id', id).single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Insights endpoints
app.get('/api/insights', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('insights').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/insights/tenant/:tenantId', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('month', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Gemini AI endpoint for macro trends
app.post('/api/ai/intelligence', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    const response = await callGeminiApi(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Live data fetching from World Bank (example: GDP growth)
app.get('/api/live/worldbank/gdp-growth', async (req: Request, res: Response) => {
  try {
    // Example: World Bank API for Uganda's GDP growth
    const response = await axios.get(
      'https://api.worldbank.org/v2/country/UGA/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=10'
    );
    // Process the response to extract relevant data
    const data = response.data[1].map((item: any) => ({
      date: item.date,
      value: item.value,
    }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Live data fetching from Open-Meteo (example: weather for Kampala)
app.get('/api/live/open-meteo/weather', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(
      'https://api.open-meteo.com/v1/forecast?latitude=0.3476&longitude=32.5825&current_weather=true'
    );
    const weather = response.data.current_weather;
    res.json(weather);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});