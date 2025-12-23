import { ref, get, child, update } from 'firebase/database';
import { db } from './firebase';
import { Student, MealType, ScanResult } from '../types';

/**
 * Helper to get YYYY-MM-DD string in local time
 */
const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Fetches a student by their ID.
 */
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `students/${studentId}`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      const mealsToday = data.mealsToday || { breakfast: false, lunch: false, dinner: false };
      return { id: studentId, ...data, mealsToday };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching student:", error);
    throw error;
  }
};

/**
 * Processes a scan: Validates payment/date/meal status and updates DB if allowed.
 */
export const processMealScan = async (qrContent: string, mealType: MealType): Promise<ScanResult> => {
  let studentId = qrContent;
  if (qrContent.startsWith('studentID-')) {
    studentId = qrContent.split('-')[1];
  }

  if (!studentId || studentId.length > 20) {
      return { status: 'error', message: 'Invalid QR Code format.' };
  }

  try {
    const student = await getStudent(studentId);

    if (!student) {
      return { status: 'error', message: `Student ID '${studentId}' not found.` };
    }

    if (!student.hasPaid) {
      return { status: 'error', message: 'Fees NOT paid.', student };
    }

    const today = getLocalDateString();
    if (student.validTill < today) {
      return { status: 'error', message: `Expired on ${student.validTill}.`, student };
    }

    // Check if meal already taken today
    // We check the specific logs for today to be absolutely sure
    const dbRef = ref(db);
    const existingLog = await get(child(dbRef, `mealLogs/${today}/${studentId}/${mealType}`));
    
    if (existingLog.exists() && existingLog.val() === true) {
      return { status: 'warning', message: `Already took ${mealType}.`, student };
    }

    const updates: any = {};
    updates[`/students/${studentId}/mealsToday/${mealType}`] = true;
    updates[`/mealLogs/${today}/${studentId}/${mealType}`] = true;
    
    await update(ref(db), updates);

    const updatedStudent = {
        ...student,
        mealsToday: {
            ...student.mealsToday,
            [mealType]: true
        }
    };

    return { status: 'success', message: 'Allowed. Meal recorded.', student: updatedStudent };

  } catch (error) {
    console.error(error);
    return { status: 'error', message: 'Database error. Check console.' };
  }
};