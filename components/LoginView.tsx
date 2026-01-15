import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Loader2, UserCheck, 
  Sparkles, GraduationCap, Hash, 
  Layers, Check, ShieldCheck
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  
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
    'Automobile Engineering',
    'Biomedical Engineering',
    'Mining Engineering',
    'Petroleum Engineering',
    'Metallurgical Engineering',
    'Industrial Engineering'
  ];

  useEffect(() => {
    const checkSession = async () => {
      if (!isSupabaseConfigured) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const metadata = session.user.user_metadata;
        // If profile isn't completed, trigger setup view
        if (!metadata.roll_number || !metadata.branch || !metadata.profile_completed) {
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
    checkSession();
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError("Cloud services not connected. Profile saving will be limited.");
      setTimeout(onLogin, 1500);
      return;
    }

    setIsOAuthLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
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
    if (!profileData.name || !profileData.rollNumber) {
      setError("Please complete all fields.");
      return;
    }

    setIsOAuthLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.name,
          roll_number: profileData.rollNumber,
          branch: profileData.branch,
          profile_completed: true,
          updated_at: new Date().toISOString()
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
        {/* Modern Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        
        <div className="relative z-10 w-full max-w-xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[4rem] p-10 lg:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 relative">
              <GraduationCap className="w-12 h-12 text-white" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-950">
                <Check className="w-4 h-4 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-3">Student Profile</h2>
            <p className="text-slate-400 text-sm font-medium">Initialize your academic identity in the vault.</p>
          </div>

          {error && (
            <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-xs text-center font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-8">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Full Name</label>
                <div className="relative group">
                  <UserCheck className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={profileData.name}
                    onChange={e => setProfileData({...profileData, name: e.target.value})}
                    placeholder="e.g. Alex Johnson"
                    className="w-full pl-16 pr-6 py-5 bg-white/[0.05] border border-white/10 rounded-[2rem] text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Roll Number</label>
                <div className="relative group">
                  <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <input 
                    type="text" 
                    required
                    value={profileData.rollNumber}
                    onChange={e => setProfileData({...profileData, rollNumber: e.target.value})}
                    placeholder="e.g. 24CSE001"
                    className="w-full pl-16 pr-6 py-5 bg-white/[0.05] border border-white/10 rounded-[2rem] text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Academic Branch</label>
                <div className="relative group">
                  <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
                  <select 
                    required
                    value={profileData.branch}
                    onChange={e => setProfileData({...profileData, branch: e.target.value})}
                    className="w-full pl-16 pr-6 py-5 bg-white/[0.05] border border-white/10 rounded-[2rem] text-white font-bold outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all appearance-none cursor-pointer"
                  >
                    {engineeringBranches.map(branch => (
                      <option key={branch} value={branch} className="bg-slate-900 text-white font-bold">{branch}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isOAuthLoading}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isOAuthLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Complete Setup <ArrowRight className="w-5 h-5" /></>}
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
        <div className="mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-10 mx-auto group cursor-pointer hover:rotate-12 transition-transform overflow-hidden ring-4 ring-indigo-500/20 p-2">
             <img 
               src="logo.png" 
               alt="EduVault Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
               }}
             />
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter shimmer-text mb-4">EduVault</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-slate-800"></span>
            The Student AI E-Library
            <span className="w-8 h-px bg-slate-800"></span>
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 lg:p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-700 delay-300">
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">Academic Access</h2>
          <p className="text-slate-400 text-sm font-medium mb-12">Secure your documents with institutional-grade AI storage.</p>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={isOAuthLoading}
            className="w-full group relative flex items-center justify-center gap-5 px-10 py-7 bg-white rounded-[2.5rem] text-slate-900 hover:bg-slate-50 transition-all font-black text-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 h-1.5 w-full flex">
              <div className="flex-1 bg-[#4285F4]"></div><div className="flex-1 bg-[#EA4335]"></div><div className="flex-1 bg-[#FBBC05]"></div><div className="flex-1 bg-[#34A853]"></div>
            </div>
            {isOAuthLoading ? (
              <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
            ) : (
              <>
                <div className="w-9 h-9 bg-white p-1.5 rounded-xl shadow-inner flex items-center justify-center group-hover:rotate-12 transition-transform border border-slate-100">
                  <img src="https://www.google.com/favicon.ico" alt="" className="w-6 h-6" />
                </div>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-12 flex items-center justify-center gap-6 opacity-40">
             <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Google Auth Secured
             </div>
             <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
             <div className="flex items-center gap-2 text-[9px] font-black text-white uppercase tracking-widest">
                <GraduationCap className="w-4 h-4 text-indigo-400" /> For Academic Use
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;