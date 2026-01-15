
import React, { useState } from 'react';
import { 
  ShieldCheck, ArrowRight, Sparkles, 
  BrainCircuit, Globe, Lock, Mail,
  Github, Chrome, Loader2, AlertCircle, UserCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // If Supabase isn't configured, use local login
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
            data: {
              full_name: 'New Student',
            }
          }
        });
        if (error) throw error;
        alert("Verification email sent! Check your inbox.");
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your network.');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[150px] animate-pulse delay-700"></div>
        <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] animate-aura"></div>
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <div className="flex flex-col items-center mb-10 text-center animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mb-6 group cursor-pointer hover:rotate-12 transition-transform">
             <img 
               src="logo.png" 
               alt="EduVault Logo" 
               className="w-14 h-14 object-contain"
               onError={(e) => {
                 e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
               }}
             />
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter shimmer-text mb-2">EduVault</h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Your Academic AI Fortress</p>
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3.5rem] p-10 lg:p-14 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-700 delay-300">
          <div className="mb-10 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {!isSupabaseConfigured ? 'Entering Local Access Mode' : 'Access your personal library vault.'}
              </p>
            </div>
            {isSupabaseConfigured && (
              <button 
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
              >
                {mode === 'signin' ? 'Join Now' : 'Sign In'}
              </button>
            )}
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-8 p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
              <div className="flex items-center gap-3 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertCircle className="w-4 h-4" /> Cloud Config Missing
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Supabase keys weren't found. You can still use EduVault in <b>Local Mode</b>. Your data will be saved locally to this browser.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
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
                  placeholder="Master Key (Password)"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    {!isSupabaseConfigured ? 'Start Local Session' : (mode === 'signin' ? 'Enter the Vault' : 'Initialize Account')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </button>

              {error && (
                <button 
                  type="button"
                  onClick={handleGuestAccess}
                  className="w-full py-4 border border-white/10 rounded-2xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" /> Continue as Guest (Offline)
                </button>
              )}
            </div>
          </form>

          <div className="mt-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                <span className="bg-slate-950 px-4">Or Quick Access</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 hover:bg-white/10 transition-all font-bold text-sm">
                <Chrome className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-slate-300 hover:bg-white/10 transition-all font-bold text-sm">
                <Github className="w-5 h-5" />
                Github
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 animate-in fade-in duration-1000 delay-1000">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            End-to-End Encryption
          </div>
          <div className="w-1 h-1 bg-slate-800 rounded-full"></div>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <BrainCircuit className="w-4 h-4 text-indigo-500" />
            AI Native Hub
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
