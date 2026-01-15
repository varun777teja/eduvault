
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Loader2, UserCheck, 
  Sparkles, GraduationCap, Hash, 
  Layers, Check, LogOut
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [tempUser, setTempUser] = useState<any>(null);

  // Profile Setup State
  const [profileData, setProfileData] = useState({
    name: '',
    rollNumber: '',
    branch: 'Computer Science (CSE)'
  });

  const engineeringBranches = [
    'Computer Science (CSE)',
    'Information Technology (IT)',
    'Electronics & Communication (ECE)',
    'Electrical & Electronics (EEE)',
    'Mechanical Engineering (ME)',
    'Civil Engineering (CE)',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biotechnology',
    'Industrial Engineering'
  ];

  useEffect(() => {
    // Check if user is already logged in but needs profile setup
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        if (!metadata.roll_number || !metadata.branch) {
          setTempUser(session.user);
          setProfileData(prev => ({
            ...prev,
            name: metadata.full_name || metadata.name || ''
          }));
          setIsSettingUp(true);
        } else {
          onLogin();
        }
      }
    };
    if (isSupabaseConfigured) checkSession();
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Supabase not configured. Using Guest mode.");
      setTimeout(onLogin, 1000);
      return;
    }

    setIsOAuthLoading(true);
    setError(null);

    try {
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
      setError(err.message);
      setIsOAuthLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOAuthLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          roll_number: profileData.rollNumber,
          branch: profileData.branch,
          profile_completed: true
        }
      });
      if (error) throw error;
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  if (isSettingUp) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px]"></div>
        
        <div className="relative z-10 w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 lg:p-14 shadow-2xl">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/20">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter">Student Identity</h2>
            <p className="text-slate-400 text-sm mt-2">Complete your profile to access the vault.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  placeholder="Full Name"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="relative group">
                <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  required
                  value={profileData.rollNumber}
                  onChange={e => setProfileData({...profileData, rollNumber: e.target.value})}
                  placeholder="Roll Number (e.g. 21CS042)"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="relative group">
                <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <select 
                  required
                  value={profileData.branch}
                  onChange={e => setProfileData({...profileData, branch: e.target.value})}
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  {engineeringBranches.map(branch => (
                    <option key={branch} value={branch} className="bg-slate-900 text-white">{branch}</option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isOAuthLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isOAuthLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Enter the Vault <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[5%] left-[10%] w-[40rem] h-[40rem] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[5%] right-[10%] w-[35rem] h-[35rem] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg text-center">
        <div className="mb-12 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-8 mx-auto group cursor-pointer hover:rotate-12 transition-transform overflow-hidden ring-4 ring-indigo-500/20">
             <img 
               src="logo.png" 
               alt="EduVault Logo" 
               className="w-full h-full object-cover p-2"
               onError={(e) => {
                 e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
               }}
             />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter shimmer-text mb-4">EduVault</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">The Student AI E-Library</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 lg:p-16 shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-700 delay-300">
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Welcome Student</h2>
          <p className="text-slate-400 text-sm mb-12">Sign in to sync your library across all devices.</p>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs text-left">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isOAuthLoading}
            className="w-full group relative flex items-center justify-center gap-4 px-8 py-6 bg-white rounded-[2.5rem] text-slate-900 hover:bg-slate-50 transition-all font-black text-lg shadow-2xl active:scale-[0.98] disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 h-1.5 w-full flex">
              <div className="flex-1 bg-[#4285F4]"></div><div className="flex-1 bg-[#EA4335]"></div><div className="flex-1 bg-[#FBBC05]"></div><div className="flex-1 bg-[#34A853]"></div>
            </div>
            {isOAuthLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            ) : (
              <>
                <div className="w-8 h-8 bg-white p-1 rounded-lg shadow-sm flex items-center justify-center group-hover:rotate-12 transition-transform">
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-5 h-5" />
                </div>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="mt-10 text-[9px] text-slate-600 font-black uppercase tracking-widest leading-relaxed">
            By continuing, you agree to the academic integrity terms and privacy policy of EduVault.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
