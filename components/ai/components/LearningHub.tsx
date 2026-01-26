
import React, { useState, useRef, useEffect } from 'react';
import { Flashcard, QuizQuestion, Source, SourceType } from '../types';
import { gemini } from '../geminiService';
import { jsPDF } from "https://esm.sh/jspdf";

interface LearningHubProps {
  data: { flashcards: Flashcard[], quiz: QuizQuestion[] } | null;
  sources: Source[];
  onAddSource: (source: Source) => void;
}

declare const pdfjsLib: any;

export const HighlightedText: React.FC<{ text: string, className?: string, variant?: 'blue' | 'yellow' | 'green' | 'purple' | 'slate' }> = ({ text, className, variant = 'yellow' }) => {
  if (!text) return null;
  
  const variants = {
    yellow: "bg-amber-100/80 text-amber-950 border-b-2 border-amber-300 px-1 rounded-sm mx-0.5 font-bold",
    blue: "bg-blue-50/90 text-blue-900 border-b-2 border-blue-200 px-1 rounded-sm mx-0.5 font-bold",
    green: "bg-emerald-50/90 text-emerald-900 border-b-2 border-emerald-200 px-1 rounded-sm mx-0.5 font-bold",
    purple: "bg-purple-50/90 text-purple-900 border-b-2 border-purple-200 px-1 rounded-sm mx-0.5 font-bold",
    slate: "bg-slate-100 text-slate-900 border-b-2 border-slate-300 px-1 rounded-sm mx-0.5 font-bold"
  };

  const lines = text.split('\n');
  
  return (
    <span className={`${className} leading-relaxed tracking-tight block`}>
      {lines.map((line, lineIdx) => {
        if (line.startsWith('###') || (line.length > 5 && line.length < 50 && line === line.toUpperCase())) {
          return (
            <div key={lineIdx} className="bg-blue-50 text-blue-800 font-bold px-4 py-2 rounded-xl my-3 border-l-4 border-blue-600">
              {line.replace(/^#+\s/, '')}
            </div>
          );
        }

        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={lineIdx} className="mb-2">
            {parts.map((part, i) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                const content = part.slice(2, -2);
                return (
                  <span key={i} className={`inline-block transition-all ${variants[variant]}`}>
                    {content}
                  </span>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </span>
  );
};

const LearningHub: React.FC<LearningHubProps> = ({ data, sources, onAddSource }) => {
  const [activeFlipped, setActiveFlipped] = useState<number | null>(null);
  const [quizState, setQuizState] = useState<{ [index: number]: number }>({});
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeMode, setActiveMode] = useState<'explorer' | 'exam'>('explorer');
  const [explorerSubTab, setExplorerSubTab] = useState<'ai' | 'flashcards' | 'quiz'>('ai');
  
  const [customQuestion, setCustomQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<{question: string, text: string} | null>(null);
  const [isAsking, setIsAsking] = useState(false);

  const [examResult, setExamResult] = useState<{ title: string, content: string } | null>(null);
  const [isExamLoading, setIsExamLoading] = useState(false);
  const [selectedPaperId, setSelectedPaperId] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const flashcards = data?.flashcards || [];
  const quiz = data?.quiz || [];
  const questionPapers = sources.filter(s => s.isQuestionPaper);
  const researchSources = sources.filter(s => !s.isQuestionPaper);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const totalScroll = scrollHeight - clientHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      setScrollProgress(progress);
      setShowScrollTop(scrollTop > 400);
    }
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || sources.length === 0) return;

    setIsAsking(true);
    try {
      const answer = await gemini.answerLearningQuestion(customQuestion, sources);
      setAiAnswer({ question: customQuestion, text: answer });
      setCustomQuestion('');
      setTimeout(() => {
        document.getElementById('ai-answer-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAsking(false);
    }
  };

  const handleSolvePaper = async () => {
    const paper = questionPapers.find(p => p.id === selectedPaperId);
    if (!paper) return;

    setIsExamLoading(true);
    try {
      const result = await gemini.solveQuestionPaper(paper, researchSources);
      setExamResult({ title: `Solution: ${paper.title}`, content: result });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExamLoading(false);
    }
  };

  const handlePredictPaper = async () => {
    if (questionPapers.length < 5) return;
    setIsExamLoading(true);
    try {
      const result = await gemini.predictExamPaper(questionPapers);
      setExamResult({ title: "Brahma Prediction Report", content: result });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExamLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!examResult) return;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(examResult.content, 180);
    doc.text(examResult.title, 10, 10);
    doc.text(lines, 10, 20);
    doc.save(`${examResult.title}.pdf`);
  };

  const handleAnswerSelect = (qIndex: number, oIndex: number) => {
    setQuizState(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const aiIconUrl = "https://i.ibb.co/6JbSBhjt/logobrahma.png";

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-full overflow-y-auto custom-scrollbar mobile-scroller bg-[#f8f9fb] relative scroll-smooth"
    >
      <div className="fixed top-14 md:top-16 left-0 right-0 h-1 bg-slate-100 z-[60] md:z-30">
        <div 
          className="h-full bg-blue-600 transition-all duration-300 ease-out" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-20">
        
        {/* Global Mode Switcher - Matches Screenshot */}
        <div className="flex justify-center pt-2">
          <div className="bg-[#e9ecef] p-1 rounded-full flex items-center shadow-inner">
            <button 
              onClick={() => setActiveMode('explorer')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeMode === 'explorer' 
                ? 'bg-[#2563eb] text-white shadow-lg' 
                : 'text-slate-500'
              }`}
            >
              Explorer
            </button>
            <button 
              onClick={() => setActiveMode('exam')}
              className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                activeMode === 'exam' 
                ? 'bg-[#2563eb] text-white shadow-lg' 
                : 'text-slate-500'
              }`}
            >
              Exam Lab
            </button>
          </div>
        </div>

        {activeMode === 'explorer' ? (
          <div className="space-y-8 animate-fade-in">
            {/* Explorer Sub-Tabs - High Fidelity styling */}
            <div className="flex justify-between md:justify-center items-center gap-2 md:gap-6 px-2">
              {[
                { 
                  id: 'ai', 
                  label: 'AI TUTOR', 
                  icon: (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-6.857 2.286L12 21l-2.286-6.857L3 12l6.857-2.286L12 3z" />
                    </svg>
                  )
                },
                { 
                  id: 'flashcards', 
                  label: `FLASHCARDS (${flashcards.length})`, 
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                    </svg>
                  )
                },
                { 
                  id: 'quiz', 
                  label: `PRACTICE QUIZ (${quiz.length})`, 
                  icon: (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  )
                }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setExplorerSubTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl transition-all duration-300 border ${
                    explorerSubTab === tab.id 
                    ? 'bg-white text-[#2563eb] border-blue-100 shadow-sm' 
                    : 'bg-transparent text-slate-400 border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${explorerSubTab === tab.id ? 'bg-blue-50' : ''}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{tab.label}</span>
                </button>
              ))}
            </div>

            {explorerSubTab === 'ai' && (
              <section className="animate-fade-in flex flex-col items-center">
                <div className="w-full bg-[#f1f3f5] rounded-[3rem] p-8 md:p-14 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm p-1 border border-slate-50">
                      <img src={aiIconUrl} alt="Brahma AI" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">AI Knowledge Partner</h3>
                      <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1.5 opacity-80">Direct context query</p>
                    </div>
                  </div>

                  <form onSubmit={handleAskQuestion} className="relative w-full max-w-lg">
                    <div className="relative group">
                      <input 
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Ask anything about your sources..."
                        className="w-full bg-white border-none rounded-[1.8rem] py-5 pl-8 pr-16 text-slate-800 outline-none shadow-[0_10px_30px_rgba(0,0,0,0.03)] focus:shadow-[0_15px_40px_rgba(37,99,235,0.06)] transition-all font-bold text-base md:text-lg"
                      />
                      <button 
                        type="submit"
                        disabled={isAsking || !customQuestion.trim()}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#2563eb] text-white rounded-2xl flex items-center justify-center hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-30"
                      >
                        {isAsking ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>}
                      </button>
                    </div>
                  </form>

                  {aiAnswer && (
                    <div id="ai-answer-section" className="w-full mt-10 text-left bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                        <p className="text-slate-400 text-sm font-black italic">"{aiAnswer.question}"</p>
                      </div>
                      <div className="prose prose-slate max-w-none text-slate-800">
                        <HighlightedText text={aiAnswer.text} variant="blue" />
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {explorerSubTab === 'flashcards' && (
              <section className="animate-fade-in space-y-6">
                {flashcards.length === 0 ? (
                  <div className="text-center py-16 bg-[#f1f3f5] rounded-[3rem] border border-slate-200 border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No flashcards yet. Add sources to generate.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {flashcards.map((card, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActiveFlipped(activeFlipped === idx ? null : idx)}
                        className="group relative h-56 [perspective:1000px] cursor-pointer"
                      >
                        <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${activeFlipped === idx ? '[transform:rotateY(180deg)]' : ''}`}>
                          {/* Front */}
                          <div className="absolute inset-0 bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center text-center [backface-visibility:hidden]">
                             <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-3">Card {idx + 1}</span>
                             <h4 className="text-base font-bold text-slate-900 leading-tight">
                                <HighlightedText text={card.question} variant="slate" />
                             </h4>
                          </div>
                          {/* Back */}
                          <div className="absolute inset-0 bg-[#1a1c23] text-white rounded-[2rem] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-center text-center">
                             <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-3">Answer</span>
                             <p className="text-sm font-medium leading-relaxed">
                                <HighlightedText text={card.answer} variant="yellow" />
                             </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {explorerSubTab === 'quiz' && (
              <section className="animate-fade-in space-y-6">
                {quiz.length === 0 ? (
                  <div className="text-center py-16 bg-[#f1f3f5] rounded-[3rem] border border-slate-200 border-dashed">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">No quiz questions yet. Add sources to generate.</p>
                  </div>
                ) : (
                  quiz.map((q, qIdx) => (
                    <div key={qIdx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                         <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-500 border border-slate-100">Q{qIdx+1}</div>
                         <h4 className="text-lg font-bold text-slate-900"><HighlightedText text={q.question} variant="slate" /></h4>
                      </div>
                      <div className="grid gap-3">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = quizState[qIdx] === oIdx;
                          const isCorrect = oIdx === q.correctIndex;
                          const hasAnswered = quizState[qIdx] !== undefined;

                          let btnClass = "w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between text-sm ";
                          if (!hasAnswered) btnClass += "bg-white border-slate-100 hover:border-blue-400 hover:bg-blue-50/20 text-slate-700 font-medium";
                          else if (isCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 font-bold";
                          else if (isSelected) btnClass += "bg-rose-50 border-rose-500 text-rose-900 font-bold";
                          else btnClass += "bg-slate-50 border-slate-50 text-slate-400 opacity-60";

                          return (
                            <button 
                              key={oIdx} 
                              onClick={() => !hasAnswered && handleAnswerSelect(qIdx, oIdx)}
                              className={btnClass}
                              disabled={hasAnswered}
                            >
                              <span>{opt}</span>
                              {hasAnswered && (
                                isCorrect ? <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg> 
                                : isSelected && <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </section>
            )}
          </div>
        ) : (
          /* Exam Mode Content */
          <div className="space-y-8 animate-fade-in">
             <section>
              <div className="bg-gradient-to-br from-slate-900 via-[#1e1b4b] to-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-5 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 backdrop-blur-md">
                      <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zM12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tighter">Exam Intelligence</h3>
                      <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.3em] mt-1 opacity-70">Brahma Solving Suite</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-7 rounded-[2.5rem] flex flex-col">
                      <h4 className="text-white font-bold text-base mb-4">PQP Solver</h4>
                      <select 
                        value={selectedPaperId}
                        onChange={(e) => setSelectedPaperId(e.target.value)}
                        className="w-full bg-[#0f172a] border border-slate-700 rounded-xl p-3.5 text-white text-xs mb-6 outline-none appearance-none"
                      >
                        <option value="">Select paper to solve...</option>
                        {questionPapers.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                      </select>
                      <button 
                        onClick={handleSolvePaper}
                        disabled={!selectedPaperId || isExamLoading}
                        className="w-full mt-auto py-3.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-20"
                      >
                        {isExamLoading ? 'Solving...' : 'Solve Paper'}
                      </button>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-7 rounded-[2.5rem] flex flex-col">
                      <h4 className="text-white font-bold text-base mb-4">Prediction Lab</h4>
                      <p className="text-slate-400 text-[11px] mb-6 leading-relaxed">Ground analysis in 5+ historical papers to forecast future patterns.</p>
                      <button 
                        onClick={handlePredictPaper}
                        disabled={questionPapers.length < 5 || isExamLoading}
                        className="w-full mt-auto py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all disabled:opacity-20"
                      >
                        Predict Next Paper
                      </button>
                    </div>
                  </div>

                  {examResult && (
                    <div className="mt-8 animate-slide-up">
                      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200">
                        <div className="flex justify-between items-center mb-6">
                          <h5 className="text-slate-900 font-black text-sm uppercase">{examResult.title}</h5>
                          <button onClick={handleDownloadPDF} className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">PDF</button>
                        </div>
                        <div className="prose prose-sm prose-slate max-w-none text-slate-700 bg-slate-50 p-6 rounded-2xl">
                          <HighlightedText text={examResult.content} variant="yellow" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          className="fixed bottom-24 md:bottom-10 right-6 w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl z-50 hover:scale-110 active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
        </button>
      )}
    </div>
  );
};

export default LearningHub;
