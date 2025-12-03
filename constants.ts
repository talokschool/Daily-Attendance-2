import { ClassInfo } from './types';

// Class Data Configuration
export const SCHOOL_CLASSES: ClassInfo[] = [
  { id: 'k2', name: 'ชั้นอนุบาลปีที่ 2', totalStudents: 14, totalMale: 7, totalFemale: 7 },
  { id: 'k3', name: 'ชั้นอนุบาลปีที่ 3', totalStudents: 20, totalMale: 8, totalFemale: 12 },
  { id: 'p1', name: 'ชั้นประถมศึกษาปีที่ 1', totalStudents: 26, totalMale: 19, totalFemale: 7 },
  { id: 'p2', name: 'ชั้นประถมศึกษาปีที่ 2', totalStudents: 19, totalMale: 10, totalFemale: 9 },
  { id: 'p3', name: 'ชั้นประถมศึกษาปีที่ 3', totalStudents: 28, totalMale: 18, totalFemale: 10 },
  { id: 'p4', name: 'ชั้นประถมศึกษาปีที่ 4', totalStudents: 16, totalMale: 7, totalFemale: 9 },
  { id: 'p5', name: 'ชั้นประถมศึกษาปีที่ 5', totalStudents: 19, totalMale: 12, totalFemale: 7 },
  { id: 'p6', name: 'ชั้นประถมศึกษาปีที่ 6', totalStudents: 23, totalMale: 10, totalFemale: 13 },
];

export const TOTAL_STUDENTS = 165;

// Teacher List (Raw)
const RAW_TEACHERS = [
  "นางซีตีอามีเนาะ เลาะนะ",
  "นางสาวโซเฟีย เบ็ญฮาวัน",
  "นางนิภาภรณ์ ซีเดะ",
  "นางซีตีฮาวอ ดาโอะ",
  "นางสูไรญา อาลีมามะ",
  "นางสาววันไซนับ แวดอเลาะ",
  "นางสาวนาดียะห์ ยะโกะ",
  "นางสาวฟิรดาว แลมีซอ",
  "นางสาวฟิรดาวส์ ตะโละมีแย",
  "นางสาวแวรอฮายา สะแลแม",
  "นายมูฮำมัด สะแต",
  "นายอาหามะ โต๊ะมิง",
  "นางสาวซานีซะห์ เฮง",
  "นางสาวซอฟียะฮ์ เจะสะอิ"
];

// Sort teachers alphabetically (Thai locale)
export const TEACHERS = [...RAW_TEACHERS].sort((a, b) => a.localeCompare(b, 'th'));
