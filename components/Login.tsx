
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
    const supported = !!(window.PublicKeyCredential && 
                        navigator.credentials && 
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
      // Prompt nativo
      if (navigator.credentials && (navigator.credentials as any).get) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        await (navigator.credentials as any).get({
          publicKey: {
            challenge,
            userVerification: "required",
            timeout: 60000,
            allowCredentials: []
          }
        });
      }

      const savedPass = localStorage.getItem('vprom_biometric_secret');
      if (savedPass) {
        await performLogin(biometricUser.email, savedPass, false);
      } else {
        throw new Error("Cofre biométrico vazio.");
      }
    } catch (err: any) {
      setError("Autenticação biométrica falhou.");
      setLoading(false);
    }
  };

  const performLogin = async (loginEmail: string, loginPass: string, shouldRegister: boolean) => {
    setLoading(true);
    setError(null);

    if (!navigator.onLine) {
        const success = attemptOfflineLogin(loginEmail);
        if (!success) {
             setError('Modo Offline: Usuário não cacheado.');
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
      setError(err.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : err.message);
      setLoading(false);
    }
  };

  const attemptOfflineLogin = (targetEmail: string) => {
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
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-vprom-orange p-12 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 text-white/10 rotate-12"><ShieldCheck size={160} /></div>
            <h1 className="text-5xl font-black text-white tracking-tighter relative z-10">VPROM</h1>
        </div>
        
        <div className="p-10">
            <h2 className="text-3xl font-black text-vprom-dark mb-1">Acesso</h2>
            <p className="text-gray-400 text-sm mb-10 font-bold uppercase tracking-widest">Siding Management System</p>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-[10px] font-black uppercase border border-red-100 flex items-center gap-3">
                    <ShieldAlert size={18} /> {error}
                </div>
            )}
            
            <form onSubmit={handleManualLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:border-vprom-orange outline-none bg-gray-50/50 font-bold"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:border-vprom-orange outline-none bg-gray-50/50 font-bold"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button type="submit" disabled={loading} className="flex-[2] bg-vprom-dark text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Acessar'}
                    </button>

                    {isSupported && isRegistered && (
                        <button type="button" onClick={handleBiometricLogin} disabled={loading} className="flex-1 bg-vprom-orange text-white py-5 px-6 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center">
                            <Fingerprint size={28} />
                        </button>
                    )}
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};
