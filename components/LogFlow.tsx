
import React, { useState, useEffect } from 'react';
import { UserConfig } from '../types';
import { getMotivation } from '../services/geminiService';
import { AlertTriangle, CheckCircle, Loader2, Clock } from 'lucide-react';

interface LogFlowProps {
  config: UserConfig;
  currentCount: number;
  nextAllowedTime: number;
  onComplete: (type: 'smoked' | 'craving_beaten') => void;
  onCancel: () => void;
}

export const LogFlow: React.FC<LogFlowProps> = ({ config, currentCount, nextAllowedTime, onComplete, onCancel }) => {
  const [step, setStep] = useState<'question' | 'wait_timer' | 'intervention'>('question');
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  
  // Wait Timer State
  const [waitSeconds, setWaitSeconds] = useState(10); // Default wait check
  const isTooEarly = Date.now() < nextAllowedTime;

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (step === 'wait_timer' && waitSeconds > 0) {
      interval = setInterval(() => {
        setWaitSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, waitSeconds]);

  // Determine if we need to force a wait
  const handleSmokeClick = () => {
      if (isTooEarly) {
          // Force a 20-second cool-down timer (demo mode, real life could be 10 mins)
          setWaitSeconds(20); 
          setStep('wait_timer');
      } else {
          // If on time, go to confirmation/motivation or just log
          onComplete('smoked');
      }
  };

  // Step 1: Question - Did you light it?
  if (step === 'question') {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">האם כבר הדלקת?</h2>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                setStep('intervention');
                setLoading(true);
                getMotivation(currentCount, config.dailyLimit, 'about_to_smoke').then(msg => {
                  setAiMessage(msg);
                  setLoading(false);
                });
              }}
              className="w-full py-4 rounded-xl bg-blue-100 text-blue-700 font-bold text-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2"
            >
              <span>✋ עדיין לא, רק רוצה</span>
            </button>

            <button 
              onClick={handleSmokeClick}
              className="w-full py-4 rounded-xl bg-gray-100 text-gray-600 font-medium text-lg hover:bg-gray-200 transition-colors"
            >
              כן, אני מדליק עכשיו
            </button>
            
            <button onClick={onCancel} className="w-full py-2 text-gray-400 text-sm mt-2">
              ביטול
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1.5: Forced Wait Timer (Stopwatch)
  if (step === 'wait_timer') {
      return (
        <div className="fixed inset-0 bg-red-600/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 text-center shadow-2xl">
                <Clock className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-black text-gray-800 mb-2">עצור רגע!</h2>
                <p className="text-gray-500 mb-6">מוקדם מדי לפי היעד שלך. קח כמה שניות לנשום לפני שתחליט סופית.</p>
                
                <div className="text-6xl font-mono font-black text-gray-800 mb-8 tabular-nums">
                    {waitSeconds > 0 ? waitSeconds : "0"}
                </div>

                {waitSeconds > 0 ? (
                    <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                        <div 
                            className="bg-red-500 h-full transition-all duration-1000" 
                            style={{ width: `${(waitSeconds / 20) * 100}%` }}
                        />
                    </div>
                ) : (
                    <div className="animate-fade-in-up space-y-3">
                        <button 
                            onClick={() => onComplete('craving_beaten')}
                            className="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg shadow-lg hover:bg-green-600"
                        >
                            הצלחתי להתאפק (בונוס!)
                        </button>
                        <button 
                            onClick={() => onComplete('smoked')}
                            className="w-full py-3 text-gray-400 font-medium text-sm hover:text-gray-600"
                        >
                            אני עדיין רוצה לעשן (פחות נקודות)
                        </button>
                    </div>
                )}
                
                {waitSeconds > 0 && (
                     <p className="text-sm text-red-400 font-medium animate-pulse">הכפתורים יופיעו בסיום הספירה...</p>
                )}
            </div>
        </div>
      );
  }

  // Step 2: Intervention - AI Motivation
  if (step === 'intervention') {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl border-t-4 border-blue-500">
          <div className="flex justify-center mb-4">
             <AlertTriangle className="w-12 h-12 text-blue-500" />
          </div>
          
          <h3 className="text-xl font-bold text-center mb-4">רגע אחד!</h3>
          
          <div className="bg-blue-50 p-4 rounded-xl mb-6 min-h-[100px] flex items-center justify-center text-center">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
            ) : (
              <p className="text-lg font-medium text-blue-900 leading-relaxed">"{aiMessage}"</p>
            )}
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => onComplete('craving_beaten')}
              className="w-full py-4 rounded-xl bg-green-500 text-white font-bold text-lg shadow-lg hover:bg-green-600 transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-6 h-6" />
              <span>ויתרתי! אני חזק יותר</span>
            </button>

            <button 
              onClick={() => onComplete('smoked')}
              className="w-full py-3 rounded-xl bg-transparent border-2 border-gray-200 text-gray-500 font-medium hover:bg-gray-50"
            >
              אני עדיין רוצה לעשן
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
