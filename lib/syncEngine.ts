
import { supabase } from './supabase';

const STORAGE_KEYS = {
  DATA_PREFIX: 'vprom_data_'
};

const mapToSupabase = (table: string, data: any) => {
  if (!data) return data;
  const mapped = { ...data };

  Object.keys(mapped).forEach(key => {
    if (mapped[key] === undefined) delete mapped[key];
  });

  if (table === 'financial_records') {
    if ('dueDate' in mapped) { mapped.due_date = mapped.dueDate; delete mapped.dueDate; }
    if ('categoryGroup' in mapped) { mapped.category_group = mapped.categoryGroup; delete mapped.categoryGroup; }
  }
  
  if (table === 'quotes') {
    if ('clientId' in mapped) { mapped.client_id = mapped.clientId; delete mapped.clientId; }
    if ('technicalDescription' in mapped) { mapped.technical_description = mapped.technicalDescription; delete mapped.technicalDescription; }
  }

  if (table === 'construction_sites') {
    if ('clientId' in mapped) { mapped.client_id = mapped.clientId; delete mapped.client_id; }
    if ('startDate' in mapped) { mapped.start_date = mapped.startDate; delete mapped.startDate; }
  }

  return mapped;
};

const mapFromSupabase = (table: string, data: any) => {
  if (!data) return data;
  const mapped = { ...data };

  if (table === 'financial_records') {
    if ('due_date' in mapped) { mapped.dueDate = mapped.due_date; delete mapped.due_date; }
    if ('category_group' in mapped) { mapped.categoryGroup = mapped.category_group; delete mapped.category_group; }
  }

  if (table === 'quotes') {
    if ('client_id' in mapped) { mapped.clientId = mapped.client_id; delete mapped.client_id; }
    if ('technical_description' in mapped) { mapped.technicalDescription = mapped.technical_description; delete mapped.technical_description; }
    if (!mapped.items) mapped.items = [];
  }

  if (table === 'construction_sites') {
    if ('client_id' in mapped) { mapped.clientId = mapped.client_id; delete mapped.client_id; }
    if ('start_date' in mapped) { mapped.startDate = mapped.start_date; delete mapped.start_date; }
  }

  return mapped;
};

export const syncEngine = {
  saveLocal: (table: string, data: any[]) => {
    localStorage.setItem(`${STORAGE_KEYS.DATA_PREFIX}${table}`, JSON.stringify(data || []));
  },

  getLocal: <T>(table: string): T[] => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.DATA_PREFIX}${table}`);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  pullAll: async (table: string) => {
    if (!navigator.onLine) return syncEngine.getLocal(table);
    try {
      const { data, error } = await supabase.from(table).select('*');
      if (error) return syncEngine.getLocal(table);
      
      const safeData = Array.isArray(data) ? data : [];
      const formatted = safeData.map(item => mapFromSupabase(table, item));
      syncEngine.saveLocal(table, formatted);
      return formatted;
    } catch (e) {
      return syncEngine.getLocal(table);
    }
  },

  execute: async (table: string, type: 'INSERT' | 'UPDATE' | 'DELETE', payload: any, localUpdate: () => void) => {
    localUpdate();
    const dbPayload = mapToSupabase(table, payload);
    
    if (navigator.onLine) {
      try {
        if (type === 'INSERT') await supabase.from(table).insert([dbPayload]);
        else if (type === 'UPDATE') await supabase.from(table).update(dbPayload).eq('id', payload.id);
        else if (type === 'DELETE') await supabase.from(table).delete().eq('id', payload.id);
      } catch (e) {
        console.error("Erro na sincronização remota:", e);
      }
    }
  }
};
