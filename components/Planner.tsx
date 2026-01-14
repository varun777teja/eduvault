
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Plus, Trash2, 
  ChevronLeft, ChevronRight, Sparkles, X, Timer, Play, 
  BellRing, Check, BookOpen, PartyPopper, Trophy,
  Hourglass, Rocket, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Task } from '../types';

interface PlannerProps {
  onNotify?: (type: 'success' | 'info' | 'alert' | 'task', title: string, msg: string) => void;
}

const Planner: React.FC<PlannerProps> = ({ onNotify }) => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('eduvault_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
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

  useEffect(() => {
    localStorage.setItem('eduvault_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Real-time Engine
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
          onNotify?.('task', '🚀 Session Started!', `Time to focus on: ${task.title}`);
        }
      });

      setNextTaskIn(closestTask);

      if (activeTaskId) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            const task = tasks.find(t => t.id === activeTaskId);
            if (task) {
              onNotify?.('success', '🏆 Goal Achieved!', `You completed: ${task.title}`);
              toggleTask(activeTaskId); 
            }
            setActiveTaskId(null);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tasks, activeTaskId, onNotify]);

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const formatTo24h = (time: string, ampm: string) => {
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${minutes}`;
  };

  const formatTo12h = (time24: string) => {
    let [h, m] = time24.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${m} ${ampm}`;
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      date: selectedDate.toISOString().split('T')[0],
      time: formatTo24h(newTask.time, newTask.ampm),
      duration: newTask.duration,
      completed: false,
      priority: newTask.priority
    };

    setTasks([...tasks, task]);
    onNotify?.('success', '📅 Task Set', `"${task.title}" added to your planner.`);
    setNewTask({ title: '', time: '09:00', ampm: 'AM', duration: 30, priority: 'medium' });
    setShowTaskForm(false);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) onNotify?.('success', '✨ Progress Made', `Goal marked as finished!`);
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    if (confirm("Permanently delete this study goal?")) {
      if (activeTaskId === id) setActiveTaskId(null);
      setTasks(tasks.filter(t => t.id !== id));
      onNotify?.('info', '🗑️ Goal Removed', 'Task has been deleted.');
    }
  };

  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const selectedDateTasks = tasks.filter(t => t.date === selectedDateString).sort((a, b) => a.time.localeCompare(b.time));

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStartCountdown = (seconds: number) => {
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
    }
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const calendarDays = useMemo(() => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const offset = firstDayOfMonth(currentDate);
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    return days;
  }, [currentDate]);

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 relative">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
           >
             <ArrowLeft className="w-4 h-4" /> Back to Library
           </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-xl shadow-indigo-100">
              <CalendarIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Academic Planner</h1>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {activeTaskId ? (
            <div className="bg-indigo-600 p-1.5 rounded-[2rem] flex items-center pr-8 shadow-2xl shadow-indigo-300 ring-4 ring-indigo-50 animate-in slide-in-from-right-10">
              <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center mr-4">
                <Rocket className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Active Session</p>
                <div className="text-2xl font-black text-white font-mono">{formatCountdown(timeLeft)}</div>
              </div>
            </div>
          ) : nextTaskIn ? (
            <div className="bg-slate-900 p-1.5 rounded-[2rem] flex items-center pr-8 shadow-xl animate-in slide-in-from-right-10">
              <div className="w-14 h-14 bg-white/5 rounded-[1.5rem] flex items-center justify-center mr-4">
                <Hourglass className="w-7 h-7 text-indigo-400 animate-[spin_4s_linear_infinite]" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Next Task In</p>
                <div className="text-2xl font-black text-white font-mono">
                  {nextTaskIn.seconds !== undefined ? formatStartCountdown(nextTaskIn.seconds) : '---'}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-3">
                <button onClick={handlePrevMonth} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"><ChevronLeft className="w-6 h-6 text-slate-400" /></button>
                <button onClick={handleNextMonth} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all"><ChevronRight className="w-6 h-6 text-slate-400" /></button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[11px] font-black text-slate-300 uppercase tracking-[0.2em] py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3">
              {calendarDays.map((date, idx) => {
                if (!date) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                const dateStr = date.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDateString;
                const isToday = new Date().toDateString() === date.toDateString();
                const dayTasks = tasks.filter(t => t.date === dateStr);
                const hasTasks = dayTasks.length > 0;
                const isDone = hasTasks && dayTasks.every(t => t.completed);

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-[1.8rem] flex flex-col items-center justify-center relative transition-all duration-300 transform active:scale-95 ${
                      isSelected 
                        ? 'bg-slate-900 text-white shadow-2xl scale-110 z-10' 
                        : 'hover:bg-indigo-50/50 text-slate-600'
                    } ${isToday && !isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/30' : ''}`}
                  >
                    <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-800'}`}>{date.getDate()}</span>
                    {hasTasks && (
                      <div className={`w-2 h-2 rounded-full mt-2 ${isSelected ? 'bg-indigo-400' : isDone ? 'bg-emerald-500' : 'bg-indigo-600'} animate-pulse`}></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-[120px] -mr-32 -mt-32"></div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white p-10 rounded-[4rem] shadow-2xl relative overflow-hidden flex flex-col h-[650px]">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <Rocket className="w-6 h-6 text-indigo-400" />
                    Focus List
                  </h3>
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">
                    {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <button 
                  onClick={() => setShowTaskForm(true)}
                  className="w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-[2rem] flex items-center justify-center transition-all shadow-[0_15px_30px_rgba(79,70,229,0.4)] active:scale-90 group"
                >
                  <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {selectedDateTasks.length > 0 ? selectedDateTasks.map(task => (
                  <div 
                    key={task.id}
                    className={`group p-6 rounded-[2.5rem] border transition-all duration-700 flex items-center gap-5 ${
                      task.completed 
                        ? 'bg-emerald-500/5 border-emerald-500/10 opacity-50 scale-95' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    } ${task.id === activeTaskId ? 'ring-2 ring-indigo-500 bg-indigo-500/20' : ''}`}
                  >
                    <button 
                      onClick={() => toggleTask(task.id)} 
                      className={`shrink-0 w-10 h-10 rounded-[1rem] flex items-center justify-center transition-all ${
                        task.completed ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-white/40 hover:text-white hover:bg-indigo-600'
                      }`}
                    >
                      {task.completed ? <Check className="w-6 h-6 animate-in zoom-in" /> : <Play className="w-5 h-5" />}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`text-[15px] font-black truncate transition-all duration-500 ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {task.title}
                        </p>
                        {task.id === nextTaskIn?.id && (
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-indigo-600 text-white rounded-full animate-pulse">Up Next</span>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" /> {formatTo12h(task.time)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          <Timer className="w-3.5 h-3.5" /> {task.duration}m
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-3 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-500 hover:text-rose-400 transition-all active:scale-90"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center opacity-40 py-20">
                    <Sparkles className="w-16 h-16 mb-6" />
                    <p className="text-sm font-black uppercase tracking-[0.4em]">Agenda Empty</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-[120px] -mr-40 -mt-40"></div>
          </div>
        </div>
      </div>

      {showTaskForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in" onClick={() => setShowTaskForm(false)}></div>
          <form 
            onSubmit={addTask}
            className="relative bg-white w-full max-w-lg rounded-[4rem] p-10 shadow-2xl animate-in zoom-in-95 duration-500"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Set Goal</h3>
              <button 
                type="button" 
                onClick={() => setShowTaskForm(false)}
                className="p-4 hover:bg-slate-100 rounded-[1.5rem] text-slate-400 transition-all"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Goal Description</label>
                <input 
                  autoFocus
                  type="text"
                  required
                  value={newTask.title}
                  onChange={e => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-8 py-6 bg-slate-50 border-4 border-transparent rounded-[2.5rem] text-lg font-bold focus:bg-white focus:border-indigo-100 transition-all outline-none"
                  placeholder="What are we mastering today?"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Start Time</label>
                  <div className="flex items-center bg-slate-50 rounded-[2rem] p-2">
                    <input 
                      type="time"
                      required
                      value={newTask.time}
                      onChange={e => setNewTask({...newTask, time: e.target.value})}
                      className="flex-1 py-4 bg-transparent border-none text-lg font-black focus:ring-0 outline-none uppercase text-center"
                    />
                    <button 
                      type="button"
                      onClick={() => setNewTask(prev => ({ ...prev, ampm: prev.ampm === 'AM' ? 'PM' : 'AM' }))}
                      className="w-16 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg"
                    >
                      {newTask.ampm}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 block px-1">Duration (Min)</label>
                  <input 
                    type="number"
                    min="1"
                    value={newTask.duration}
                    onChange={e => setNewTask({...newTask, duration: parseInt(e.target.value)})}
                    className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] text-lg font-black focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 block px-1 text-center">Priority Level</label>
                <div className="flex gap-4">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTask({...newTask, priority: p})}
                      className={`flex-1 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all border-4 ${
                        newTask.priority === p 
                          ? p === 'high' ? 'bg-rose-50 border-rose-500 text-rose-600' :
                            p === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-600' :
                            'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-slate-100 text-slate-300 hover:border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-10 py-7 bg-indigo-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-indigo-700 shadow-xl transition-all active:scale-[0.98]"
            >
              Set Goal Now
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Planner;
