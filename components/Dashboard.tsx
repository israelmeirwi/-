
import React, { useState, useEffect } from 'react';
import { DashboardStats, UserConfig } from '../types';
import { CircularProgress } from './CircularProgress';
import { Flame, PiggyBank, Clock, Trophy, Watch, Star, Lock, Bell } from 'lucide-react';
import { WatchInstructions } from './WatchInstructions';

interface DashboardProps {
  stats: DashboardStats;
  config: UserConfig;
  onLogClick: () => void;
  onCravingClick: () => void;
  onLeaderboardClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, config, onLogClick, onCravingClick, onLeaderboardClick }) => {
  const [showWatchInstructions, setShowWatchInstructions] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  // Remaining Cigarettes Logic
  const remaining = config.dailyLimit - stats.smokedToday;
  const isOverLimit = remaining < 0;
  const isWaitOver = timeLeft <= 0;

  // Request Notifications
  const requestNotifications = () => {
    Notification.requestPermission().then(perm => {
      setNotificationPermission(perm);
    });
  };

  // Countdown Logic
  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        const diff = stats.nextAllowedTime - now;
        setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(interval);
  }, [stats.nextAllowedTime]);

  // Format Countdown
  const formatTimeLeft = (ms: number) => {
      if (ms <= 0) return "עכשיו";
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="pb-24 pt-6 px-4 max-w-md mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-black text-gray-800">היי, {config.name}</h1>
          <div className="flex items-center gap-1 mt-1 text-sm">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-gray-700">{config.score || 0} נקודות</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="text-blue-600 font-medium cursor-pointer" onClick={onLeaderboardClick}>מקום 3 בליגה</span>
          </div>
        </div>
        <div className="flex gap-2">
             {notificationPermission === 'default' && (
                <button 
                    onClick={requestNotifications}
                    className="bg-blue-100 p-2 rounded-full shadow-sm hover:bg-blue-200 text-blue-700 animate-pulse"
                    aria-label="Enable Notifications"
                >
                    <Bell className="w-6 h-6" />
                </button>
             )}
             <button 
                onClick={onLeaderboardClick}
                className="bg-yellow-100 p-2 rounded-full shadow-sm hover:bg-yellow-200 text-yellow-700"
                aria-label="Leaderboard"
            >
                <Trophy className="w-6 h-6" />
            </button>
            <button 
                onClick={() => setShowWatchInstructions(true)}
                className="bg-white p-2 rounded-full shadow-sm hover:bg-gray-50 text-gray-600"
                aria-label="Connect Watch"
            >
                <Watch className="w-6 h-6" />
            </button>
        </div>
      </header>

      {/* Countdown Timer Card (The "Backward Clock") */}
      <div className={`rounded-3xl p-6 shadow-lg relative overflow-hidden transition-colors duration-500 ${isWaitOver ? 'bg-green-500 text-white shadow-green-200' : 'bg-white text-gray-800 shadow-blue-100'}`}>
         <div className="flex justify-between items-start relative z-10">
            <div>
                <h2 className={`text-sm font-bold mb-1 ${isWaitOver ? 'text-green-100' : 'text-gray-500'}`}>
                    {isWaitOver ? 'חלון העישון נפתח' : 'הסיגריה הבאה בעוד'}
                </h2>
                <div className="text-5xl font-black font-mono tracking-tight">
                    {isWaitOver ? (
                        <span className="flex items-center gap-2 text-3xl mt-2">
                            ניתן לתעד <CheckIcon />
                        </span>
                    ) : formatTimeLeft(timeLeft)}
                </div>
                <p className={`text-xs mt-2 ${isWaitOver ? 'text-green-100' : 'text-gray-400'}`}>
                    {isWaitOver ? 'צברת נקודות על ההמתנה!' : `מרווח יעד: ${stats.intervalMinutes} דקות`}
                </p>
            </div>
            <div className={`p-3 rounded-full ${isWaitOver ? 'bg-white/20' : 'bg-blue-50'}`}>
                {isWaitOver ? <Clock className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-blue-400" />}
            </div>
         </div>
         
         {/* Progress Bar for Waiting */}
         {!isWaitOver && (
             <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-100">
                 <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${Math.max(0, Math.min(100, 100 - (timeLeft / (stats.intervalMinutes * 60 * 1000)) * 100))}%` }}
                 />
             </div>
         )}
      </div>

      {/* Main Metric: Remaining Cigarettes (Counting DOWN) */}
      <div className="bg-white rounded-3xl p-6 shadow-lg shadow-blue-100/50 relative overflow-hidden">
        <div className="text-center mb-4">
            <h2 className="text-gray-500 font-medium mb-1">נותרו להיום</h2>
            <CircularProgress 
                value={Math.max(0, remaining)} 
                max={config.dailyLimit} 
                label={isOverLimit ? `-${Math.abs(remaining)}` : `${remaining}`}
                subLabel={isOverLimit ? 'חריגה' : 'סיגריות'}
                color={isOverLimit ? '#EF4444' : '#10B981'} // Green if good, Red if bad
                size={140}
            />
        </div>
        
        <div className="text-center">
            {isOverLimit ? (
                <p className="text-red-500 font-bold bg-red-50 py-2 px-4 rounded-xl inline-block text-sm">
                    חרגת מהיעד ב-{Math.abs(remaining)} סיגריות
                </p>
            ) : (
                <p className="text-gray-600 font-medium text-sm bg-gray-50 py-2 px-4 rounded-xl inline-block">
                   התחלת עם {config.dailyLimit}, עישנת {stats.smokedToday}
                </p>
            )}
        </div>
      </div>

      {/* Money Saved */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-gray-400 text-xs font-medium">חסכת היום</p>
            <p className="text-2xl font-bold text-gray-800">₪{stats.moneySavedToday.toFixed(1)}</p>
        </div>
        <div className="bg-green-100 p-3 rounded-full text-green-600">
            <PiggyBank size={24} />
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-md mx-auto flex gap-3 items-stretch z-40">
         <button 
            onClick={onCravingClick}
            className="flex-1 bg-white border-2 border-red-100 text-red-500 rounded-2xl py-4 font-bold shadow-lg shadow-red-100/50 active:scale-95 transition-transform flex flex-col items-center justify-center gap-1"
         >
            <span className="text-lg leading-none">SOS</span>
            <span className="text-[10px]">יש לי חשק</span>
         </button>

         <button 
            onClick={onLogClick}
            className={`flex-[2] rounded-2xl py-4 font-bold shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 text-white ${isWaitOver ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200' : 'bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-200'}`}
         >
            <div className="bg-white/20 p-2 rounded-full">
                <Flame size={24} fill="currentColor" />
            </div>
            <span className="text-xl">{isWaitOver ? 'תיעוד (בונוס!)' : 'תיעוד סיגריה'}</span>
         </button>
      </div>
      
      {showWatchInstructions && <WatchInstructions onClose={() => setShowWatchInstructions(false)} />}

    </div>
  );
};

const CheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)
