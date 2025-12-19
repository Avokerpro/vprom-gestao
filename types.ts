
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  type: 'material' | 'service';
  unit: string;
  price: number;
  cost: number;
  currentStock: number;
  minStock: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  reason: string;
  siteId?: string; 
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  specialty?: string;
  phone: string;
  email?: string;
  address?: string; 
  state?: string;
  status: 'available' | 'on_site' | 'vacation';
}

export type FinancialStatus = 'paid' | 'pending' | 'overdue';
export type TransactionType = 'income' | 'expense';
export type FinancialCategoryGroup = 
  | 'rev_vendas'      
  | 'cost_obras'      
  | 'exp_pessoal'     
  | 'exp_adm'         
  | 'exp_mkt'         
  | 'tax_impostos'    
  | 'investimentos';  

export interface FinancialRecord {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  status: FinancialStatus;
  dueDate: string;
  paymentDate?: string;
  clientId?: string;
  quoteId?: string;
  categoryGroup: FinancialCategoryGroup;
  siteId?: string; 
}

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'rejected';

export interface Quote {
  id: string;
  clientId: string;
  staffId?: string;
  date: string;
  items: any[];
  total: number;
  status: QuoteStatus;
  technicalDescription?: string;
}

export type AppointmentStatus = 'solicited' | 'to_visit' | 'visited' | 'closed_deal' | 'cancelled';

export interface Appointment {
  id: string;
  clientId: string;
  staffId?: string;
  date: string;
  time: string;
  address: string;
  description: string;
  status: AppointmentStatus;
}

export type ConstructionStatus = 'planning' | 'in_progress' | 'completed' | 'paused';

export interface ConstructionSite {
  id: string;
  clientId: string;
  sellerId?: string;
  technicianId?: string;
  teamIds?: string[];
  address: string;
  startDate: string;
  expectedEndDate?: string;
  status: ConstructionStatus;
  description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
}

export interface ProductUnit {
  id: string;
  name: string;
}

export interface AppRole {
  id: string;
  name: string;
}

export type AppUserRole = 'seller' | 'technician' | 'supervisor' | 'installer' | 'painter' | 'programmer';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: AppUserRole | string;
  allowedTabs: string[];
  allowedCities: string[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  date: string;
  read: boolean;
  actionTab?: string;
}

export const TRANSLATIONS = {
  quote_status: { draft: 'Rascunho', sent: 'Enviado', approved: 'Aprovado', rejected: 'Recusado' },
  financial_status: { paid: 'Pago', pending: 'Pendente', overdue: 'Atrasado' },
  financial_category: {
    rev_vendas: 'Receita de Vendas',
    cost_obras: 'Custos de Obras',
    exp_pessoal: 'Folha de Pagamento',
    exp_adm: 'Despesas Fixas',
    exp_mkt: 'Marketing/Vendas',
    tax_impostos: 'Impostos',
    investimentos: 'Investimentos'
  },
  construction_status: { planning: 'Planejamento', in_progress: 'Em Obra', completed: 'Finalizada', paused: 'Pausada' },
  staff_status: { available: 'Disponível', on_site: 'Em Obra', vacation: 'Férias/Folga' },
  roles: { seller: 'Vendedor', technician: 'Técnico', supervisor: 'Supervisor', installer: 'Instalador', painter: 'Pintor' },
  appointment_status: { solicited: 'Solicitado', to_visit: 'Para Visitar', visited: 'Visitado', closed_deal: 'Fechado', cancelled: 'Cancelado' },
  product_type: { material: 'Material', service: 'Serviço' }
};

export const ALL_TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'clients', label: 'Clientes' },
  { id: 'inventory', label: 'Estoque' },
  { id: 'quotes', label: 'Orçamentos' },
  { id: 'construction_sites', label: 'Obras' },
  { id: 'financials', label: 'Financeiro' },
  { id: 'team', label: 'Equipe' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'products', label: 'Produtos/Preços' },
  { id: 'access', label: 'Acessos' }
];
