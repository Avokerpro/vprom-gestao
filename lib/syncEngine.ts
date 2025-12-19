
import { supabase } from './supabase';

const STORAGE_KEYS = {
  DATA_PREFIX: 'vprom_data_'
};

const mapToSupabase = (table: string, data: any) => {
  if (!data) return data;
  const mapped = { ...data };

  // Limpa campos vazios ou undefined
  Object.keys(mapped).forEach(key => {
    if (mapped[key] === undefined || mapped[key] === null) delete mapped[key];
  });

  // Mapeamentos CamelCase -> snake_case
  if (table === 'products') {
    if ('currentStock' in mapped) mapped.current_stock = Number(mapped.currentStock);
    if ('minStock' in mapped) mapped.min_stock = Number(mapped.minStock);
    delete mapped.currentStock;
    delete mapped.minStock;
  }

  if (table === 'financial_records') {
    if ('dueDate' in mapped) mapped.due_date = mapped.dueDate;
    if ('categoryGroup' in mapped) mapped.category_group = mapped.categoryGroup;
    if ('clientId' in mapped) mapped.client_id = mapped.clientId;
    if ('siteId' in mapped) mapped.site_id = mapped.siteId;
    if ('quoteId' in mapped) mapped.quote_id = mapped.quoteId;
    delete mapped.dueDate;
    delete mapped.categoryGroup;
    delete mapped.clientId;
    delete mapped.siteId;
    delete mapped.quoteId;
  }
  
  if (table === 'quotes') {
    if ('clientId' in mapped) mapped.client_id = mapped.clientId;
    if ('staffId' in mapped) mapped.staff_id = mapped.staffId;
    if ('technicalDescription' in mapped) mapped.technical_description = mapped.technicalDescription;
    delete mapped.clientId;
    delete mapped.staffId;
    delete mapped.technicalDescription;
  }

  if (table === 'construction_sites') {
    if ('clientId' in mapped) mapped.client_id = mapped.clientId;
    if ('startDate' in mapped) mapped.start_date = mapped.startDate;
    if ('expectedEndDate' in mapped) mapped.expected_end_date = mapped.expectedEndDate;
    if ('sellerId' in mapped) mapped.seller_id = mapped.sellerId;
    if ('technicianId' in mapped) mapped.technician_id = mapped.technicianId;
    delete mapped.clientId;
    delete mapped.startDate;
    delete mapped.expectedEndDate;
    delete mapped.sellerId;
    delete mapped.technicianId;
  }

  if (table === 'appointments') {
    if ('clientId' in mapped) mapped.client_id = mapped.clientId;
    if ('staffId' in mapped) mapped.staff_id = mapped.staffId;
    delete mapped.clientId;
    delete mapped.staffId;
  }

  if (table === 'inventory_movements') {
    if ('productId' in mapped) mapped.product_id = mapped.productId;
    if ('siteId' in mapped) mapped.site_id = mapped.siteId;
    delete mapped.productId;
    delete mapped.siteId;
  }

  return mapped;
};

const mapFromSupabase = (table: string, data: any) => {
  if (!data) return data;
  const mapped = { ...data };

  if (table === 'products') {
    mapped.currentStock = Number(mapped.current_stock || 0);
    mapped.minStock = Number(mapped.min_stock || 0);
    delete mapped.current_stock;
    delete mapped.min_stock;
  }

  if (table === 'financial_records') {
    mapped.dueDate = mapped.due_date;
    mapped.categoryGroup = mapped.category_group;
    mapped.clientId = mapped.client_id;
    mapped.siteId = mapped.site_id;
    mapped.quoteId = mapped.quote_id;
    delete mapped.due_date;
    delete mapped.category_group;
    delete mapped.client_id;
    delete mapped.site_id;
    delete mapped.quote_id;
  }

  if (table === 'quotes') {
    mapped.clientId = mapped.client_id;
    mapped.staffId = mapped.staff_id;
    mapped.technicalDescription = mapped.technical_description;
    delete mapped.client_id;
    delete mapped.staff_id;
    delete mapped.technical_description;
  }

  if (table === 'construction_sites') {
    mapped.clientId = mapped.client_id;
    mapped.startDate = mapped.start_date;
    mapped.expectedEndDate = mapped.expected_end_date;
    mapped.sellerId = mapped.seller_id;
    mapped.technicianId = mapped.technician_id;
    delete mapped.client_id;
    delete mapped.start_date;
    delete mapped.expected_end_date;
    delete mapped.seller_id;
    delete mapped.technician_id;
  }

  if (table === 'appointments') {
    mapped.clientId = mapped.client_id;
    mapped.staffId = mapped.staff_id;
    delete mapped.client_id;
    delete mapped.staff_id;
  }

  if (table === 'inventory_movements') {
    mapped.productId = mapped.product_id;
    mapped.siteId = mapped.site_id;
    delete mapped.product_id;
    delete mapped.site_id;
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
      if (error) throw error;
      
      const safeData = Array.isArray(data) ? data : [];
      const formatted = safeData.map(item => mapFromSupabase(table, item));
      syncEngine.saveLocal(table, formatted);
      return formatted;
    } catch (e) {
      console.error(`Sync pull error [${table}]:`, e);
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
        console.error(`Sync execute error [${table} ${type}]:`, e);
      }
    }
  }
};
