import React, { useState, useEffect } from 'react';
import { Save, Users, CheckCircle, AlertTriangle, X, UserCheck, UserX, Clock, AlertCircle } from 'lucide-react';
import { TEACHERS } from '../constants';
import { ClassInfo, AttendanceRecord } from '../types';

interface AttendanceFormProps {
  targetClass: ClassInfo;
  existingRecord?: AttendanceRecord;
  onSave: (record: AttendanceRecord) => void;
  onClose: () => void;
  colorTheme?: string; // Header background color class
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ 
  targetClass, 
  existingRecord, 
  onSave, 
  onClose,
  colorTheme = 'bg-blue-900' 
}) => {
  const [teacherName, setTeacherName] = useState<string>('');
  const [malePresent, setMalePresent] = useState<number | ''>('');
  const [femalePresent, setFemalePresent] = useState<number | ''>('');
  const [recordDate, setRecordDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Timer State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isLate, setIsLate] = useState(false);

  // Filter teachers based on class level
  // K2, K3: Show ONLY 'วันไซนับ' and 'ซีตีอามีเนาะ'
  // Others (P1-P6): Show everyone ELSE (exclude 'วันไซนับ' and 'ซีตีอามีเนาะ')
  const availableTeachers = (targetClass.id === 'k2' || targetClass.id === 'k3')
    ? TEACHERS.filter(t => t.includes('วันไซนับ') || t.includes('ซีตีอามีเนาะ'))
    : TEACHERS.filter(t => !t.includes('วันไซนับ') && !t.includes('ซีตีอามีเนาะ'));

  // Load existing record if available
  useEffect(() => {
    if (existingRecord) {
      setTeacherName(existingRecord.teacherName);
      setMalePresent(existingRecord.malePresent);
      setFemalePresent(existingRecord.femalePresent);
      setRecordDate(existingRecord.date);
    } else {
      // Defaults
      setTeacherName('');
      setMalePresent('');
      setFemalePresent('');
      setRecordDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [targetClass, existingRecord]);

  // Timer Effect
  useEffect(() => {
    const updateTime = () => {
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
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Validation Check
  const isFormValid = () => {
    if (!teacherName) return false;
    if (malePresent === '' || femalePresent === '') return false;
    const m = Number(malePresent);
    const f = Number(femalePresent);
    if (m < 0 || f < 0) return false;
    
    // Optional: Strict validation against total count
    const totalInput = m + f;
    if (totalInput > targetClass.totalStudents) return false;
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!isFormValid()) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง');
      return;
    }

    const m = Number(malePresent);
    const f = Number(femalePresent);
    const totalInput = m + f;

    // Specific Logic Checks
    if (targetClass.totalMale !== undefined && m > targetClass.totalMale) {
       setError(`จำนวนนักเรียนชาย (${m}) เกินกว่าจำนวนที่มีอยู่จริง (${targetClass.totalMale})`);
       return;
    }
    if (targetClass.totalFemale !== undefined && f > targetClass.totalFemale) {
       setError(`จำนวนนักเรียนหญิง (${f}) เกินกว่าจำนวนที่มีอยู่จริง (${targetClass.totalFemale})`);
       return;
    }

    setIsSaving(true);

    const newRecord: AttendanceRecord = {
      id: existingRecord ? existingRecord.id : Date.now().toString(),
      date: recordDate,
      timestamp: Date.now(),
      classId: targetClass.id,
      className: targetClass.name,
      teacherName: teacherName,
      malePresent: m,
      femalePresent: f,
      totalPresent: totalInput,
      totalStudents: targetClass.totalStudents
    };

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(newRecord);
      setSuccessMsg('บันทึกข้อมูลเรียบร้อยแล้ว');
      
      // Close after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSaving(false);
    }
  };

  const mCount = malePresent === '' ? 0 : Number(malePresent);
  const fCount = femalePresent === '' ? 0 : Number(femalePresent);
  const currentTotal = mCount + fCount;
  const absentCount = targetClass.totalStudents - currentTotal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 border border-gray-100">
        
        {/* Header with Dynamic Color - Compact */}
        <div className={`${colorTheme} p-4 relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10 mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white text-gray-800 rounded-lg shadow-md">
                <Users size={20} className="text-current" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{targetClass.name}</h2>
                <div className="flex items-center gap-2 text-blue-100 text-xs mt-0.5">
                   <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px] font-medium">
                      ทั้งหมด {targetClass.totalStudents} คน
                   </span>
                </div>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/20 transition-all p-1.5 rounded-full"
            >
              <X size={20} />
            </button>
          </div>

          {/* Time Display Section - Compact */}
          <div className="flex items-center justify-between bg-white/10 rounded-md p-1.5 px-3 backdrop-blur-sm relative z-10 border border-white/10">
             <div className="flex items-center gap-1.5 text-white">
                <Clock size={14} className="text-white/80" />
                <span className="text-xs font-mono font-bold tracking-wide">
                  {currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
             </div>
             <div className={`flex items-center gap-1.5 text-xs font-bold ${isLate ? 'text-red-200' : 'text-green-200'}`}>
                {isLate ? <AlertCircle size={14} /> : <span className="text-[10px] uppercase opacity-70">เหลือเวลา</span>}
                <span className="font-mono">{timeLeft}</span>
             </div>
          </div>
        </div>

        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Date & Teacher Row - Compact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">วันที่บันทึก</label>
                <input
                  type="date"
                  required
                  value={recordDate}
                  onChange={(e) => setRecordDate(e.target.value)}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-gray-50 font-medium text-gray-700 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-wide">ครูผู้บันทึก</label>
                <select
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-yellow-400 outline-none transition-all appearance-none bg-white ${!teacherName ? 'border-red-300 text-gray-400' : 'border-gray-200 text-gray-800 font-medium'}`}
                >
                  <option value="" disabled>-- เลือกรายชื่อ --</option>
                  {availableTeachers.map((t, idx) => (
                    <option key={idx} value={t} className="text-gray-800">{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-1"></div>

            {/* Student Counts - Big Inputs Compact */}
            <div className="grid grid-cols-2 gap-3">
               {/* Male Input */}
               <div className="bg-gradient-to-b from-blue-50 to-white p-3 rounded-xl border border-blue-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <label className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-800 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  ชาย (มา)
                </label>
                <input
                  type="number"
                  min="0"
                  value={malePresent}
                  onChange={(e) => setMalePresent(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full py-2 text-3xl font-bold text-center text-blue-700 bg-white border-2 border-blue-100 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none transition-all placeholder-blue-200"
                  placeholder="0"
                />
                {targetClass.totalMale !== undefined && (
                  <div className="mt-1.5 text-[10px] font-medium text-blue-400 bg-blue-50 inline-block px-1.5 py-0.5 rounded">
                    จาก {targetClass.totalMale}
                  </div>
                )}
              </div>
              
              {/* Female Input */}
              <div className="bg-gradient-to-b from-pink-50 to-white p-3 rounded-xl border border-pink-100 text-center shadow-sm hover:shadow-md transition-shadow">
                <label className="flex items-center justify-center gap-1.5 text-xs font-bold text-pink-800 mb-2">
                   <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                   หญิง (มา)
                </label>
                <input
                  type="number"
                  min="0"
                  value={femalePresent}
                  onChange={(e) => setFemalePresent(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full py-2 text-3xl font-bold text-center text-pink-700 bg-white border-2 border-pink-100 rounded-lg focus:ring-4 focus:ring-pink-100 focus:border-pink-300 outline-none transition-all placeholder-pink-200"
                  placeholder="0"
                />
                {targetClass.totalFemale !== undefined && (
                  <div className="mt-1.5 text-[10px] font-medium text-pink-400 bg-pink-50 inline-block px-1.5 py-0.5 rounded">
                    จาก {targetClass.totalFemale}
                  </div>
                )}
              </div>
            </div>

            {/* Live Summary Card - Compact */}
            <div className="flex divide-x divide-gray-200 bg-slate-50 rounded-lg border border-gray-200 overflow-hidden">
              <div className="flex-1 p-3 flex flex-col items-center justify-center">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                   <UserCheck size={12} className="text-green-500" /> มาเรียน
                 </span>
                 <div className="text-xl font-bold text-green-600 leading-none">{currentTotal}</div>
              </div>
              <div className="flex-1 p-3 flex flex-col items-center justify-center bg-red-50/30">
                 <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                   <UserX size={12} className="text-red-500" /> ขาดเรียน
                 </span>
                 <div className={`text-xl font-bold leading-none ${absentCount < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                    {absentCount}
                 </div>
              </div>
            </div>

            {/* Error / Success Messages - Compact */}
            <div className="min-h-[18px]">
              {error && (
                <div className="p-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2 animate-shake">
                  <AlertTriangle size={14} className="shrink-0" />
                  {error}
                </div>
              )}
              
              {successMsg && (
                <div className="p-2 bg-green-50 border border-green-100 text-green-700 text-xs rounded-lg flex items-center gap-2 animate-bounce-in">
                  <CheckCircle size={14} className="shrink-0" />
                  {successMsg}
                </div>
              )}
            </div>

            {/* Actions - Compact */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 hover:text-gray-800 transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving || !!successMsg || !isFormValid()}
                className={`flex-[2] font-bold py-2.5 px-3 rounded-xl shadow-lg transform transition-all duration-200 flex justify-center items-center gap-2 text-sm ${
                  isSaving || successMsg || !isFormValid()
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-yellow-400 hover:bg-yellow-300 text-blue-900 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSaving ? 'กำลังบันทึก...' : successMsg ? 'บันทึกแล้ว' : (
                  <>
                    <Save size={16} />
                    บันทึกข้อมูล
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};