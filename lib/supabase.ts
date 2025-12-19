import { createClient } from '@supabase/supabase-js';

// Função segura para acessar variáveis de ambiente em diferentes contextos (Vite vs Node vs Browser)
const getEnv = (key: string) => {
  // Tenta import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Tenta process.env (Node/Compatibilidade) com verificação de segurança
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

export const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://msmffyjwauplwtfxagzr.supabase.co'; 
export const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbWZmeWp3YXVwbHd0ZnhhZ3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NzQyMTEsImV4cCI6MjA4MTI1MDIxMX0.sa5X3T-Hg8k5QHkKJZGl-NHGKsxEG7RogktN6jjMgWE';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Aviso: Supabase URL ou Key não encontrados. O app pode não funcionar corretamente.');
}

// O trim() remove espaços em branco acidentais que podem ocorrer ao copiar/colar
export const supabase = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim());