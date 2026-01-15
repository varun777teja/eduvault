
import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Sparkles, 
  BrainCircuit, Globe, Lock, Mail,
  Chrome, Loader2, AlertCircle, UserCheck,
  Settings, Copy, Check, ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [copied, setCopied] = useState(false);

  const CALLBACK_URL = "https://pnqsiejxuwfgbzyeglhd.supabase.co/auth/v1/callback";

  const handleCopy = () => {
    navigator.clipboard.writeText(CALLBACK_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 800);
      return;
    }

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: 'New Student' }
          }
        });
        if (error) throw error;
        alert("Verification email sent! Check your inbox.");
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || 'Authentication failed. Check your network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase not configured. Using local login.");
      return;
    }

    setIsOAuthLoading('google');
    setError(null);

    try {
      // Use clean origin for redirection
      const redirectTo = window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      
      if (error) throw error;
    } catch (err: any) {
      console.error("Google OAuth Error:", err);
      setError(`OAuth Error: ${err.message}`);
      setIsOAuthLoading(null);
    }
  };

  const handleGuestAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-900">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 group cursor-pointer hover:rotate-12 transition-transform overflow-hidden ring-4 ring-indigo-500/20">
             <img 
               src="logo.png" 
               alt="EduVault Logo" 
               className="w-full h-full object-cover p-2"
               onError={(e) => {
                 e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
               }}
             />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter shimmer-text mb-2">EduVault</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[9px]">The Academic AI Command Center</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 lg:p-14 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-700 delay-300">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Join the Vault'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">Unlock your digital library.</p>
            </div>
            {isSupabaseConfigured && (
              <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {mode === 'signin' ? 'Create Account' : 'Sign In'}
              </button>
            )}
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 text-xs animate-in slide-in-from-top-2">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold mb-1 uppercase tracking-widest">Authentication Alert</p>
                <p className="opacity-90 leading-relaxed font-medium">{error}</p>
                {error.toLowerCase().includes('400') && (
                  <button onClick={() => setShowTroubleshoot(true)} className="mt-2 text-indigo-400 font-bold underline">Fix this Error 400</button>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Student Email"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !!isOAuthLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>{mode === 'signin' ? 'Login to Library' : 'Create Library'} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>

          {/* Integrated Google Access */}
          <div className="mt-12">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                <span className="bg-slate-950 px-4">Fastest Academic Access</span>
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={!!isOAuthLoading || isLoading}
              className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-white border border-slate-200 rounded-[2rem] text-slate-900 hover:bg-slate-50 transition-all font-black text-base shadow-xl active:scale-[0.98] group disabled:opacity-50 relative overflow-hidden"
            >
              <div className="absolute bottom-0 left-0 h-1.5 w-full flex">
                <div className="flex-1 bg-[#4285F4]"></div><div className="flex-1 bg-[#EA4335]"></div><div className="flex-1 bg-[#FBBC05]"></div><div className="flex-1 bg-[#34A853]"></div>
              </div>
              {isOAuthLoading === 'google' ? (
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-white p-1 rounded shadow-inner flex items-center justify-center group-hover:rotate-12 transition-transform">
                    <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
                  </div>
                  <span>Continue with Google</span>
                </div>
              )}
            </button>
            
            <div className="mt-8 flex flex-col items-center gap-4">
               <button 
                 onClick={handleGuestAccess}
                 className="text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-300 transition-all flex items-center gap-2"
               >
                 <UserCheck className="w-4 h-4" /> No Account? Use Guest Mode
               </button>
               <button 
                 onClick={() => setShowTroubleshoot(!showTroubleshoot)}
                 className="text-indigo-400/60 text-[9px] font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors"
               >
                 Configuration Help
               </button>
            </div>
          </div>
        </div>

        {/* Troubleshooting Drawer */}
        {showTroubleshoot && (
          <div className="mt-8 p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-[2.5rem] text-left animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest">Fix Error 400 Mismatch</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Google Error 400 happens when you haven't whitelisted the correct callback URL. Open your <strong>Google Cloud Console</strong> and add this exact link to "Authorized redirect URIs":
            </p>
            <div className="flex items-center gap-2 p-4 bg-black/40 rounded-2xl border border-white/5 mb-6">
              <code className="flex-1 text-[10px] text-emerald-400 font-mono truncate">{CALLBACK_URL}</code>
              <button onClick={handleCopy} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 transition-all shrink-0">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <a 
              href="https://console.cloud.google.com/" 
              target="_blank" 
              className="w-full py-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center justify-center gap-2 hover:bg-indigo-500/20 transition-all"
            >
              Open GCP Console <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-6 text-slate-500">
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             Encrypted Vault
           </div>
           <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
             <BrainCircuit className="w-4 h-4 text-indigo-500" />
             AI Compliance
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
