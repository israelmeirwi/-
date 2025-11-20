
import React, { useState } from 'react';
import { UserConfig, DashboardStats } from '../types';
import { Check, Flame, Loader2, AlertTriangle } from 'lucide-react';

interface WatchViewProps {
  stats: DashboardStats;
  config: UserConfig;
  onLog: () => void;
}

export const WatchView: React.FC<WatchViewProps> = ({ stats, config, onLog }) => {
  const [logging, setLogging] = useState(false);
  const [done, setDone] = useState(false);

  const handleClick = () => {
    setLogging(true);
    // Simulate processing delay for better UX feel
    setTimeout(() => {
        onLog();
        setLogging(false);
        setDone(true);
        // Reset after 2.5 seconds
        setTimeout(() => setDone(false), 2500);
    }, 600);
  };

  if (!config) {
    return (
       <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mb-2" />
          <p className="text-sm">יש להגדיר את האפליקציה בטלפון תחילה</p>
       </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
        <Check className="w-16 h-16 mb-4" />
        <h1 className="text-2xl font-bold text-white">תועד</h1>
        <p className="text-gray-400 mt-2 text-xs">המשיכו כך</p>
      </div>
    );
  }

  const isOverLimit = stats.smokedToday > config.dailyLimit;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-2 relative overflow-hidden">
      {/* Ambient Background */}
      <div className={`absolute inset-0 opacity-10 ${isOverLimit ? 'bg-red-900' : 'bg-blue-900'}`} />
      
      <div className="relative z-10 text-center mb-4">
        <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">יעד יומי</p>
        <div className="text-4xl font-black font-mono flex items-baseline justify-center gap-1">
            <span className={isOverLimit ? "text-red-500" : "text-blue-400"}>
                {stats.smokedToday}
            </span>
            <span className="text-gray-600 text-xl">/</span>
            <span className="text-gray-500 text-xl">{config.dailyLimit}</span>
        </div>
      </div>

      <button 
        onClick={handleClick}
        disabled={logging}
        className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            isOverLimit 
            ? 'bg-red-600 shadow-red-900/50 active:bg-red-700' 
            : 'bg-blue-600 shadow-blue-900/50 active:bg-blue-700'
        }`}
      >
        {logging ? (
            <Loader2 className="w-10 h-10 animate-spin text-white" />
        ) : (
            <Flame className="w-12 h-12 text-white" />
        )}
      </button>
      
      <p className="relative z-10 mt-6 text-gray-500 text-[10px] text-center max-w-[200px]">
        לחץ לתיעוד מהיר
      </p>
    </div>
  );
};
