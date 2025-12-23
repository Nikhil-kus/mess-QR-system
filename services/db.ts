import { ref, get, child, update } from 'firebase/database';
import { db } from './firebase';
import { Student, MealType, ScanResult } from '../types';

/**
 * Fetches a student by their ID.
 */
export const getStudent = async (studentId: string): Promise<Student | null> => {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, `students/${studentId}`));

    if (snapshot.exists()) {
      const data = snapshot.val();
      // Ensure mealsToday exists even if DB record is partial
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
  // Expected QR format: "studentID-XXX" or just "XXX"
  let studentId = qrContent;
  if (qrContent.startsWith('studentID-')) {
    studentId = qrContent.split('-')[1];
  }

  // Simple validation to prevent processing garbage data
  if (!studentId || studentId.length > 20) {
      return { status: 'error', message: 'Invalid QR Code format.' };
  }

  try {
    const student = await getStudent(studentId);

    if (!student) {
      return { status: 'error', message: `Student ID '${studentId}' not found.` };
    }

    // 1. Check if paid
    if (!student.hasPaid) {
      return { status: 'error', message: 'Fees NOT paid.', student };
    }

    // 2. Check expiry
    const today = new Date().toISOString().split('T')[0];
    if (student.validTill < today) {
      return { status: 'error', message: `Expired on ${student.validTill}.`, student };
    }

    // 3. Check if meal already taken for the current session (fast check)
    if (student.mealsToday && student.mealsToday[mealType]) {
      return { status: 'warning', message: `Already took ${mealType}.`, student };
    }

    // 4. Success - Update DB
    const updates: any = {};
    // Update student's "current" status for their own card view
    updates[`/students/${studentId}/mealsToday/${mealType}`] = true;
    // Record in historical logs for admin reports
    updates[`/mealLogs/${today}/${studentId}/${mealType}`] = true;
    
    await update(ref(db), updates);

    // Return updated student object locally for display
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