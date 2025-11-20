import React, { useState, useEffect } from 'react';
import { getDistraction } from '../services/geminiService';
import { X, Wind, Lightbulb, Play } from 'lucide-react';

interface CravingModeProps {
  onClose: () => void;
}

export const CravingMode: React.FC<CravingModeProps> = ({ onClose }) => {
  const [mode, setMode] = useState<'menu' | 'breathe' | 'distract'>('menu');
  const [distraction, setDistraction] = useState<{title: string, content: string} | null>(null);

  useEffect(() => {
    if (mode === 'distract' && !distraction) {
      getDistraction().then(setDistraction);
    }
  }, [mode, distraction]);

  // Breathing Component
  const BreathingView = () => {
    const [seconds, setSeconds] = useState(60);
    const [instruction, setInstruction] = useState("לשאוף...");

    useEffect(() => {
      const timer = setInterval(() => {
        setSeconds((s) => {
            if (s <= 1) {
                clearInterval(timer);
                return 0;
            }
            return s - 1;
        });
      }, 1000);

      const breathCycle = setInterval(() => {
        setInstruction(prev => prev === "לשאוף..." ? "לנשוף..." : "לשאוף...");
      }, 4000);

      return () => {
          clearInterval(timer);
          clearInterval(breathCycle);
      };
    }, []);

    return (
      <div className="flex flex-col items-center justify-center h-full text-white">
        <div className="text-4xl font-bold mb-12">{seconds} שניות</div>
        
        <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-breathe"></div>
            <div className="absolute inset-8 bg-blue-500 rounded-full opacity-40 animate-breathe" style={{ animationDelay: '0.5s' }}></div>
            <div className="z-10 text-2xl font-bold">{instruction}</div>
        </div>

        <button onClick={() => setMode('menu')} className="mt-12 text-white/80 hover:text-white">
          חזרה
        </button>
      </div>
    );
  };

  // Distraction Component
  const DistractView = () => {
    if (!distraction) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>מחפש עובדה מעניינת...</p>
            </div>
        );
    }
    return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center text-white">
            <Lightbulb className="w-16 h-16 mb-6 text-yellow-300" />
            <h3 className="text-2xl font-bold mb-4">{distraction.title}</h3>
            <p className="text-lg leading-relaxed mb-8">{distraction.content}</p>
            <button 
                onClick={() => setDistraction(null)} 
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-bold"
            >
                תן לי עוד אחד
            </button>
             <button onClick={() => setMode('menu')} className="mt-8 text-white/80 hover:text-white">
              חזרה
            </button>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 z-50 flex flex-col">
      <div className="p-4 flex justify-end">
        <button onClick={onClose} className="text-white/80 hover:text-white p-2">
            <X size={32} />
        </button>
      </div>

      <div className="flex-1">
        {mode === 'menu' && (
          <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
            <h2 className="text-3xl font-bold text-white text-center mb-8">אנחנו נעבור את זה ביחד. <br/>מה יעזור לך עכשיו?</h2>
            
            <button 
                onClick={() => setMode('breathe')}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-colors text-white text-right"
            >
                <div className="bg-blue-400 p-3 rounded-full">
                    <Wind className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">נשימה מודרכת</h3>
                    <p className="text-white/70 text-sm">דקה של רוגע להורדת הלחץ</p>
                </div>
            </button>

            <button 
                onClick={() => setMode('distract')}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl flex items-center gap-4 hover:bg-white/20 transition-colors text-white text-right"
            >
                <div className="bg-purple-400 p-3 rounded-full">
                    <Lightbulb className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">הסחת דעת</h3>
                    <p className="text-white/70 text-sm">עובדה מעניינת או חידה קצרה</p>
                </div>
            </button>
          </div>
        )}

        {mode === 'breathe' && <BreathingView />}
        {mode === 'distract' && <DistractView />}
      </div>
    </div>
  );
};
