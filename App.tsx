import React, { useState, useMemo } from 'react';
import { ClockHeader } from './components/ClockHeader';
import { AttendanceForm } from './components/AttendanceForm';
import { ReportTable } from './components/ReportTable';
import { AttendanceRecord, ClassInfo } from './types';
import { SCHOOL_CLASSES } from './constants';
import { CheckCircle2, Edit3, PlusCircle, LayoutGrid, List } from 'lucide-react';

// TODO: นำ Web App URL ที่ได้จากการ Deploy Google Apps Script มาวางตรงนี้
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwl7CLYgjh3OqfvtB0qJEmwOgBompEqeL25rjjswXoW-EWUhaSWBt4n8HO9S8Igxr5s/exec"; 

// Color Themes per class for Dashboard
const CLASS_THEMES: Record<string, { border: string, bg: string, hover: string, text: string, icon: string, header: string }> = {
  'k2': { border: 'border-pink-300', bg: 'bg-pink-50', hover: 'hover:bg-pink-100', text: 'text-pink-900', icon: 'text-pink-500', header: 'bg-pink-600' },
  'k3': { border: 'border-orange-300', bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-900', icon: 'text-orange-500', header: 'bg-orange-600' },
  'p1': { border: 'border-amber-300', bg: 'bg-amber-50', hover: 'hover:bg-amber-100', text: 'text-amber-900', icon: 'text-amber-600', header: 'bg-amber-600' },
  'p2': { border: 'border-lime-300', bg: 'bg-lime-50', hover: 'hover:bg-lime-100', text: 'text-lime-900', icon: 'text-lime-600', header: 'bg-lime-600' },
  'p3': { border: 'border-emerald-300', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-900', icon: 'text-emerald-600', header: 'bg-emerald-600' },
  'p4': { border: 'border-cyan-300', bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', text: 'text-cyan-900', icon: 'text-cyan-600', header: 'bg-cyan-600' },
  'p5': { border: 'border-blue-300', bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-900', icon: 'text-blue-600', header: 'bg-blue-600' },
  'p6': { border: 'border-violet-300', bg: 'bg-violet-50', hover: 'hover:bg-violet-100', text: 'text-violet-900', icon: 'text-violet-600', header: 'bg-violet-600' },
};

const DEFAULT_THEME = { border: 'border-gray-200', bg: 'bg-white', hover: 'hover:bg-gray-50', text: 'text-gray-800', icon: 'text-gray-400', header: 'bg-gray-700' };

const App: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate] = useState(new Date().toISOString().split('T')[0]);

  // -- Google Sheets Logic --
  const sendToGoogleSheets = async (record: AttendanceRecord) => {
    if (GOOGLE_SCRIPT_URL.includes("วาง_URL")) {
      console.warn("กรุณาใส่ Google Script Web App URL ในไฟล์ App.tsx");
      return;
    }
    const formData = new FormData();
    formData.append('date', record.date);
    formData.append('timestamp', new Date(record.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }));
    formData.append('class', record.className);
    formData.append('teacher', record.teacherName);
    formData.append('total_students', record.totalStudents.toString());
    formData.append('male_present', record.malePresent.toString());
    formData.append('female_present', record.femalePresent.toString());
    formData.append('total_present', record.totalPresent.toString());
    
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors' 
      });
    } catch (e) {
      console.error('Error sending to Google Sheet:', e);
    }
  };

  const handleSaveRecord = (newRecord: AttendanceRecord) => {
    setRecords(prev => {
      const filtered = prev.filter(r => !(r.classId === newRecord.classId && r.date === newRecord.date));
      const updated = [...filtered, newRecord].sort((a, b) => {
        const indexA = SCHOOL_CLASSES.findIndex(c => c.id === a.classId);
        const indexB = SCHOOL_CLASSES.findIndex(c => c.id === b.classId);
        return indexA - indexB;
      });
      return updated;
    });
    sendToGoogleSheets(newRecord);
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('คุณต้องการลบข้อมูลนี้ใช่หรือไม่?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // -- Dashboard Helpers --
  const getRecordForClass = (classId: string) => {
    return records.find(r => r.classId === classId && r.date === currentDate);
  };

  const openModal = (cls: ClassInfo) => {
    setSelectedClass(cls);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  // Progress Calculation
  const progressPercentage = useMemo(() => {
    const recordedCount = SCHOOL_CLASSES.filter(c => getRecordForClass(c.id)).length;
    return Math.round((recordedCount / SCHOOL_CLASSES.length) * 100);
  }, [records, currentDate]);

  return (
    <div className="min-h-screen pb-20 bg-slate-50 font-sarabun">
      <ClockHeader />
      
      <main className="container mx-auto px-4 -mt-6 relative z-10">
        
        {/* Progress Section */}
        <div className="bg-white rounded-xl shadow-sm border-l-4 border-yellow-400 p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 w-full md:w-auto">
             <div className="p-4 bg-blue-100 text-blue-900 rounded-full shadow-sm">
               <LayoutGrid size={28} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-blue-900">ภาพรวมการบันทึกวันนี้</h2>
               <p className="text-gray-500 text-sm mt-1">
                 บันทึกแล้ว <span className="font-bold text-blue-600 text-lg">{SCHOOL_CLASSES.filter(c => getRecordForClass(c.id)).length}</span> 
                 <span className="mx-1">/</span> 
                 {SCHOOL_CLASSES.length} ห้องเรียน
               </p>
             </div>
          </div>
          
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>ความคืบหน้า</span>
              <span className="text-blue-600">{progressPercentage}%</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300 shadow-md transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {SCHOOL_CLASSES.map((cls) => {
            const record = getRecordForClass(cls.id);
            const isDone = !!record;
            const theme = CLASS_THEMES[cls.id] || DEFAULT_THEME;

            return (
              <button
                key={cls.id}
                onClick={() => openModal(cls)}
                className={`relative group p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col justify-between h-36 shadow-sm hover:shadow-xl hover:-translate-y-1
                  ${isDone 
                    ? 'bg-white border-green-400 shadow-green-100' 
                    : `${theme.bg} ${theme.border} ${theme.hover}`
                  }`}
              >
                <div className="flex justify-between items-start w-full z-10">
                  <div>
                    <h3 className={`font-bold text-xl ${isDone ? 'text-green-800' : theme.text}`}>
                      {cls.name}
                    </h3>
                    <p className={`text-sm mt-1 font-medium ${isDone ? 'text-gray-500' : 'text-gray-600 opacity-80'}`}>
                      นักเรียน {cls.totalStudents} คน
                    </p>
                  </div>
                  {isDone ? (
                     <div className="bg-green-100 p-2 rounded-full text-green-600">
                       <CheckCircle2 size={28} />
                     </div>
                  ) : (
                     <div className={`p-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm transition-colors ${theme.icon}`}>
                       <PlusCircle size={24} />
                     </div>
                  )}
                </div>

                {isDone ? (
                  <div className="mt-auto pt-3 border-t border-dashed border-green-200 flex items-center gap-2 text-xs font-bold text-green-700">
                    <Edit3 size={14} />
                    <span>บันทึกเรียบร้อย (แก้ไข)</span>
                  </div>
                ) : (
                  <div className={`mt-auto pt-3 border-t border-dashed border-black/5 flex items-center gap-2 text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity ${theme.text}`}>
                    <span>คลิกเพื่อบันทึกข้อมูล</span>
                  </div>
                )}
                
                {/* Decorative background pattern */}
                {!isDone && (
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
                    <List size={100} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Form */}
        {isModalOpen && selectedClass && (
          <AttendanceForm 
            targetClass={selectedClass}
            existingRecord={getRecordForClass(selectedClass.id)}
            onSave={handleSaveRecord}
            onClose={closeModal}
            colorTheme={CLASS_THEMES[selectedClass.id]?.header || 'bg-blue-900'}
          />
        )}

        {/* Report Table Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-blue-900 to-blue-800 border-b border-blue-700 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400 rounded-lg text-blue-900 shadow-lg">
                <List size={20} />
              </div>
              <div>
                 <h3 className="font-bold text-lg">ตารางสรุปข้อมูลการมาเรียน</h3>
                 <p className="text-xs text-blue-200 font-light">รายงานแบบ Real-time ประจำวัน</p>
              </div>
            </div>
          </div>
          <ReportTable records={records} onDelete={handleDeleteRecord} />
        </div>

      </main>
    </div>
  );
};

export default App;