
import { Client, Product, FinancialRecord, Quote, Appointment, Staff, ConstructionSite } from './types';

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'João Silva', email: 'joao@email.com', phone: '(11) 99999-1111', address: 'Rua das Palmeiras, 123 - Cotia, SP', city: 'Cotia', state: 'SP' },
  { id: '2', name: 'Maria Souza', email: 'maria@email.com', phone: '(11) 98888-2222', address: 'Av. Brasil, 500 - São Paulo, SP', city: 'São Paulo', state: 'SP' },
  { id: '3', name: 'Construtora Ideal', email: 'contato@ideal.com.br', phone: '(11) 3333-4444', address: 'Rodovia Raposo Tavares, km 30', city: 'Cotia', state: 'SP' },
];

export const MOCK_STAFF: Staff[] = [
  // Added status: 'available' to satisfy Staff interface requirement
  { id: '1', name: 'Carlos Vendedor', role: 'seller', phone: '(11) 97777-6666', email: 'carlos@vprom.com', status: 'available' },
  { id: '2', name: 'Roberto Técnico', role: 'technician', phone: '(11) 95555-4444', email: 'roberto@vprom.com', status: 'available' },
  { id: '3', name: 'Ana Comercial', role: 'seller', phone: '(11) 93333-2222', email: 'ana@vprom.com', status: 'available' },
  { id: '4', name: 'Marcos Instalador', role: 'technician', phone: '(11) 92222-1111', email: 'marcos@vprom.com', status: 'available' },
];

// Fix: Added currentStock and minStock to MOCK_PRODUCTS to satisfy Product interface requirements
export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Chapa Cimentícia 8mm', category: 'Chapas', type: 'material', unit: 'un', price: 120.00, cost: 75.00, currentStock: 50, minStock: 10 },
  { id: '2', name: 'Chapa Cimentícia 10mm', category: 'Chapas', type: 'material', unit: 'un', price: 150.00, cost: 95.00, currentStock: 30, minStock: 10 },
  { id: '3', name: 'Parafuso Ponta Broca', category: 'Fixação', type: 'material', unit: 'cx', price: 45.90, cost: 25.00, currentStock: 100, minStock: 20 },
  { id: '4', name: 'Mão de Obra (Instalação)', category: 'Mão de Obra', type: 'service', unit: 'm²', price: 80.00, cost: 40.00, currentStock: 0, minStock: 0 },
  { id: '5', name: 'Pintura Acabamento', category: 'Acabamento', type: 'service', unit: 'm²', price: 40.00, cost: 15.00, currentStock: 0, minStock: 0 },
  { id: '6', name: 'Impermeabilizante', category: 'Impermeabilização', type: 'material', unit: 'gl', price: 210.00, cost: 140.00, currentStock: 15, minStock: 5 },
];

export const MOCK_FINANCIALS: FinancialRecord[] = [
  // Fixed invalid categoryGroup values to match FinancialCategoryGroup union type
  { id: '1', description: 'Pagamento Entrada - João Silva', amount: 5000, type: 'income', status: 'paid', dueDate: '2023-10-01', paymentDate: '2023-10-01', clientId: '1', categoryGroup: 'rev_vendas' },
  { id: '2', description: 'Compra de Materiais - Loja do Zé', amount: 2500, type: 'expense', status: 'paid', dueDate: '2023-10-05', paymentDate: '2023-10-05', categoryGroup: 'cost_obras' },
  { id: '3', description: 'Parcela 2 - João Silva', amount: 5000, type: 'income', status: 'overdue', dueDate: '2023-11-01', clientId: '1', categoryGroup: 'rev_vendas' },
  { id: '4', description: 'Serviço Construtora Ideal', amount: 12000, type: 'income', status: 'pending', dueDate: '2023-12-15', clientId: '3', categoryGroup: 'rev_vendas' },
  { id: '5', description: 'Manutenção Equipamentos', amount: 450, type: 'expense', status: 'pending', dueDate: '2023-12-20', categoryGroup: 'exp_adm' },
];

export const MOCK_QUOTES: Quote[] = [
  { 
    id: '1', 
    clientId: '1', 
    staffId: '1',
    date: '2023-09-15', 
    status: 'approved', 
    total: 15000, 
    items: [
      { productId: '1', quantity: 50, unitPrice: 120 },
      { productId: '4', quantity: 100, unitPrice: 80 }
    ],
    technicalDescription: "Instalação de revestimento em fachada frontal utilizando chapas cimentícias de 8mm, incluso estrutura metálica auxiliar e tratamento de juntas invisíveis."
  }
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    staffId: '2',
    date: today,
    time: '14:00',
    address: 'Rua das Palmeiras, 123 - Cotia, SP',
    description: 'Visita técnica para medição',
    status: 'to_visit'
  },
  {
    id: '2',
    clientId: '2',
    staffId: '1',
    date: today,
    time: '09:00',
    address: 'Av. Brasil, 500 - São Paulo, SP',
    description: 'Apresentação de catálogo',
    status: 'visited'
  },
  {
    id: '3',
    clientId: '3',
    date: '2023-12-25',
    time: '10:00',
    address: 'Obra Rodovia Raposo',
    description: 'Avaliação de fachada',
    status: 'solicited'
  }
];

export const MOCK_CONSTRUCTION_SITES: ConstructionSite[] = [
  {
    id: '1',
    clientId: '1',
    sellerId: '1',
    technicianId: '2',
    teamIds: ['4'],
    address: 'Rua das Palmeiras, 123 - Cotia, SP',
    startDate: '2023-10-10',
    expectedEndDate: '2023-11-10',
    status: 'in_progress',
    description: 'Revestimento completo da fachada lateral.'
  },
  {
    id: '2',
    clientId: '3',
    sellerId: '3',
    technicianId: '2',
    teamIds: ['2', '4'],
    address: 'Rodovia Raposo Tavares, km 30',
    startDate: '2024-01-15',
    status: 'planning',
    description: 'Obra grande porte - Galpão Industrial'
  }
];
