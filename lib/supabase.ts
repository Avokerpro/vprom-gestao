import { createClient } from '@supabase/supabase-js';

// Função para obter variáveis de ambiente com suporte a Vite e fallbacks
const getEnv = (key: string): string => {
  // Use casting to any to bypass Property 'env' does not exist on type 'ImportMeta'
  const meta = import.meta as any;
  if (typeof meta !== 'undefined' && meta.env && meta.env[key]) {
    return meta.env[key];
  }
  return '';
};

// URL e Key do Supabase (Substitua pelos seus valores reais se necessário)
const supabaseUrl = getEnv('VITE_SUPABASE_URL') || 'https://msmffyjwauplwtfxagzr.supabase.co';
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zbWZmeWp3YXVwbHd0ZnhhZ3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NzQyMTEsImV4cCI6MjA4MTI1MDIxMX0.sa5X3T-Hg8k5QHkKJZGl-NHGKsxEG7RogktN6jjMgWE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERRO: Supabase URL ou Anon Key não configurados corretamente.');
}

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());
