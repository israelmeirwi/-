import React, { useState } from 'react';
import { UserConfig } from '../types';

interface OnboardingProps {
  onComplete: (config: UserConfig) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [dailyLimit, setDailyLimit] = useState('10');
  const [avgBefore, setAvgBefore] = useState('20');
  const [packPrice, setPackPrice] = useState('35');
  const [cigsPerPack, setCigsPerPack] = useState('20');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const config: UserConfig = {
      name,
      dailyLimit: parseInt(dailyLimit),
      averageBeforeQuitting: parseInt(avgBefore),
      packPrice: parseInt(packPrice),
      cigarettesPerPack: parseInt(cigsPerPack),
      startDate: Date.now(),
      isOnboarded: true,
      score: 0 // Start with 0 points
    };
    onComplete(config);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <h1 className="text-3xl font-black text-blue-600 mb-2">ברוכים הבאים לנשימה</h1>
        <p className="text-gray-500 mb-8">בוא נגדיר את היעדים שלך לגמילה מוצלחת.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">איך קוראים לך?</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none transition-colors"
              placeholder="השם שלך"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">כמה עישנת ביום בדר"כ?</label>
                <input 
                  required
                  type="number" 
                  value={avgBefore}
                  onChange={e => setAvgBefore(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">מה יעד הסיגריות להיום?</label>
                <input 
                  required
                  type="number" 
                  value={dailyLimit}
                  onChange={e => setDailyLimit(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-blue-200 bg-blue-50 focus:border-blue-500 outline-none text-blue-800 font-bold"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">מחיר חפיסה (₪)</label>
                <input 
                  required
                  type="number" 
                  value={packPrice}
                  onChange={e => setPackPrice(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">סיגריות בחפיסה</label>
                <input 
                  required
                  type="number" 
                  value={cigsPerPack}
                  onChange={e => setCigsPerPack(e.target.value)}
                  className="w-full p-4 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 outline-none"
                />
             </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors mt-4">
            מתחילים בדרך חדשה
          </button>
        </form>
      </div>
    </div>
  );
};
