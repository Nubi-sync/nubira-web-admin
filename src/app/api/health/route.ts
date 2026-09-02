import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbLatencyMs = 0;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
      });

      const dbStart = Date.now();
      const { error } = await supabase.from('articles').select('id').limit(1);
      dbLatencyMs = Date.now() - dbStart;

      if (!error) {
        dbStatus = 'connected';
      } else {
        dbStatus = `query_error: ${error.message}`;
      }
    } else {
      dbStatus = 'missing_env_variables';
    }
  } catch (err: any) {
    dbStatus = `exception: ${err?.message || 'unknown'}`;
  }

  const totalTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: 'healthy',
      app: 'Zigza MES',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      serverLatencyMs: totalTimeMs,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
