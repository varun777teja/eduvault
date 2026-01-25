
import React, { useState, useEffect } from 'react';
import { 
  User, Settings, ShieldCheck, Award, 
  Flame, BookOpen, BrainCircuit, Target,
  Sparkles, Camera, MapPin, GraduationCap,
  BadgeCheck, Trophy, Star,
  Zap, Clock, LogOut, Hash, Layers
} from 'lucide-react';
import { Document } from '../types.ts';
import { supabase } from '../services/supabase.ts';

interface ProfileViewProps {
  documents: Document[];
  onLogout?: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ documents, onLogout }) => {
  const [stats, setStats] = useState({ minutes: 0, ai_hits: 0 });
  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('eduvault_stats') || '{"minutes":45, "ai_hits":12}');
    setStats(savedStats);

    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserMetadata(user.user_metadata);
      }
    };
    fetchUser();
  }, []);

  const achievements = [
    { title: "Vault Master", icon: BookOpen, desc: "Stored 10+ academic documents", color: "text-blue-500", bg: "bg-blue-50", unlocked: documents.length >= 10 },
    { title: "Socratic Prodigy", icon: BrainCircuit, desc: "Used AI Tutor for 50+ queries", color: "text-purple-500", bg: "bg-purple-50", unlocked: stats.ai_hits >= 50 },
    { title: "Deep Diver", icon: Flame, desc: "Studied for over 5 hours total", color: "text-amber-500", bg: "bg-amber-50", unlocked: stats.minutes >= 300 },
    { title: "Quick Learner", icon: Zap, desc: "Completed 5 practice quizzes", color: "text-emerald-500", bg: "bg-emerald-50", unlocked: true },
  ];

  const handleLogout = () => {
    if (confirm("Are you sure you want to lock the vault?")) {
      onLogout?.();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      <div className="relative bg-white border border-slate-200 rounded-[4rem] p-8 lg:p-14 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-hidden mb-12">
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-12">
          <div className="relative group">
            <div className="w-48 h-48 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-[3.5rem] flex items-center justify-center text-white text-6xl font-black shadow-2xl shadow-indigo-100 ring-[12px] ring-slate-50 transition-all duration-700 group-hover:scale-105 group-hover:rotate-2 overflow-hidden border-4 border-white">
              {userMetadata?.avatar_url ? (
                <img src={userMetadata.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                userMetadata?.full_name?.substring(0, 2).toUpperCase() || "JD"
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 p-4 bg-white border border-slate-200 rounded-3xl shadow-2xl text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95 cursor-pointer">
              <Camera className="w-6 h-6" />
            </div>
          </div>

          <div className="flex-1 text-center md:text-left pt-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{userMetadata?.full_name || "Jane Student"}</h1>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm border border-emerald-100">
                <BadgeCheck className="w-4 h-4" /> Verified Student
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-5 mb-10 mt-6">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[2rem] shadow-sm group hover:border-indigo-300 transition-colors">
                <GraduationCap className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{userMetadata?.branch || "Engineering Discipline"}</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-[2rem] shadow-sm group hover:border-indigo-300 transition-colors">
                <Hash className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">{userMetadata?.roll_number || "NO-ID-RECORDED"}</span>
              </div>
            </div>

            <div className="max-w-md mx-auto md:mx-0">
               <div className="flex justify-between items-end mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Mastery Level 4</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">720 / 1000 Academic XP</span>
               </div>
               <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(79,70,229,0.3)]" style={{ width: `72%` }}></div>
               </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-4">
            <button className="p-5 bg-slate-950 text-white rounded-[2rem] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center border border-white/5">
               <Settings className="w-6 h-6" />
            </button>
            <button 
              onClick={handleLogout}
              className="p-5 bg-rose-50 text-rose-600 border border-rose-100 rounded-[2rem] shadow-sm hover:bg-rose-100 transition-all active:scale-95 flex items-center justify-center"
            >
               <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-slate-950 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden group border border-white/5">
            <h3 className="text-xl font-black tracking-tight mb-10 flex items-center gap-3">
              <Trophy className="w-6 h-6 text-amber-400" />
              Impact Summary
            </h3>
            <div className="space-y-10 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black">{stats.minutes}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Focus Minutes</p>
                </div>
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-black">{stats.ai_hits}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">AI Interactions</p>
                </div>
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-10 rounded-[4rem] shadow-sm">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Current Momentum
            </h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-black text-slate-900 tracking-tighter">12</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest pb-2.5">Day Streak</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-emerald-500 rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-10">
           <section>
              <div className="flex items-center justify-between mb-10 px-4">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
                  <Award className="w-8 h-8 text-indigo-600" />
                  Academic Achievements
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {achievements.map((item, idx) => (
                  <div key={idx} className={`p-8 bg-white border rounded-[3rem] transition-all duration-500 group flex items-center gap-6 ${item.unlocked ? 'border-slate-200 hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-300' : 'border-slate-100 opacity-50 grayscale'}`}>
                    <div className={`w-20 h-20 ${item.bg} ${item.color} rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0 shadow-sm`}>
                      <item.icon className="w-10 h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-slate-900 text-lg tracking-tight">{item.title}</h4>
                        {item.unlocked && <CheckCircleIcon className="w-5 h-5 text-emerald-500" />}
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
           </section>

           <section className="bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[4rem] p-10 lg:p-14 shadow-2xl relative overflow-hidden text-white">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-28 h-28 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] shadow-2xl flex items-center justify-center shrink-0 animate-bounce-subtle">
                  <Zap className="w-14 h-14 text-yellow-300" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-3xl font-black tracking-tighter mb-4">Elite Performer</h3>
                  <p className="text-base text-indigo-100 leading-relaxed max-w-xl opacity-90">
                    Your focus sessions in <span className="font-black text-white underline decoration-white/30 underline-offset-4">{userMetadata?.branch || "Engineering"}</span> have surpassed 92% of users in your cohort!
                  </p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[100px] -mr-48 -mt-48"></div>
           </section>
        </div>
      </div>
    </div>
  );
};

// Simple Helper Icon
const CheckCircleIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default ProfileView;
