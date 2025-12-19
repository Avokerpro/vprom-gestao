
import { supabase } from './supabase';

const STORAGE_KEYS = {
  DATA_PREFIX: 'vprom_data_'
};

const mapToSupabase = (table: string, data: any) => {
  if (!data) return data;
  const mapped = { ...data };

  // Remove campos undefined para evitar erros no Supabase
  Object.keys(mapped).forEach(key => {
    if (mapped[key] === undefined) delete mapped[key];
  });

  // Mapeamentos específicos por tabela
  if (table === 'financial_records') {
    if ('dueDate' in mapped) { mapped.due_date = mapped.dueDate; delete mapped.dueDate; }
    if ('categoryGroup' in mapped) { mapped.category_group = mapped.categoryGroup; delete mapped.categoryGroup; }
  }
  
  if (table === 'quotes') {
    if ('clientId' in mapped) { mapped.client_id = mapped.clientId; delete mapped.clientId; }
    if ('staffId' in mapped) { mapped.staff_id = mapped.staffId; delete mapped.staffId; }
    if ('technicalDescription' in mapped) { mapped.technical_description = mapped.technicalDescription; delete mapped.technicalDescription; }
  }

  if (table === 'construction_sites') {
    if ('clientId' in mapped) { mapped.client_id = mapped.clientId; delete mapped.client_id; }
    if ('startDate' in mapped) { mapped.start_date = mapped.startDate; delete mapped.startDate; }
    if ('expectedEndDate' in mapped) { mapped.expected_end_date = mapped.expectedEndDate; delete mapped.expectedEndDate; }
  }

  if (table === 'appointments') {
    if ('clientId' in mapped) { mapped.client_id = mapped.clientId; delete mapped.clientId; }
    if ('staffId' in mapped) { mapped.staff_id = mapped.staffId; delete mapped.staffId; }
  }

  if (table === 'inventory_movements') {
    if ('productId' in mapped) { mapped.product_id = mapped.productId; delete mapped.productId; }
    if ('siteId' in mapped) { mapped.site_id = mapped.siteId; delete mapped.siteId; }
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
    if ('staff_id' in mapped) { mapped.staffId = mapped.staff_id; delete mapped.staff_id; }
    if ('technical_description' in mapped) { mapped.technicalDescription = mapped.technical_description; delete mapped.technical_description; }
    if (!mapped.items) mapped.items = [];
  }

  if (table === 'construction_sites') {
    if ('client_id' in mapped) { mapped.clientId = mapped.client_id; delete mapped.client_id; }
    if ('start_date' in mapped) { mapped.startDate = mapped.start_date; delete mapped.start_date; }
    if ('expected_end_date' in mapped) { mapped.expectedEndDate = mapped.expected_end_date; delete mapped.expected_end_date; }
  }

  if (table === 'appointments') {
    if ('client_id' in mapped) { mapped.clientId = mapped.client_id; delete mapped.client_id; }
    if ('staff_id' in mapped) { mapped.staffId = mapped.staff_id; delete mapped.staff_id; }
  }

  if (table === 'inventory_movements') {
    if ('product_id' in mapped) { mapped.productId = mapped.product_id; delete mapped.product_id; }
    if ('site_id' in mapped) { mapped.siteId = mapped.site_id; delete mapped.site_id; }
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
        if (type === 'INSERT') {
          const { error } = await supabase.from(table).insert([dbPayload]);
          if (error) throw error;
        }
        else if (type === 'UPDATE') {
          const { error } = await supabase.from(table).update(dbPayload).eq('id', payload.id);
          if (error) throw error;
        }
        else if (type === 'DELETE') {
          const { error } = await supabase.from(table).delete().eq('id', payload.id);
          if (error) throw error;
        }
      } catch (e) {
        console.error(`Erro na sincronização remota da tabela ${table}:`, e);
      }
    }
  }
};
