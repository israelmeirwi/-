
import React from 'react';
import { X, Watch, Share, Copy } from 'lucide-react';

interface WatchInstructionsProps {
  onClose: () => void;
}

export const WatchInstructions: React.FC<WatchInstructionsProps> = ({ onClose }) => {
  const watchUrl = `${window.location.origin}${window.location.pathname}?mode=watch`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(watchUrl);
    alert('הקישור הועתק!');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                <Watch className="text-blue-600" />
                חיבור לשעון חכם
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>

        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-bold text-blue-800 text-sm mb-2">1. העתק את הקישור המיוחד</h3>
                <div className="flex items-center gap-2 bg-white p-3 rounded-lg border border-blue-100">
                    <code className="text-xs text-gray-500 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                        {watchUrl}
                    </code>
                    <button onClick={copyToClipboard} className="text-blue-600 p-1">
                        <Copy size={16} />
                    </button>
                </div>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3">עבור Apple Watch</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>פתח את אפליקציית <strong>Shortcuts</strong> באייפון.</li>
                    <li>צור קיצור חדש ובחר בפעולה <strong>Open URL</strong>.</li>
                    <li>הדבק את הקישור שהעתקת למעלה.</li>
                    <li>תן לקיצור שם (למשל "תיעוד סיגריה").</li>
                    <li>לחץ על ה-<strong>i</strong> או על הגדרות הקיצור וסמן <strong>Show on Apple Watch</strong>.</li>
                    <li>כעת הקיצור יופיע בשעון שלך כלחיצה אחת!</li>
                </ol>
            </div>

            <div>
                <h3 className="font-bold text-gray-800 mb-3">עבור Android / Wear OS</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>שלח את הקישור לעצמך (בוואטסאפ או במייל).</li>
                    <li>פתח את הקישור בדפדפן של השעון (אם קיים).</li>
                    <li>או: צור ווידג'ט של דפדפן/סימניה במסך הבית של הטלפון לגישה מהירה.</li>
                </ol>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                    טיפ: ניתן להוסיף קישור זה גם למסך הבית של הטלפון כ"אפליקציה" נפרדת לתיעוד מהיר.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
