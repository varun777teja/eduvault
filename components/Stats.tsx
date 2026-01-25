
import React, { useMemo, useState, useEffect } from 'react';
import { 
  BarChart3, Clock, BrainCircuit, Flame, 
  ArrowLeft, ChevronRight, TrendingUp,
  BookOpen, Calendar, Target, Library,
  Sparkles, History, ArrowUpRight, CheckSquare,
  Timer, Loader2, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document, Task } from '../types.ts';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

interface StatsProps {
  documents: Document[];
  tasks: Task[];
}

const Stats: React.FC<StatsProps> = ({ documents, tasks }) => {
  const navigate = useNavigate();
  const [sessionStats, setSessionStats] = useState({ minutes: 0, ai_hits: 0 });
  const [realStudyData, setRealStudyData] = useState<{ day: string, mastery: number }[]>([]);
  const [readHistory, setReadHistory] = useState<any[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  useEffect(() => {
    const fetchStudyData = async () => {
      const today = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(today.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      let masteryData: { day: string, mastery: number }[] = [];

      if (!isSupabaseConfigured) {
        const localStatsData = localStorage.getItem('eduvault_study_stats');
        const localStats: Record<string, number> = localStatsData ? JSON.parse(localStatsData) : {};
        masteryData = last7Days.map(date => ({
          day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          mastery: Math.min(100, (Number(localStats[date]) || 0) * 2) 
        }));
        const totalToday = Number(localStats[today.toISOString().split('T')[0]]) || 0;
        setSessionStats(prev => ({ ...prev, minutes: totalToday }));
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: sessions } = await supabase
            .from('study_sessions')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', last7Days[0]);

          const sessionMap = new Map<string, number>();
          if (sessions) {
            sessions.forEach((s: any) => {
              sessionMap.set(s.date, Number(s.minutes) || 0);
            });
          }
          masteryData = last7Days.map(date => ({
            day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
            mastery: Math.min(100, (sessionMap.get(date) || 0) * 1.5)
          }));
          const todayMinutes = Number(sessionMap.get(today.toISOString().split('T')[0])) || 0;
          setSessionStats(prev => ({ ...prev, minutes: todayMinutes }));
        }
      }
      setRealStudyData(masteryData);
    };

    const loadHistory = () => {
      const savedHistory = JSON.parse(localStorage.getItem('eduvault_history') || '[]');
      setReadHistory(savedHistory);
    };

    fetchStudyData();
    loadHistory();
    const interval = setInterval(fetchStudyData, 30000); 
    return () => clearInterval(interval);
  }, []);

  const productivityScore = useMemo(() => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  }, [tasks]);

  const nextTask = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    return tasks
      .filter(t => !t.completed && (t.date > today || (t.date === today && t.time >= time)))
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      })[0];
  }, [tasks]);

  const subjectSplit = useMemo(() => {
    if (documents.length === 0) return [];
    const counts: Record<string, number> = {};
    documents.forEach(doc => { counts[doc.category] = (counts[doc.category] || 0) + 1; });
    const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
    return Object.entries(counts).map(([label, count], idx) => ({
      label,
      percent: Math.round((count / documents.length) * 100),
      color: colors[idx % colors.length]
    })).sort((a, b) => b.percent - a.percent);
  }, [documents]);

  const graphWidth = 600;
  const graphHeight = 200;
  
  const points = useMemo(() => {
    return realStudyData.map((d, i) => ({
      x: (i / (realStudyData.length - 1)) * graphWidth,
      y: graphHeight - (d.mastery / 100) * (graphHeight - 20) - 10,
      mastery: d.mastery
    }));
  }, [realStudyData]);

  const smoothPath = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  const areaPath = useMemo(() => {
    if (!smoothPath) return '';
    return `${smoothPath} L ${points[points.length - 1].x} ${graphHeight} L ${points[0].x} ${graphHeight} Z`;
  }, [smoothPath, points]);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28 lg:pb-10">
      <div className="flex items-center gap-4 mb-10">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-500 transition-all active:scale-90"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Academic Performance</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time usage analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Performance Graph */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  Study Mastery progress
                </h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Daily Engagement level</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-tighter">
                <Sparkles className="w-3 h-3" /> Live Sync
              </div>
            </div>

            <div className="relative h-64 w-full px-2">
              {realStudyData.length > 0 ? (
                <>
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 25, 50, 75, 100].map(val => (
                    <line 
                      key={val}
                      x1="0" y1={graphHeight - (val/100)*(graphHeight-20) - 10} 
                      x2={graphWidth} y2={graphHeight - (val/100)*(graphHeight-20) - 10} 
                      stroke="#f1f5f9" strokeWidth="1" 
                      strokeDasharray="4 4"
                    />
                  ))}
                  <path d={areaPath} fill="url(#graphGradient)" className="transition-all duration-700" />
                  <path d={smoothPath} fill="none" stroke="#4f46e5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-700 drop-shadow-[0_4px_10px_rgba(79,70,229,0.3)]" />
                  
                  {points.map((p, i) => (
                    <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                      <circle 
                        cx={p.x} cy={p.y} r={hoveredPoint === i ? "8" : "6"} 
                        fill="white" 
                        stroke="#4f46e5" 
                        strokeWidth="3"
                        className="transition-all duration-300 cursor-pointer" 
                      />
                      {hoveredPoint === i && (
                        <foreignObject x={p.x - 30} y={p.y - 45} width="60" height="35">
                          <div className="bg-slate-900 text-white text-[10px] font-black py-1 rounded-lg text-center shadow-xl border border-white/10">
                            {Math.round(p.mastery)}%
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  ))}
                </svg>
                <div className="flex justify-between mt-6 px-1">
                  {realStudyData.map(d => (
                    <span key={d.day} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.day}</span>
                  ))}
                </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-slate-200" />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Vault History
              </h2>
              <div className="space-y-3">
                {readHistory.slice(0, 4).length > 0 ? readHistory.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                    <img src={item.coverUrl} className="w-10 h-14 rounded-lg object-cover shadow-sm" alt="" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{item.category}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center bg-white border border-dashed border-slate-200 rounded-3xl opacity-40">
                    <p className="text-[10px] font-black uppercase tracking-widest">No Reading History</p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-purple-500" />
                Agenda Insight
              </h2>
              {nextTask ? (
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-3">
                      <Timer className="w-3 h-3" /> Duration: {nextTask.duration}m
                    </div>
                    <h4 className="text-lg font-bold leading-tight mb-4">{nextTask.title}</h4>
                    <button 
                      onClick={() => navigate('/planner')}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Manage Planner
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform"></div>
                </div>
              ) : (
                <div className="bg-white border border-dashed border-slate-200 p-10 rounded-[2.5rem] text-center text-slate-400">
                  <p className="text-xs font-bold">Agenda is currently clear.</p>
                  <button onClick={() => navigate('/planner')} className="mt-2 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:underline">Add New Goal</button>
                </div>
              )}
            </section>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-indigo-600 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
             <div className="relative z-10 space-y-8">
                <div>
                   <p className="text-4xl font-black">{sessionStats.minutes}<span className="text-sm font-bold text-indigo-200 ml-1">mins</span></p>
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-1">Study Focus Time (Today)</p>
                </div>
                <div>
                   <p className="text-4xl font-black">{productivityScore}%</p>
                   <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mt-1">Agenda Completion</p>
                </div>
                <div className="pt-6 border-t border-white/10">
                   <div className="flex justify-between text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-3">
                      <span>Daily Mastery Goal</span>
                      <span>{Math.round((sessionStats.minutes/60)*100)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full shadow-[0_0_10px_white]" style={{ width: `${Math.min(100, (sessionStats.minutes/60)*100)}%` }}></div>
                   </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
             <h3 className="font-black text-slate-900 mb-8 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-500" />
                Knowledge Core
             </h3>
             <div className="space-y-6">
                {subjectSplit.length > 0 ? subjectSplit.map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="text-slate-900">{s.percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={`${s.color} h-full rounded-full transition-all duration-1000`} style={{ width: `${s.percent}%` }}></div>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-400 italic">No document data for categorization.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;
