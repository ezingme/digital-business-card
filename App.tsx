import React, { useState, useEffect } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { CardPreview } from './components/CardPreview';
import { INITIAL_CARD_DATA } from './constants';
import { CardData } from './types';
import { Smartphone, Monitor, Tablet, Share2, Download } from 'lucide-react';

export default function App() {
  const [cardData, setCardData] = useState<CardData>(INITIAL_CARD_DATA);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  
  // Simulating loading from local storage (simplified)
  useEffect(() => {
    const saved = localStorage.getItem('bizcard_data');
    if (saved) {
      try {
         setCardData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load data", e);
      }
    }
  }, []);

  const handleDataChange = (newData: CardData) => {
    setCardData(newData);
    localStorage.setItem('bizcard_data', JSON.stringify(newData));
  };

  return (
    <div className="flex h-screen w-full bg-slate-50">
      
      {/* Left: Editor Sidebar */}
      <div className="w-[400px] h-full flex-shrink-0 shadow-xl z-10">
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
           <div className="flex items-center gap-2 text-indigo-600">
             <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
             <span className="font-bold text-lg tracking-tight">BizCard AI</span>
           </div>
        </div>
        <div className="h-[calc(100%-64px)]">
          <EditorPanel data={cardData} onChange={handleDataChange} />
        </div>
      </div>

      {/* Right: Preview Area */}
      <div className="flex-1 flex flex-col h-full relative bg-slate-100 overflow-hidden">
        
        {/* Toolbar */}
        <div className="h-16 flex items-center justify-between px-8 border-b border-slate-200 bg-white/50 backdrop-blur-md">
          <div className="flex bg-slate-200 rounded-lg p-1 gap-1">
             <button 
               onClick={() => setViewMode('mobile')}
               className={`p-2 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Smartphone size={18} />
             </button>
             <button 
               onClick={() => setViewMode('desktop')}
               className={`p-2 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <Monitor size={18} />
             </button>
          </div>

          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                <Share2 size={16} /> Share
             </button>
             <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                <Download size={16} /> Export
             </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

           <div 
             className={`transition-all duration-500 ease-in-out shadow-2xl rounded-[2.5rem] overflow-hidden border-[8px] border-slate-800 bg-white relative ${viewMode === 'mobile' ? 'w-[375px] h-[750px]' : 'w-[1000px] h-[600px] rounded-xl border-[12px]'}`}
           >
             {/* Notch (Mobile only) */}
             {viewMode === 'mobile' && (
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-50"></div>
             )}
             
             <CardPreview data={cardData} />
           </div>
        </div>
      </div>
    </div>
  );
}