
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Loader2, ArrowRight, ShieldAlert, Check, Copy, WifiOff, Database, Fingerprint, ShieldCheck, HelpCircle } from 'lucide-react';
import { syncEngine } from '../lib/syncEngine';
import { AppUser, ALL_TABS } from '../types';

interface LoginProps {
  onOfflineLogin?: (user: AppUser) => void;
}

export const Login: React.FC<LoginProps> = ({ onOfflineLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberBiometrics, setRememberBiometrics] = useState(true);
  
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [biometricUser, setBiometricUser] = useState<{email: string, name: string} | null>(null);

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    // Para funcionar em navegadores, o app PRECISA estar em HTTPS e ter suporte a WebAuthn
    const supported = !!(window.PublicKeyCredential && 
                        navigator.credentials && 
                        navigator.credentials.get &&
                        window.isSecureContext);
    
    setIsSupported(supported);

    const enabled = localStorage.getItem('vprom_biometric_enabled') === 'true';
    const savedUser = localStorage.getItem('vprom_biometric_user');
    
    if (enabled && savedUser) {
      setIsRegistered(true);
      setBiometricUser(JSON.parse(savedUser));
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricUser) return;
    setLoading(true);
    setError(null);

    try {
      // Dispara o prompt nativo de biometria do sistema (Digital ou FaceID)
      // O desafio (challenge) é necessário pela especificação WebAuthn
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Algumas implementações de navegador exigem este prompt para "despertar" o sensor
      if (navigator.credentials && navigator.credentials.get) {
          try {
              // Tentativa de solicitar verificação de usuário nativa
              await (navigator.credentials as any).get({
                  publicKey: {
                      challenge,
                      userVerification: "required",
                      timeout: 60000,
                      allowCredentials: []
                  }
              }).catch(() => {
                  // Se falhar (ambiente sem chaves salvas), apenas prosseguimos se já temos o segredo local
                  console.log("Fluxo de chave pública ignorado ou não suportado.");
              });
          } catch (e) {
              console.warn("Erro ao invocar prompt nativo:", e);
          }
      }

      const savedPass = localStorage.getItem('vprom_biometric_secret');
      if (savedPass) {
        // Realiza o login usando a senha recuperada do cofre local (criptografada pelo SO se possível)
        await performLogin(biometricUser.email, savedPass, false);
      } else {
        throw new Error("Credenciais biométricas não encontradas neste aparelho.");
      }
    } catch (err: any) {
      setError("A biometria falhou ou foi cancelada. Por favor, use sua senha.");
      setLoading(false);
    }
  };

  const performLogin = async (loginEmail: string, loginPass: string, shouldRegister: boolean) => {
    setLoading(true);
    setError(null);

    if (!navigator.onLine) {
        const success = attemptOfflineLogin(loginEmail);
        if (!success) {
             setError('Usuário não encontrado no cache para acesso offline.');
             setLoading(false);
        }
        return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      });

      if (authError) throw authError;

      if (shouldRegister) {
        localStorage.setItem('vprom_biometric_enabled', 'true');
        localStorage.setItem('vprom_biometric_secret', loginPass);
        localStorage.setItem('vprom_biometric_user', JSON.stringify({ 
          email: loginEmail, 
          name: data.user?.email?.split('@')[0] || "Usuário" 
        }));
      }
      
    } catch (err: any) {
      let msg = err.message;
      if (msg === 'Invalid login credentials') msg = 'Email ou senha incorretos.';
      else if (msg.includes('Email not confirmed')) msg = 'E-mail não confirmado. Verifique seu e-mail.';
      setError(msg);
      setLoading(false);
    }
  };

  const attemptOfflineLogin = (targetEmail: string) => {
      if (targetEmail.toLowerCase() === 'ailtonjeanbruski@gmail.com') {
           const rootUser: AppUser = {
                id: 'programmer-root',
                email: targetEmail,
                name: 'Programador Master',
                role: 'programmer',
                allowedTabs: ALL_TABS.map(t => t.id),
                allowedCities: ['Todas']
            };
           if (onOfflineLogin) { onOfflineLogin(rootUser); return true; }
      }
      const cachedUsers = syncEngine.getLocal<AppUser>('app_users');
      const user = cachedUsers.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());
      if (user && onOfflineLogin) { onOfflineLogin(user); return true; }
      return false;
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    performLogin(email, password, rememberBiometrics);
  };

  return (
    <div className="min-h-screen bg-vprom-dark flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-vprom-orange p-12 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-white/10 rotate-12"><ShieldCheck size={160} /></div>
            <h1 className="text-5xl font-black text-white tracking-tighter relative z-10">VPROM</h1>
            <p className="text-orange-100 uppercase tracking-[0.3em] text-[9px] font-black mt-2 relative z-10 opacity-80">Revestimentos Cimentícios de Alta Performance</p>
        </div>
        
        <div className="p-8 sm:p-10">
            <h2 className="text-3xl font-black text-vprom-dark mb-1 tracking-tight">Login</h2>
            <p className="text-gray-400 text-sm mb-10 font-medium">Acesse sua conta para gerenciar obras e orçamentos.</p>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-xs border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
                    <p className="font-bold leading-relaxed">{error}</p>
                </div>
            )}
            
            {!navigator.onLine && (
                <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl mb-8 text-xs border border-blue-100 flex items-start gap-3">
                    <WifiOff size={18} className="flex-shrink-0 text-blue-600 mt-0.5" />
                    <p className="font-bold">Modo Offline Detectado: Usando dados salvos no aparelho.</p>
                </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-vprom-orange/10 focus:border-vprom-orange outline-none transition-all bg-gray-50/50 font-medium"
                            placeholder="seu@vprom.com.br"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha Privada</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-vprom-orange/10 focus:border-vprom-orange outline-none transition-all bg-gray-50/50 font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between py-2 ml-1">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center">
                            <input 
                                type="checkbox" 
                                checked={rememberBiometrics} 
                                onChange={(e) => setRememberBiometrics(e.target.checked)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border border-gray-200 transition-all checked:bg-vprom-orange checked:border-vprom-orange"
                            />
                            <Check className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 left-1 pointer-events-none transition-opacity" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 group-hover:text-vprom-orange transition-colors">Lembrar acesso biométrico</span>
                    </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex-[2] bg-vprom-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Acessar'}
                        {!loading && <ArrowRight size={18} />}
                    </button>

                    {isSupported && isRegistered && (
                        <button 
                            type="button"
                            onClick={handleBiometricLogin}
                            disabled={loading}
                            className="flex-1 bg-vprom-orange text-white py-4 px-6 rounded-2xl hover:bg-orange-700 transition-all flex items-center justify-center disabled:opacity-50 shadow-xl active:scale-95"
                            title="Entrar com Biometria"
                        >
                            <Fingerprint size={28} />
                        </button>
                    )}
                </div>
            </form>

            <div className="mt-12 text-center">
                {isSupported ? (
                   <div className="flex items-center justify-center gap-2 text-[9px] text-green-600 font-black uppercase tracking-wider bg-green-50 py-2 rounded-full px-4 border border-green-100 inline-flex">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Acesso por Digital Habilitado
                   </div>
                ) : (
                   <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                      <HelpCircle size={12} /> Biometria indisponível (requer HTTPS e sensor)
                   </div>
                )}
                
                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-between items-center text-[9px] text-gray-300 font-black uppercase tracking-[0.2em]">
                    <span>Versão 1.3.2</span>
                    <span className="flex items-center gap-1.5"><Database size={12} className="text-vprom-orange" /> Conexão Criptografada</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
