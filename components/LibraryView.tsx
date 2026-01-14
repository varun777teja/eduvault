
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Trash2, ExternalLink, BookOpen, 
  Clock, LayoutGrid, List, FileSearch, Sparkles,
  Menu as MenuIcon, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Document } from '../types';

interface LibraryViewProps {
  documents: Document[];
  onRemove: (id: string) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ documents, onRemove }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when it becomes visible
  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  // Engineering branches and general categories
  const categories = [
    'All', 
    'Computer Science', 
    'Mechanical Engineering', 
    'Electrical Engineering', 
    'Civil Engineering', 
    'Aerospace Engineering', 
    'Chemical Engineering', 
    'Science', 
    'Mathematics', 
    'Literature', 
    'General'
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
      const matchesSearch = doc.title.toLowerCase().includes(localSearch.toLowerCase()) || 
                           doc.author.toLowerCase().includes(localSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [documents, selectedCategory, localSearch]);

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 pb-32 max-w-7xl mx-auto">
      {/* Library Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-indigo-600" />
            Knowledge Vault
          </h1>
          <p className="text-slate-500 font-medium mt-1">Explore and master your curated academic documents.</p>
        </div>
      </header>

      {/* Horizontal Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat 
              ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
              : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Sleek Toolstrip with Size Toggle and Expanding Search */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm">
            {/* View Mode / Size Selection Toggle */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl mr-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View (Large Icons)"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View (Detailed)"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
            
            <div className="h-8 w-px bg-slate-100 mx-2"></div>
            
            {/* Search Trigger and Expanding Input */}
            <div className={`flex items-center transition-all duration-500 ease-out overflow-hidden ${isSearchVisible ? 'max-w-md ml-2' : 'max-w-0 ml-0'}`}>
              <input 
                ref={searchInputRef}
                type="text" 
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search specifically in your vault..."
                className="w-64 lg:w-80 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium focus:bg-white outline-none transition-all"
              />
              <button 
                onClick={() => { setLocalSearch(''); setIsSearchVisible(false); }}
                className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isSearchVisible && (
              <button 
                onClick={() => setIsSearchVisible(true)}
                className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group"
              >
                <Search className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        </div>

        {/* Main Document Grid */}
        {filteredDocs.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
            {filteredDocs.map((doc) => (
              <div 
                key={doc.id}
                className={`group bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/5 hover:border-indigo-300 transition-all duration-500 flex ${viewMode === 'list' ? 'flex-row h-44' : 'flex-col'}`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-44' : 'aspect-[4/5]'} bg-slate-100 overflow-hidden shrink-0`}>
                  <img 
                    src={doc.coverUrl} 
                    alt={doc.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-indigo-900/40 flex items-center justify-center transition-all duration-500">
                    <button 
                      onClick={() => navigate(`/reader/${doc.id}`)}
                      className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all shadow-xl active:scale-90"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </button>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors text-[15px]">
                        {doc.title}
                      </h3>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onRemove(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-4">{doc.author}</p>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        <span>Read Status</span>
                        <span className="text-indigo-600 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI Ready
                        </span>
                     </div>
                     <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-indigo-600 rounded-full"></div>
                     </div>
                     <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {doc.uploadDate}</span>
                        <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-slate-500 line-clamp-1 max-w-[120px]">{doc.category}</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-white border border-slate-100 rounded-[3rem] shadow-sm">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileSearch className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-black text-slate-900 tracking-tight">No documents found</h3>
             <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or search keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
