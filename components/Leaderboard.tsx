
import React from 'react';
import { Trophy, X, User, Shield, Crown } from 'lucide-react';

interface LeaderboardProps {
  userScore: number;
  userName: string;
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userScore, userName, onClose }) => {
  // Mock data mixed with user data
  const competitors = [
    { name: 'דניאל (האלוף)', score: Math.max(userScore + 150, 450), rank: 1, avatar: 'gold' },
    { name: 'מיכל ג.', score: Math.max(userScore + 50, 320), rank: 2, avatar: 'silver' },
    { name: userName + ' (אני)', score: userScore, rank: 3, isUser: true, avatar: 'bronze' },
    { name: 'רועי ה.', score: Math.max(0, userScore - 40), rank: 4, avatar: 'gray' },
    { name: 'אביב כהן', score: Math.max(0, userScore - 120), rank: 5, avatar: 'gray' },
  ].sort((a, b) => b.score - a.score).map((item, index) => ({ ...item, rank: index + 1 }));

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-fade-in-up">
      <div className="bg-blue-600 text-white p-6 pb-12 rounded-b-3xl shadow-lg relative">
         <button onClick={onClose} className="absolute top-6 left-6 p-2 bg-white/10 rounded-full hover:bg-white/20">
            <X size={24} />
         </button>
         <div className="text-center mt-4">
            <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-300" />
            <h1 className="text-3xl font-black">הליגה השבועית</h1>
            <p className="text-blue-100">תחרות למחזיקים מעמד</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 -mt-8 pb-20">
        <div className="space-y-3">
            {competitors.map((c) => (
                <div 
                    key={c.name}
                    className={`flex items-center p-4 rounded-2xl shadow-sm border ${c.isUser ? 'bg-white border-blue-500 ring-2 ring-blue-100' : 'bg-white border-gray-100'}`}
                >
                    <div className="w-8 text-center font-bold text-gray-400 text-lg">
                        #{c.rank}
                    </div>
                    
                    <div className="mx-4 relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            c.rank === 1 ? 'bg-yellow-100 text-yellow-600' : 
                            c.rank === 2 ? 'bg-gray-100 text-gray-600' :
                            c.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500'
                        }`}>
                             {c.rank === 1 ? <Crown size={20} /> : <User size={20} />}
                        </div>
                        {c.isUser && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                אני
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className={`font-bold ${c.isUser ? 'text-blue-900' : 'text-gray-800'}`}>
                            {c.name}
                        </h3>
                        <div className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">לוחם מתחיל</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <div className="text-lg font-black text-blue-600">{c.score}</div>
                        <div className="text-[10px] text-gray-400 font-medium uppercase">נקודות</div>
                    </div>
                </div>
            ))}
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-2xl text-center">
            <h4 className="font-bold text-blue-900 mb-2">איך מרוויחים נקודות?</h4>
            <ul className="text-sm text-blue-700 space-y-2 text-right inline-block">
                <li>✅ תיעוד סיגריה בזמן (אחרי שהטיימר נגמר): <strong>20 נק'</strong></li>
                <li>🛑 שימוש בכפתור SOS וניצחון על החשק: <strong>50 נק'</strong></li>
                <li>⚠️ חריגה מהזמן: <strong>5 נק' בלבד</strong></li>
            </ul>
        </div>
      </div>
    </div>
  );
};
