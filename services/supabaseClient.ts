import { createClient } from '@supabase/supabase-js';

// Credentials provided for this environment
const PROVIDED_SUPABASE_URL = "https://kjsbnjufqwsoxtqrfbfr.supabase.co";
const PROVIDED_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtqc2JuanVmcXdzb3h0cXJmYmZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzOTQ0MTMsImV4cCI6MjA4MDk3MDQxM30.OxHV5BxQKjOEy1LphilHWyrGzD2CJS0dyUm4UYUU7hU";

// Helper to safely get env vars
const getEnvVar = (key: string) => {
  try {
      // Check Vite import.meta.env
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
          return (import.meta as any).env[key] || '';
      }
  } catch (e) { console.debug("import.meta.env read error", e) }
  
  try {
      // Check Node/Polyfill process.env
      if (typeof process !== 'undefined' && process.env) {
          return process.env[key] || '';
      }
  } catch (e) { console.debug("process.env read error", e) }

  return '';
};

// Try to get from env, otherwise use provided fallback
const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabaseUrl = envUrl || PROVIDED_SUPABASE_URL;
const supabaseAnonKey = envKey || PROVIDED_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
