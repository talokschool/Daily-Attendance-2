import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export const ClockHeader: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Target: 09:00 AM Today
      const target = new Date();
      target.setHours(9, 0, 0, 0);

      const diff = target.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        setIsLate(false);
      } else {
        setTimeLeft('หมดเวลา (09:00 น.)');
        setIsLate(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateThai = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      weekday: 'long' 
    };
    return date.toLocaleDateString('th-TH', options);
  };

  return (
    <div className="bg-blue-900 text-white p-6 shadow-lg border-b-4 border-yellow-400 no-print">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 shadow-md">
             <Clock size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">โรงเรียนบ้านตะโละ - ระบบบันทึกการมาเรียน</h1>
            <p className="text-yellow-200 text-sm md:text-base font-medium">{formatDateThai(currentTime)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-center md:justify-end">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-blue-200 uppercase tracking-wider">เวลาปัจจุบัน</p>
            <div className="text-2xl font-mono font-bold flex items-center gap-2 justify-end text-white">
              {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>

          <div className={`flex flex-col items-end px-4 py-2 rounded-lg border-2 shadow-inner bg-blue-950/50 ${isLate ? 'border-red-400 text-red-100' : 'border-green-400 text-green-100'}`}>
            <p className="text-[10px] opacity-80 uppercase tracking-wider">นับถอยหลัง (09.00 น.)</p>
            <div className="text-xl font-mono font-bold flex items-center gap-2">
              {isLate && <AlertCircle size={18} />}
              {timeLeft}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};