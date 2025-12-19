
import React, { useState, useEffect, useCallback } from 'react';
import { Menu, LogOut, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import { syncEngine } from './lib/syncEngine';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Products } from './components/Products';
import { Quotes } from './components/Quotes';
import { Financials } from './components/Financials';
import { Agenda } from './components/Agenda';
import { Team } from './components/Team';
import { ConstructionSites } from './components/ConstructionSites';
import { Inventory } from './components/Inventory';
import { Login } from './components/Login';
import { Client, Product, FinancialRecord, Quote, Appointment, Staff, ConstructionSite, StockMovement, AppUser, ALL_TABS } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // App Data
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<StockMovement[]>([]);

  const fetchUserProfile = async (email: string) => {
    try {
      if (email === 'ailtonjeanbruski@gmail.com') {
        setCurrentUser({ 
          id: 'root', 
          email, 
          name: 'Admin Root', 
          role: 'programmer', 
          allowedTabs: ALL_TABS.map(t => t.id), 
          allowedCities: ['Todas'] 
        });
      } else {
        const cachedUsers = syncEngine.getLocal<AppUser>('app_users');
        const user = cachedUsers.find(u => u.email === email);
        if (user) setCurrentUser(user);
      }
      refreshAllData();
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  const refreshAllData = async () => {
    setIsSyncing(true);
    try {
      const [c, p, f, q, a, s, cs, im] = await Promise.all([
        syncEngine.pullAll('clients'),
        syncEngine.pullAll('products'),
        syncEngine.pullAll('financial_records'),
        syncEngine.pullAll('quotes'),
        syncEngine.pullAll('appointments'),
        syncEngine.pullAll('staff'),
        syncEngine.pullAll('construction_sites'),
        syncEngine.pullAll('inventory_movements')
      ]);
      
      setClients(c || []);
      setProducts(p || []);
      setFinancials(f || []);
      setQuotes(q || []);
      setAppointments(a || []);
      setStaff(s || []);
      setConstructionSites(cs || []);
      setInventoryMovements(im || []);
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
      setError("Falha na conexão com o servidor. Verifique sua internet.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Limpa a sessão no Supabase
      await supabase.auth.signOut();
      
      // Limpa os tokens do localStorage explicitamente
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase.auth.token') || key.includes('vprom_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));

      // Limpa o estado e força recarregamento total
      setSession(null);
      setCurrentUser(null);
      window.location.replace('/'); // replace para evitar voltar no histórico
    } catch (err) {
      console.error("Erro ao sair:", err);
      window.location.reload();
    }
  };

  const setupAlerts = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("VPROM", { 
        body: "Alertas Críticos Ativados!",
        icon: "/favicon.ico"
      });
    } else {
      alert("Para receber alertas, você precisa autorizar as notificações nas configurações do navegador/celular.");
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setSession(currentSession);
        if (currentSession?.user?.email) {
          await fetchUserProfile(currentSession.user.email);
        } else {
          setAuthLoading(false);
        }
      } catch (err) {
        setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      if (newSession?.user?.email) {
        fetchUserProfile(newSession.user.email);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAuthLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-vprom-dark text-white font-black uppercase tracking-widest gap-4">
        <RefreshCw className="animate-spin text-vprom-orange" size={32} />
        <span>Iniciando VPROM...</span>
      </div>
    );
  }

  if (!session && !currentUser) return <Login onOfflineLogin={setCurrentUser} />;

  const navItems = ALL_TABS.filter(tab => 
    currentUser?.role === 'programmer' || currentUser?.allowedTabs?.includes(tab.id)
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-vprom-dark text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full shadow-2xl'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-white/5 bg-black/20">
            <h1 className="text-3xl font-black tracking-tighter">VPROM</h1>
            <span className="text-[9px] text-vprom-orange font-black uppercase tracking-[0.2em]">Siding System</span>
          </div>
          <nav className="flex-1 py-6 space-y-1 px-4 overflow-y-auto custom-scrollbar">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'bg-vprom-orange text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-6 bg-black/10">
            <button onClick={handleLogout} className="flex items-center gap-3 text-gray-500 hover:text-red-400 w-full px-5 py-3 text-xs font-black uppercase tracking-widest"><LogOut size={18} /> Sair</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b p-5 flex justify-between items-center relative z-40">
           <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 bg-gray-50 rounded-xl"><Menu size={24} /></button>
              <h2 className="text-xl font-black text-vprom-dark uppercase">{ALL_TABS.find(i => i.id === activeTab)?.label}</h2>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={refreshAllData} disabled={isSyncing} className={`p-3 rounded-xl transition-all ${isSyncing ? 'bg-orange-50 text-vprom-orange' : 'bg-gray-50 text-gray-400'}`}>
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
              </button>
              <div className="h-10 w-10 rounded-full bg-vprom-orange/10 flex items-center justify-center text-vprom-orange">
                <ShieldCheck size={20} />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-[#f8f9fb]">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <Dashboard financials={financials} clients={clients} appointments={appointments} constructionSites={constructionSites} onNavigate={setActiveTab} onSetupAlerts={setupAlerts} />}
            {activeTab === 'inventory' && <Inventory products={products} movements={inventoryMovements} sites={constructionSites} onAddMovement={(m) => syncEngine.execute('inventory_movements', 'INSERT', m, () => setInventoryMovements(prev => [m, ...prev]))} onUpdateProduct={(p) => syncEngine.execute('products', 'UPDATE', p, () => setProducts(prev => prev.map(pr => pr.id === p.id ? p : pr)))} />}
            {activeTab === 'team' && <Team staff={staff} onAddStaff={(s) => syncEngine.execute('staff', 'INSERT', s, () => setStaff(prev => [...prev, s]))} onUpdateStaff={(s) => syncEngine.execute('staff', 'UPDATE', s, () => setStaff(prev => prev.map(st => st.id === s.id ? s : st)))} onDeleteStaff={(id) => syncEngine.execute('staff', 'DELETE', {id}, () => setStaff(prev => prev.filter(s => s.id !== id)))} />}
            {activeTab === 'clients' && <Clients clients={clients} quotes={quotes} appointments={appointments} financials={financials} constructionSites={constructionSites} onAddClient={(c) => syncEngine.execute('clients', 'INSERT', c, () => setClients(prev => [...prev, c]))} onUpdateClient={(c) => syncEngine.execute('clients', 'UPDATE', c, () => setClients(prev => prev.map(cl => cl.id === c.id ? c : cl)))} onDeleteClient={(id) => syncEngine.execute('clients', 'DELETE', {id}, () => setClients(prev => prev.filter(cl => cl.id !== id)))} />}
            {activeTab === 'products' && <Products products={products} categories={[]} units={[]} onAddProduct={(p) => syncEngine.execute('products', 'INSERT', p, () => setProducts(prev => [...prev, p]))} onUpdateProduct={(p) => syncEngine.execute('products', 'UPDATE', p, () => setProducts(prev => prev.map(pr => pr.id === p.id ? p : pr)))} onDeleteProduct={(id) => syncEngine.execute('products', 'DELETE', {id}, () => setProducts(prev => prev.filter(p => p.id !== id)))} onAddCategory={()=>{}} onDeleteCategory={()=>{}} onAddUnit={()=>{}} onDeleteUnit={()=>{}} />}
            {activeTab === 'quotes' && <Quotes quotes={quotes} clients={clients} products={products} staff={staff} onAddQuote={(q) => syncEngine.execute('quotes', 'INSERT', q, () => setQuotes(prev => [q, ...prev]))} onUpdateQuote={(q) => syncEngine.execute('quotes', 'UPDATE', q, () => setQuotes(prev => prev.map(qu => qu.id === q.id ? q : qu)))} />}
            {/* Fixed incorrect nested setConstructionSites call in onDeleteSite handler */}
            {activeTab === 'construction_sites' && <ConstructionSites sites={constructionSites} clients={clients} staff={staff} onAddSite={(s) => syncEngine.execute('construction_sites', 'INSERT', s, () => setConstructionSites(prev => [...prev, s]))} onUpdateSite={(s) => syncEngine.execute('construction_sites', 'UPDATE', s, () => setConstructionSites(prev => prev.map(st => st.id === s.id ? s : st)))} onDeleteSite={(id) => syncEngine.execute('construction_sites', 'DELETE', {id}, () => setConstructionSites(prev => prev.filter(s => s.id !== id)))} />}
            {activeTab === 'financials' && <Financials financials={financials} clients={clients} constructionSites={constructionSites} onAddTransaction={(t) => syncEngine.execute('financial_records', 'INSERT', t, () => setFinancials(prev => [t, ...prev]))} onUpdateTransaction={(t) => syncEngine.execute('financial_records', 'UPDATE', t, () => setFinancials(prev => prev.map(f => f.id === t.id ? t : f)))} />}
            {activeTab === 'agenda' && <Agenda appointments={appointments} clients={clients} staff={staff} onAddAppointment={(a) => syncEngine.execute('appointments', 'INSERT', a, () => setAppointments(prev => [...prev, a]))} onUpdateAppointment={(a) => syncEngine.execute('appointments', 'UPDATE', a, () => setAppointments(prev => prev.map(ap => ap.id === a.id ? a : ap)))} onCreateQuoteFromAppointment={()=>{}} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
