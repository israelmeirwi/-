
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Log, UserConfig, DashboardStats, AppView } from './types';
import { Dashboard } from './components/Dashboard';
import { LogFlow } from './components/LogFlow';
import { CravingMode } from './components/CravingMode';
import { Onboarding } from './components/Onboarding';
import { WatchView } from './components/WatchView';
import { Leaderboard } from './components/Leaderboard';
import { getMotivation } from './services/geminiService';

function App() {
  // --- State ---
  const [config, setConfig] = useState<UserConfig | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [view, setView] = useState<AppView>(AppView.ONBOARDING);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  // Notification Refs to avoid duplicate alerts
  const nextTimeRef = useRef<number>(0);
  const notifSentRef = useRef<boolean>(false);
  const reminderSentRef = useRef<boolean>(false);

  // --- Initialization ---
  useEffect(() => {
    const savedConfig = localStorage.getItem('neshima_config');
    const savedLogs = localStorage.getItem('neshima_logs');
    
    const params = new URLSearchParams(window.location.search);
    const isWatchMode = params.get('mode') === 'watch';

    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
      
      // Determine initial view
      if (isWatchMode) {
        setView(AppView.WATCH);
      } else {
        setView(AppView.DASHBOARD);
      }
    }

    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    if (config) localStorage.setItem('neshima_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('neshima_logs', JSON.stringify(logs));
  }, [logs]);

  // --- Computed Stats ---
  const stats = useMemo((): DashboardStats | null => {
    if (!config) return null;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    // Filter logs for today
    const todayLogs = logs.filter(l => l.timestamp >= startOfDay && l.type === 'smoked');
    const smokedToday = todayLogs.length;

    // Calculate Last Cigarette Time
    const lastLog = logs.filter(l => l.type === 'smoked').sort((a, b) => b.timestamp - a.timestamp)[0];
    const lastCigaretteTime = lastLog ? lastLog.timestamp : null;

    // Calculate Streak
    let diffMs = 0;
    if (lastCigaretteTime) {
      diffMs = now.getTime() - lastCigaretteTime;
    } else {
       diffMs = now.getTime() - config.startDate;
    }
    
    const streakHours = Math.floor(diffMs / (1000 * 60 * 60));
    const streakMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate Interval and Next Allowed Time
    const WAKING_HOURS = 16;
    const intervalMs = (WAKING_HOURS * 60 * 60 * 1000) / Math.max(1, config.dailyLimit);
    const intervalMinutes = Math.floor(intervalMs / 60000);
    
    let nextAllowedTime = 0;
    if (lastCigaretteTime) {
        nextAllowedTime = lastCigaretteTime + intervalMs;
    } else {
        nextAllowedTime = now.getTime();
    }

    // Calculate Money Saved
    const costPerCig = config.packPrice / config.cigarettesPerPack;
    const savedCigsToday = Math.max(0, config.averageBeforeQuitting - smokedToday);
    const moneySavedToday = savedCigsToday * costPerCig;
    
    return {
      smokedToday,
      limit: config.dailyLimit,
      moneySavedToday,
      moneySavedTotal: 0,
      lastCigaretteTime,
      streakHours,
      streakMinutes,
      nextAllowedTime,
      intervalMinutes
    };
  }, [logs, config]);

  // --- Notification Logic (Smartwatch Optimized) ---
  useEffect(() => {
    if (!stats) return;

    // Reset flags if the target time has shifted significantly (e.g. user logged a cigarette)
    if (Math.abs(stats.nextAllowedTime - nextTimeRef.current) > 1000) {
        nextTimeRef.current = stats.nextAllowedTime;
        notifSentRef.current = false;
        reminderSentRef.current = false;
    }

    const checkNotification = async () => {
        const now = Date.now();
        if (Notification.permission !== 'granted') return;

        const registration = await navigator.serviceWorker.ready;

        // 1. Primary Trigger: Window Open
        if (now >= stats.nextAllowedTime && !notifSentRef.current && stats.nextAllowedTime > 0) {
            registration.showNotification("חלון העישון נפתח", {
                body: "אפשר לעשן עכשיו, או להמשיך לחכות ולצבור בונוס!",
                icon: "/favicon.ico",
                tag: "smoke-window",
                renotify: true,
                requireInteraction: true, // Keeps it on screen on some devices
                data: { url: window.location.href + '?mode=watch' },
                actions: [
                    { action: 'log', title: 'תיעוד מהיר בשעון' },
                    { action: 'wait', title: 'אני ממתין' }
                ]
            } as any);
            notifSentRef.current = true;
        }

        // 2. Secondary Trigger: Reminder (15 mins after window opened if still not logged)
        const FIFTEEN_MINS = 15 * 60 * 1000;
        if (now >= (stats.nextAllowedTime + FIFTEEN_MINS) && notifSentRef.current && !reminderSentRef.current) {
             registration.showNotification("פספסת תיעוד?", {
                body: "עברו 15 דקות מהחלון. לחץ כדי לתעד סיגריה או לאשר שדילגת עליה.",
                icon: "/favicon.ico",
                tag: "smoke-reminder",
                data: { url: window.location.href + '?mode=watch' }
            });
            reminderSentRef.current = true;
        }
    };

    const intervalId = setInterval(checkNotification, 10000); // Check every 10 seconds
    return () => clearInterval(intervalId);
  }, [stats]);


  // --- Handlers ---

  const handleOnboardingComplete = (newConfig: UserConfig) => {
    setConfig(newConfig);
    setView(AppView.DASHBOARD);
  };

  const handleLogComplete = async (type: 'smoked' | 'craving_beaten', options?: { stayOnView?: boolean }) => {
    if (!config) return;
    if (!stats) return;

    const now = Date.now();
    let points = 0;
    let feedback = "";

    if (type === 'craving_beaten') {
        points = 50;
        feedback = "מדהים! הרווחת 50 נקודות על כוח רצון!";
    } else if (type === 'smoked') {
        const isWaitedEnough = now >= stats.nextAllowedTime;
        
        if (isWaitedEnough) {
            points = 20; 
            feedback = "תיעדת בזמן. 20 נקודות נוספו.";
        } else {
            points = 5; 
            feedback = "תיעוד נקלט. זכור: ההמתנה היא המפתח לגמילה.";
        }

        if (stats.smokedToday + 1 > config.dailyLimit) {
            points = 0; 
        }
    }

    const updatedConfig = { ...config, score: (config.score || 0) + points };
    setConfig(updatedConfig);

    const newLog: Log = {
      id: Date.now().toString(),
      timestamp: now,
      type,
      pointsEarned: points
    };

    setLogs(prev => [...prev, newLog]);
    
    if (!options?.stayOnView) {
        setView(AppView.DASHBOARD);
    }

    if (type === 'smoked' && !options?.stayOnView) {
      const currentCount = (stats?.smokedToday || 0) + 1;
      const isOver = currentCount > config.dailyLimit;
      const situation = isOver ? 'over_limit' : 'just_smoked';
      
      getMotivation(currentCount, config.dailyLimit, situation).then(msg => {
          setFeedbackMessage(`${feedback} \n ${msg}`);
          setTimeout(() => setFeedbackMessage(null), 6000);
      });
    } else {
        if (!options?.stayOnView) {
            setFeedbackMessage(feedback);
            setTimeout(() => setFeedbackMessage(null), 4000);
        }
    }
  };

  // --- Renders ---

  if (!config) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (view === AppView.WATCH && stats) {
      return (
          <WatchView 
            stats={stats} 
            config={config} 
            onLog={() => handleLogComplete('smoked', { stayOnView: true })} 
          />
      );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-50">
      
      {view === AppView.DASHBOARD && stats && (
        <>
            <Dashboard 
              stats={stats} 
              config={config}
              onLogClick={() => setView(AppView.LOGGING)} 
              onCravingClick={() => setView(AppView.CRAVING)}
              onLeaderboardClick={() => setView(AppView.LEADERBOARD)}
            />
            {feedbackMessage && (
                <div className="fixed top-4 left-4 right-4 bg-gray-800 text-white p-4 rounded-xl shadow-2xl z-50 animate-fade-in-down flex items-center justify-center text-center whitespace-pre-line">
                    <p className="font-medium">{feedbackMessage}</p>
                </div>
            )}
        </>
      )}

      {view === AppView.LOGGING && (
        <LogFlow 
          config={config} 
          currentCount={stats?.smokedToday || 0}
          nextAllowedTime={stats?.nextAllowedTime || 0}
          onComplete={(type) => handleLogComplete(type)}
          onCancel={() => setView(AppView.DASHBOARD)}
        />
      )}

      {view === AppView.CRAVING && (
        <CravingMode onClose={() => setView(AppView.DASHBOARD)} />
      )}

      {view === AppView.LEADERBOARD && (
        <Leaderboard 
            userScore={config.score || 0} 
            userName={config.name}
            onClose={() => setView(AppView.DASHBOARD)} 
        />
      )}

    </div>
  );
}

export default App;
