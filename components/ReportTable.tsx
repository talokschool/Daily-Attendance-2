import React from 'react';
import { Printer, Trash2, FileSpreadsheet } from 'lucide-react';
import { AttendanceRecord } from '../types';

interface ReportTableProps {
  records: AttendanceRecord[];
  onDelete: (id: string) => void;
}

export const ReportTable: React.FC<ReportTableProps> = ({ records, onDelete }) => {
  
  const totalMale = records.reduce((acc, r) => acc + r.malePresent, 0);
  const totalFemale = records.reduce((acc, r) => acc + r.femalePresent, 0);
  const grandTotalPresent = totalMale + totalFemale;
  const totalStudentsRegistered = records.reduce((acc, r) => acc + r.totalStudents, 0);

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const headers = ["Date", "Class", "Time", "Teacher", "Total Students", "Male Present", "Female Present", "Total Present", "Absent"];
    const rows = records.map(r => [
      r.date,
      r.className,
      new Date(r.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      r.teacherName,
      r.totalStudents,
      r.malePresent,
      r.femalePresent,
      r.totalPresent,
      r.totalStudents - r.totalPresent
    ]);

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-200 mb-4 animate-pulse">
          <FileSpreadsheet size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-400">ยังไม่มีข้อมูลการบันทึก</h3>
        <p className="text-gray-400 text-sm mt-2">กรุณาเลือกห้องเรียนด้านบนเพื่อเริ่มบันทึกข้อมูล</p>
      </div>
    );
  }

  const reportDate = records.length > 0 ? new Date(records[0].date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

  return (
    <div>
      <div className="p-5 border-b border-gray-100 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-yellow-400 rounded-full"></div>
          <div>
            <h2 className="text-lg font-bold text-gray-800">สรุปรายการ</h2>
            <p className="text-xs text-gray-500">วันที่ {reportDate}</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportCSV}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-green-700 bg-white border-2 border-green-100 rounded-lg hover:bg-green-50 hover:border-green-300 transition"
          >
            <FileSpreadsheet size={16} />
            <span>CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-blue-900 bg-yellow-400 border-2 border-yellow-400 rounded-lg hover:bg-yellow-300 hover:border-yellow-300 transition shadow-sm"
          >
            <Printer size={16} />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="overflow-x-auto p-0" id="attendance-table">
        <div className="print-only hidden mb-6" id="print-header">
           <div className="flex items-center gap-4 border-b-2 border-yellow-400 pb-4 mb-4">
             <div className="flex-1">
                <h1 className="text-2xl font-bold text-blue-900">รายงานการมาเรียนประจำวัน</h1>
                <p className="text-sm text-gray-600 mt-1">วันที่: {reportDate}</p>
             </div>
             <div className="text-right">
                <div className="text-xs font-bold text-gray-400 uppercase">โรงเรียน</div>
                <div className="text-lg font-bold text-gray-800">ระบบบันทึกการมาเรียน</div>
             </div>
           </div>
        </div>

        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white text-xs uppercase tracking-wider shadow-sm">
              <th className="px-6 py-4 font-bold border-b-4 border-yellow-400 text-left first:rounded-tl-lg">ระดับชั้น</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400">ทั้งหมด</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 bg-blue-800/50">ชาย</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 bg-pink-800/50">หญิง</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 bg-green-800/50 text-yellow-300">มาเรียน</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 bg-red-800/50">ขาด</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 hidden sm:table-cell print:table-cell">เวลา</th>
              <th className="px-6 py-4 font-bold border-b-4 border-yellow-400 text-left hidden sm:table-cell print:table-cell">ครูผู้บันทึก</th>
              <th className="px-2 py-4 text-center font-bold border-b-4 border-yellow-400 print:hidden no-print last:rounded-tr-lg">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((record, index) => (
              <tr key={record.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-blue-50 transition-colors group`}>
                <td className="px-6 py-3.5 font-bold text-gray-800 border-l-4 border-transparent group-hover:border-yellow-400 transition-all">{record.className}</td>
                <td className="px-2 py-3.5 text-center text-gray-500">{record.totalStudents}</td>
                <td className="px-2 py-3.5 text-center font-semibold text-blue-700 bg-blue-50/30">{record.malePresent}</td>
                <td className="px-2 py-3.5 text-center font-semibold text-pink-700 bg-pink-50/30">{record.femalePresent}</td>
                <td className="px-2 py-3.5 text-center font-bold text-green-700 bg-green-50/30 text-base">{record.totalPresent}</td>
                <td className="px-2 py-3.5 text-center font-bold text-red-500 bg-red-50/30">{record.totalStudents - record.totalPresent}</td>
                <td className="px-2 py-3.5 text-center text-gray-600 hidden sm:table-cell print:table-cell font-medium">
                  {new Date(record.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                </td>
                <td className="px-6 py-3.5 text-gray-600 hidden sm:table-cell print:table-cell text-xs">{record.teacherName}</td>
                <td className="px-2 py-3.5 text-center no-print print:hidden">
                  <button 
                    onClick={() => onDelete(record.id)}
                    className="text-gray-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-all"
                    title="ลบรายการ"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-yellow-50 font-bold text-blue-900 border-t-2 border-yellow-200 print:bg-gray-100 print:border-gray-400">
              <td className="px-6 py-4 text-right text-sm uppercase tracking-wide">รวมทั้งหมด</td>
              <td className="px-2 py-4 text-center text-base">{totalStudentsRegistered}</td>
              <td className="px-2 py-4 text-center text-base text-blue-800">{totalMale}</td>
              <td className="px-2 py-4 text-center text-base text-pink-800">{totalFemale}</td>
              <td className="px-2 py-4 text-center text-lg text-green-700 bg-yellow-100/50">{grandTotalPresent}</td>
              <td className="px-2 py-4 text-center text-lg text-red-600">{totalStudentsRegistered - grandTotalPresent}</td>
              <td className="px-2 py-4 hidden sm:table-cell print:table-cell"></td>
              <td className="px-6 py-4 hidden sm:table-cell print:table-cell"></td>
              <td className="px-2 py-4 no-print print:hidden"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};