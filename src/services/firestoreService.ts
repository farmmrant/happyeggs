import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DailyReport, FarmSettings } from '../types';
import { generateInitialReports, DEFAULT_FARM_SETTINGS } from '../utils/storage';

const REPORTS_COLLECTION = 'daily_reports';
const SETTINGS_COLLECTION = 'farm_settings';
const SETTINGS_DOC_ID = 'default';

/**
 * Subscribe to real-time updates for all daily reports in Firestore.
 * Automatically orders by date descending.
 * If the collection is initially empty, seeds it with initial reports.
 */
export function subscribeDailyReports(
  onUpdate: (reports: DailyReport[]) => void,
  onError?: (err: Error) => void
): () => void {
  const reportsCol = collection(db, REPORTS_COLLECTION);
  const q = query(reportsCol, orderBy('date', 'desc'));

  let isFirstCheck = true;

  const unsubscribe = onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty && isFirstCheck) {
        isFirstCheck = false;
        // Check if truly empty
        try {
          const freshReports = generateInitialReports();
          const batch = writeBatch(db);
          freshReports.forEach((r) => {
            const docRef = doc(db, REPORTS_COLLECTION, r.id);
            batch.set(docRef, {
              ...r,
              notes: r.notes || '',
              otherExpenses: r.otherExpenses || [],
              updatedAt: new Date().toISOString(),
            });
          });
          await batch.commit();
          // onSnapshot will fire again automatically with the committed docs
          return;
        } catch (seedErr) {
          console.error('Error seeding initial reports to Firestore:', seedErr);
        }
      }

      isFirstCheck = false;
      const reports: DailyReport[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          date: data.date,
          flockName: data.flockName || '',
          activeHens: Number(data.activeHens) || 0,
          deadHens: Number(data.deadHens) || 0,
          culledHens: Number(data.culledHens) || 0,
          eggGoodPieces: Number(data.eggGoodPieces) || 0,
          eggBrokenPieces: Number(data.eggBrokenPieces) || 0,
          eggWeightKg: Number(data.eggWeightKg) || 0,
          feedConsumptionKg: Number(data.feedConsumptionKg) || 0,
          feedType: data.feedType || '',
          feedPricePerKg: Number(data.feedPricePerKg) || 0,
          eggSellingPricePerKg: Number(data.eggSellingPricePerKg) || 0,
          otherExpenses: Array.isArray(data.otherExpenses) ? data.otherExpenses : [],
          notes: data.notes || '',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });

      onUpdate(reports);
    },
    (err) => {
      console.error('Firestore daily_reports onSnapshot error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribe to real-time farm settings in Firestore.
 */
export function subscribeFarmSettings(
  onUpdate: (settings: FarmSettings) => void,
  onError?: (err: Error) => void
): () => void {
  const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

  const unsubscribe = onSnapshot(
    settingsDocRef,
    async (docSnap) => {
      if (!docSnap.exists()) {
        try {
          await setDoc(settingsDocRef, {
            ...DEFAULT_FARM_SETTINGS,
            updatedAt: new Date().toISOString(),
          });
          onUpdate(DEFAULT_FARM_SETTINGS);
        } catch (err) {
          console.error('Error setting initial farm_settings:', err);
          onUpdate(DEFAULT_FARM_SETTINGS);
        }
        return;
      }

      const data = docSnap.data();
      onUpdate({
        farmName: data.farmName || DEFAULT_FARM_SETTINGS.farmName,
        flockName: data.flockName || DEFAULT_FARM_SETTINGS.flockName,
        chickenAgeWeeks: Number(data.chickenAgeWeeks) || DEFAULT_FARM_SETTINGS.chickenAgeWeeks,
        initialPopulation: Number(data.initialPopulation) || DEFAULT_FARM_SETTINGS.initialPopulation,
        defaultFeedPricePerKg: Number(data.defaultFeedPricePerKg) || DEFAULT_FARM_SETTINGS.defaultFeedPricePerKg,
        defaultEggPricePerKg: Number(data.defaultEggPricePerKg) || DEFAULT_FARM_SETTINGS.defaultEggPricePerKg,
        defaultFeedType: data.defaultFeedType || DEFAULT_FARM_SETTINGS.defaultFeedType,
      });
    },
    (err) => {
      console.error('Firestore farm_settings onSnapshot error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Save or update a daily report in Firestore
 */
export async function saveDailyReportToFirestore(report: DailyReport): Promise<void> {
  const reportDocRef = doc(db, REPORTS_COLLECTION, report.id);
  await setDoc(
    reportDocRef,
    {
      id: report.id,
      date: report.date,
      flockName: report.flockName || '',
      activeHens: Number(report.activeHens) || 0,
      deadHens: Number(report.deadHens) || 0,
      culledHens: Number(report.culledHens) || 0,
      eggGoodPieces: Number(report.eggGoodPieces) || 0,
      eggBrokenPieces: Number(report.eggBrokenPieces) || 0,
      eggWeightKg: Number(report.eggWeightKg) || 0,
      feedConsumptionKg: Number(report.feedConsumptionKg) || 0,
      feedType: report.feedType || '',
      feedPricePerKg: Number(report.feedPricePerKg) || 0,
      eggSellingPricePerKg: Number(report.eggSellingPricePerKg) || 0,
      otherExpenses: (report.otherExpenses || []).map((exp) => ({
        id: exp.id,
        category: exp.category,
        description: exp.description || '',
        amount: Number(exp.amount) || 0,
      })),
      notes: report.notes || '',
      createdAt: report.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Delete a daily report from Firestore
 */
export async function deleteDailyReportFromFirestore(reportId: string): Promise<void> {
  const reportDocRef = doc(db, REPORTS_COLLECTION, reportId);
  await deleteDoc(reportDocRef);
}

/**
 * Save farm profile & settings to Firestore
 */
export async function saveFarmSettingsToFirestore(settings: FarmSettings): Promise<void> {
  const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  await setDoc(
    settingsDocRef,
    {
      ...settings,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/**
 * Reset demo data directly in Firestore
 */
export async function resetDemoReportsInFirestore(): Promise<void> {
  // 1. Delete existing documents
  const reportsCol = collection(db, REPORTS_COLLECTION);
  const snap = await getDocs(reportsCol);
  const deleteBatch = writeBatch(db);
  snap.docs.forEach((d) => {
    deleteBatch.delete(d.ref);
  });
  await deleteBatch.commit();

  // 2. Insert fresh initial reports
  const freshReports = generateInitialReports();
  const insertBatch = writeBatch(db);
  freshReports.forEach((r) => {
    const docRef = doc(db, REPORTS_COLLECTION, r.id);
    insertBatch.set(docRef, {
      ...r,
      notes: r.notes || '',
      otherExpenses: r.otherExpenses || [],
      updatedAt: new Date().toISOString(),
    });
  });
  await insertBatch.commit();
}
