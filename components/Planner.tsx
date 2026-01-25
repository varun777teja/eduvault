
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, 
  ChevronLeft, ChevronRight, Sparkles, X, Timer, Play, 
  Check, Rocket, ArrowLeft, Loader2, Hourglass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types.ts';
import { supabase, isSupabaseConfigured } from '../services/supabase.ts';

interface PlannerProps {
  onNotify?: (type: 'success' | 'info' | 'alert' | 'task', title: string, msg: string) => void;
  initialTasks: Task[];
}

const Planner: React.FC<PlannerProps> = ({ onNotify, initialTasks }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); 
  const [nextTaskIn, setNextTaskIn] = useState<{ id: string, seconds: number } | null>(null);
  
  const [newTask, setNewTask] = useState({
    title: '',
    time: '09:00',
    ampm: 'AM',
    duration: 30,
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  // Update local tasks when parent tasks (from real-time stream) change
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  // Session Management Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentTimeStr = now.toTimeString().split(' ')[0].substring(0, 5);

      const todayTasks = tasks.filter(t => !t.completed && t.date === todayStr);
      let closestTask: { id: string, seconds: number } | null = null;

      todayTasks.forEach(task => {
        const [h, m] = task.time.split(':').map(Number);
        const taskTime = new Date();
        taskTime.setHours(h, m, 0, 0);
        
        const diff = Math.floor((taskTime.getTime() - now.getTime()) / 1000);
        
        if (diff > 0 && (!closestTask || diff < closestTask.seconds)) {
          closestTask = { id: task.id, seconds: diff };
        }

        if (task.time === currentTimeStr && activeTaskId !== task.id) {
          setActiveTaskId(task.id);
          setTimeLeft(task.duration * 60);
          onNotify?.('task', 'Focus Session Started', `Current Goal: ${task.title}`);
        }
      });

      setNextTaskIn(closestTask);

      if (activeTaskId) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleCompleteTask(activeTaskId);
            setActiveTaskId(null);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks, activeTaskId]);

  const handleCompleteTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    if (isSupabaseConfigured) {
      await supabase.from('tasks').update({ completed: !task.completed }).eq('id', id);
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      setTasks(updated);
      localStorage.setItem('eduvault_tasks', JSON.stringify(updated));
    }
    
    if (!task.completed) onNotify?.('success', 'Goal Achieved!', `Well done on completing ${task.title}`);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskData = {
      title: newTask.title,
      date: selectedDate.toISOString().split('T')[0],
      time: formatTo24h(newTask.time, newTask.ampm),
      duration: newTask.duration,
      completed: false,
      priority: newTask.priority
    };

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('tasks').insert([{ ...taskData, user_id: user?.id }]);
    } else {
      const localTask = { ...taskData, id: Date.now().toString() };
      const updated = [...tasks, localTask];
      setTasks(updated);
      localStorage.setItem('eduvault_tasks', JSON.stringify(updated));
    }

    setShowTaskForm(false);
    setNewTask({ title: '', time: '09:00', ampm: 'AM', duration: 30, priority: 'medium' });
  };

  const formatTo24h = (time: string, ampm: string) => {
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const offset = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    return days;
  }, [currentDate]);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600">
             <ArrowLeft className="w-4 h-4" /> Return to Vault
           </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Live Planner</h1>
          </div>
        </div>
        
        <div className="flex gap-4">
          {activeTaskId && (
            <div className="bg-indigo-600 p-2 rounded-2xl flex items-center pr-6 shadow-xl animate-pulse">
               <Timer className="w-6 h-6 text-white mr-3 ml-2" />
               <div className="text-xl font-black text-white font-mono">{Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2, '0')}</div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-slate-50 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-slate-50 rounded-xl"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">{d}</div>)}
                {calendarDays.map((d, i) => {
                  if (!d) return <div key={i}></div>;
                  const isSelected = d.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];
                  return (
                    <button key={i} onClick={() => setSelectedDate(d)} className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-xl scale-110' : 'hover:bg-indigo-50 text-slate-600'}`}>
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>
           </div>
        </div>

        <div className="lg:col-span-5">
           <div className="bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl h-[500px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tight">Today's Goals</h3>
                <button onClick={() => setShowTaskForm(true)} className="p-3 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all"><Plus className="w-6 h-6" /></button>
              </div>
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                 {tasks.filter(t => t.date === selectedDate.toISOString().split('T')[0]).map(task => (
                   <div key={task.id} className={`p-5 rounded-3xl border transition-all flex items-center gap-4 ${task.completed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                     <button onClick={() => handleCompleteTask(task.id)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${task.completed ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/40'}`}>
                       <Check className="w-5 h-5" />
                     </button>
                     <div className="flex-1 min-w-0">
                       <p className={`text-sm font-bold truncate ${task.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{task.title}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{task.time}</p>
                     </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setShowTaskForm(false)}></div>
          <form onSubmit={handleAddTask} className="relative bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-8">New Goal</h2>
            <div className="space-y-6">
              <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Mastering Topic..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none font-bold focus:ring-4 focus:ring-indigo-500/10" />
              <div className="grid grid-cols-2 gap-4">
                <input type="time" value={newTask.time} onChange={e => setNewTask({...newTask, time: e.target.value})} className="px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" />
                <input type="number" value={newTask.duration} onChange={e => setNewTask({...newTask, duration: parseInt(e.target.value)})} className="px-6 py-4 bg-slate-50 rounded-2xl border-none font-bold" />
              </div>
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-500 active:scale-95 transition-all">Add to Planner</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Planner;
