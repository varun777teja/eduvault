
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Loader2, UserCheck, 
  Sparkles, GraduationCap, Hash, 
  Layers, Check, ShieldCheck,
  Book, Brain, Star, Zap
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[60rem] h-[60rem] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[55rem] h-[55rem] bg-purple-600/10 rounded-full blur-[160px] animate-pulse delay-1000"></div>
        
        {/* Floating Particle Icons */}
        <Book className="absolute top-[20%] left-[15%] w-8 h-8 text-indigo-500/20 animate-float" style={{ animationDelay: '0s' }} />
        <Brain className="absolute bottom-[25%] left-[20%] w-10 h-10 text-purple-500/20 animate-float" style={{ animationDelay: '1s' }} />
        <Star className="absolute top-[30%] right-[18%] w-6 h-6 text-yellow-500/20 animate-float" style={{ animationDelay: '2s' }} />
        <Zap className="absolute bottom-[20%] right-[22%] w-12 h-12 text-blue-500/20 animate-float" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg text-center flex flex-col items-center">
        {/* Logo Section with Elastic Animation */}
        <div className="mb-14 animate-in fade-in slide-in-from-top-12 duration-1000">
          <div className="w-32 h-32 bg-white rounded-[3.5rem] flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.08)] mb-8 mx-auto group cursor-pointer hover:rotate-6 hover:scale-105 transition-all duration-500 overflow-hidden ring-[12px] ring-indigo-500/10 p-4 border border-white/20">
             <img 
               src="https://i.ibb.co/TDvGjR3z/logoapp.png" 
               alt="EduVault Logo" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/3413/3413535.png";
               }}
             />
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter shimmer-text mb-4">
            EduVault
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.5em] text-[10px] flex items-center justify-center gap-4">
            <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-slate-800"></span>
            Intelligence Awaits
            <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-slate-800"></span>
          </p>
        </div>

        {/* Login Card with Staggered Elements */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-[4.5rem] p-12 lg:p-16 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-700 delay-300">
          <h2 className="text-3xl font-black text-white tracking-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
            Vault Entry
          </h2>
          <p className="text-slate-400 text-sm font-medium mb-14 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-600">
            Secure your research with institutional-grade AI.
          </p>

          {error && (
            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold animate-in shake duration-500">
              {error}
            </div>
          )}

          {/* Improved Google Button */}
          <button 
            onClick={handleGoogleLogin}
            disabled={isOAuthLoading}
            className="w-full group relative flex items-center justify-center gap-6 px-8 py-7 bg-white rounded-[2.5rem] text-slate-900 hover:bg-slate-50 transition-all duration-500 font-black text-xl shadow-[0_25px_50px_-12px_rgba(255,255,255,0.15)] active:scale-[0.97] disabled:opacity-50 overflow-hidden animate-in slide-in-from-bottom-8 duration-700 delay-700"
          >
            {/* Shimmer Effect Overlay */}
            {!isOAuthLoading && <div className="absolute inset-0 shimmer-btn opacity-30 pointer-events-none"></div>}
            
            <div className="absolute bottom-0 left-0 h-[3px] w-full flex">
              <div className="flex-1 bg-[#4285F4]"></div>
              <div className="flex-1 bg-[#EA4335]"></div>
              <div className="flex-1 bg-[#FBBC05]"></div>
              <div className="flex-1 bg-[#34A853]"></div>
            </div>

            {isOAuthLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            ) : (
              <>
                <div className="w-12 h-12 bg-white p-2.5 rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-500 border border-slate-100">
                   <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </div>
                <span className="relative z-10">Continue with Google</span>
              </>
            )}
          </button>

          {/* Footer Icons Section */}
          <div className="mt-14 flex items-center justify-center gap-8 opacity-40 animate-in fade-in duration-1000 delay-1000">
             <div className="flex items-center gap-2.5 text-[9px] font-black text-white uppercase tracking-widest group cursor-help">
                <ShieldCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> 
                End-to-End Auth
             </div>
             <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
             <div className="flex items-center gap-2.5 text-[9px] font-black text-white uppercase tracking-widest group cursor-help">
                <GraduationCap className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> 
                Academic Sandbox
             </div>
          </div>
        </div>

        {/* Support Link */}
        <p className="mt-10 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em] animate-in fade-in duration-1000 delay-1000">
          Need access? <span className="text-slate-400 hover:text-white cursor-pointer transition-colors">Contact IT Support</span>
        </p>
      </div>
    </div>
  );
};

export default LoginView;
