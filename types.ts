export interface ClassInfo {
  id: string;
  name: string;
  totalStudents: number;
  totalMale?: number;
  totalFemale?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  timestamp: number;
  classId: string;
  className: string;
  teacherName: string;
  malePresent: number;
  femalePresent: number;
  totalPresent: number;
  totalStudents: number;
}

export enum AppView {
  FORM = 'FORM',
  REPORT = 'REPORT',
}