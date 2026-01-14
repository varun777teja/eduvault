
import React, { useState, useEffect } from 'react';
/* Added missing Zap and Clock imports from lucide-react */
import { 
  User, Settings, ShieldCheck, Award, 
  Flame, BookOpen, BrainCircuit, Target,
  Sparkles, Camera, MapPin, GraduationCap,
  ChevronRight, BadgeCheck, Trophy, Star,
  Zap, Clock
} from 'lucide-react';
import { Document } from '../types';

interface ProfileViewProps {
  documents: Document[];
}

const ProfileView: React.FC<ProfileViewProps> = ({ documents }) => {
  const [stats, setStats] = useState({ minutes: 0, ai_hits: 0 });
  const [level, setLevel] = useState(4);
  const [xp, setXp] = useState(720);
  const nextLevelXp = 1000;

  useEffect(() => {
    const savedStats = JSON.parse(localStorage.getItem('eduvault_stats') || '{"minutes":45, "ai_hits":12}');
    setStats(savedStats);
  }, []);

  const achievements = [
    { title: "Vault Master", icon: BookOpen, desc: "Stored 10+ academic documents", color: "text-blue-500", bg: "bg-blue-50", unlocked: documents.length >= 10 },
    { title: "Socratic Prodigy", icon: BrainCircuit, desc: "Used AI Tutor for 50+ queries", color: "text-purple-500", bg: "bg-purple-50", unlocked: stats.ai_hits >= 50 },
    { title: "Deep Diver", icon: Flame, desc: "Studied for over 5 hours total", color: "text-amber-500", bg: "bg-amber-50", unlocked: stats.minutes >= 300 },
    /* Fixed missing Zap icon reference */
    { title: "Quick Learner", icon: Zap, desc: "Completed 5 practice quizzes", color: "text-emerald-500", bg: "bg-emerald-50", unlocked: true },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Profile Header Card */}
      <div className="relative bg-white border border-slate-200 rounded-[3.5rem] p-8 lg:p-12 shadow-sm overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-600/10 to-purple-600/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-10">
          <div className="relative group">
            <div className="w-40 h-40 bg-indigo-600 rounded-[3rem] flex items-center justify-center text-white text-5xl font-black shadow-2xl shadow-indigo-200 ring-8 ring-indigo-50 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3">
              JD
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-white border border-slate-200 rounded-2xl shadow-xl text-slate-400 hover:text-indigo-600 transition-all hover:scale-110 active:scale-95">
              <Camera className="w-5 h-5" />
            </button>
            <div className="absolute -top-3 -right-3 px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border-2 border-white animate-bounce-subtle">
              PRO
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Jane Student</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-tighter">
                <ShieldCheck className="w-3 h-3" /> Verified Student
              </div>
            </div>
            <p className="text-slate-500 font-medium mb-8 flex flex-wrap justify-center md:justify-start items-center gap-4">
              <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> B.S. Computer Science</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Stanford University</span>
            </p>

            <div className="max-w-md mx-auto md:mx-0">
               <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-indigo-600 uppercase tracking-widest">Level {level}</span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Sophomore</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{xp} / {nextLevelXp} XP</span>
               </div>
               <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                  <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" style={{ width: `${(xp/nextLevelXp)*100}%` }}></div>
               </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-3">
            <button className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3">
               <Settings className="w-5 h-5" />
               <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Settings</span>
            </button>
            <button className="p-4 bg-white border border-slate-200 text-slate-500 rounded-3xl shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-3">
               <Award className="w-5 h-5" />
               <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Badges</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Stats Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <h3 className="text-lg font-black tracking-tight mb-8 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Impact Summary
            </h3>
            <div className="space-y-8 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black">{stats.minutes}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Study Minutes</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  {/* Fixed missing Clock icon reference */}
                  <Clock className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black">{stats.ai_hits}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">AI Dialogues</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <BrainCircuit className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-black">{documents.length}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Documents Vaulted</p>
                </div>
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000"></div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Daily Streak
            </h3>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-5xl font-black text-slate-900 tracking-tighter">12</span>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest pb-1.5">Days Active</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map(d => (
                <div key={d} className={`flex-1 aspect-square rounded-xl flex items-center justify-center text-[10px] font-black ${d <= 5 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-300'}`}>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Achievements Column */}
        <div className="lg:col-span-8 space-y-8">
           <section>
              <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  <Award className="w-7 h-7 text-indigo-600" />
                  Achievements
                </h2>
                <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">View All Roadmap</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((item, idx) => (
                  <div key={idx} className={`p-6 bg-white border rounded-[2.5rem] transition-all duration-500 group flex items-center gap-5 ${item.unlocked ? 'border-slate-200 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200' : 'border-slate-100 opacity-50 grayscale'}`}>
                    <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-slate-900 text-base">{item.title}</h4>
                        {item.unlocked && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                    </div>
                    {item.unlocked ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                        <Target className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
           </section>

           <section className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[3rem] p-8 lg:p-10 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center shrink-0">
                  {/* Fixed missing Zap icon reference */}
                  <Zap className="w-12 h-12 text-amber-500 animate-pulse" />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-xl font-black text-indigo-900 tracking-tight">AI Academic Roadmap</h3>
                  <p className="text-sm text-indigo-700/70 mt-2 leading-relaxed max-w-lg">
                    Based on your reading history, you're on track to master <span className="font-bold">Vector Calculus</span> by next week. Keep utilizing the AI Summarizer to speed up your retention!
                  </p>
                  <button className="mt-6 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">
                    View Full Roadmap
                  </button>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;