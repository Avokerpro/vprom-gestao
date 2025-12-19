
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
    
    // Mapeia itens internos do orçamento para snake_case
    if (Array.isArray(mapped.items)) {
      mapped.items = mapped.items.map((item: any) => ({
        product_id: item.productId || item.product_id,
        quantity: item.quantity,
        unit_price: item.unitPrice || item.unit_price
      }));
    }

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

  if (table === 'app_users') {
    if ('allowedTabs' in mapped) mapped.allowed_tabs = mapped.allowedTabs;
    if ('allowedCities' in mapped) mapped.allowed_cities = mapped.allowedCities;
    delete mapped.allowedTabs;
    delete mapped.allowedCities;
  }

  return mapped;
};

export const mapFromSupabase = (table: string, data: any) => {
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
    
    // Mapeia itens internos do orçamento de volta para CamelCase
    if (Array.isArray(mapped.items)) {
      mapped.items = mapped.items.map((item: any) => ({
        productId: item.product_id || item.productId,
        quantity: item.quantity,
        unitPrice: item.unit_price || item.unitPrice
      }));
    } else {
      mapped.items = [];
    }
    
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

  if (table === 'app_users') {
    mapped.allowedTabs = Array.isArray(mapped.allowed_tabs) ? mapped.allowed_tabs : [];
    mapped.allowedCities = Array.isArray(mapped.allowed_cities) ? mapped.allowed_cities : [];
    delete mapped.allowed_tabs;
    delete mapped.allowed_cities;
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
          // Removemos o ID do payload de atualização para evitar erros de restrição de PK no Postgres
          const updatePayload = { ...dbPayload };
          delete updatePayload.id;
          
          const { error } = await supabase.from(table).update(updatePayload).eq('id', payload.id);
          if (error) throw error;
        }
        else if (type === 'DELETE') {
          const { error } = await supabase.from(table).delete().eq('id', payload.id);
          if (error) throw error;
        }
      } catch (e: any) {
        // Melhora o log de erro para ser mais legível que "[object Object]"
        console.error(`Sync execute error [${table} ${type}]:`, e.message || e);
        if (e.details) console.error("Details:", e.details);
      }
    }
  }
};
