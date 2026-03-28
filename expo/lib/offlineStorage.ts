import AsyncStorage from '@react-native-async-storage/async-storage';
import type { FitnessLogDayFormData } from '@/types/fitness-log';

const OFFLINE_STORAGE_KEY = 'fitness_log_offline_entries';

export interface OfflineEntry {
  id: string;
  logId: string;
  date: string;
  data: FitnessLogDayFormData;
  timestamp: number;
  synced: boolean;
}

/**
 * Save entry data offline when network is unavailable
 */
export async function saveEntryOffline(
  logId: string,
  date: string,
  data: FitnessLogDayFormData
): Promise<void> {
  try {
    const entryId = `${logId}_${date}`;
    const offlineEntry: OfflineEntry = {
      id: entryId,
      logId,
      date,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    const existingEntries = await getOfflineEntries();
    const updatedEntries = existingEntries.filter(entry => entry.id !== entryId);
    updatedEntries.push(offlineEntry);

    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedEntries));
    console.log('Entry saved offline:', entryId);
  } catch (error) {
    console.error('Error saving entry offline:', error);
    throw error;
  }
}

/**
 * Get all offline entries
 */
export async function getOfflineEntries(): Promise<OfflineEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting offline entries:', error);
    return [];
  }
}

/**
 * Get offline entries for a specific log
 */
export async function getOfflineEntriesForLog(logId: string): Promise<OfflineEntry[]> {
  try {
    const allEntries = await getOfflineEntries();
    return allEntries.filter(entry => entry.logId === logId);
  } catch (error) {
    console.error('Error getting offline entries for log:', error);
    return [];
  }
}

/**
 * Get offline entry for a specific date
 */
export async function getOfflineEntry(logId: string, date: string): Promise<OfflineEntry | null> {
  try {
    const allEntries = await getOfflineEntries();
    return allEntries.find(entry => entry.logId === logId && entry.date === date) || null;
  } catch (error) {
    console.error('Error getting offline entry:', error);
    return null;
  }
}

/**
 * Mark entry as synced
 */
export async function markEntrySynced(entryId: string): Promise<void> {
  try {
    const allEntries = await getOfflineEntries();
    const updatedEntries = allEntries.map(entry => 
      entry.id === entryId ? { ...entry, synced: true } : entry
    );
    
    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error marking entry as synced:', error);
  }
}

/**
 * Remove synced entries
 */
export async function removeSyncedEntries(): Promise<void> {
  try {
    const allEntries = await getOfflineEntries();
    const unsyncedEntries = allEntries.filter(entry => !entry.synced);
    
    await AsyncStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(unsyncedEntries));
  } catch (error) {
    console.error('Error removing synced entries:', error);
  }
}

/**
 * Clear all offline entries
 */
export async function clearOfflineEntries(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing offline entries:', error);
  }
}

/**
 * Check if there are unsynced entries
 */
export async function hasUnsyncedEntries(): Promise<boolean> {
  try {
    const allEntries = await getOfflineEntries();
    return allEntries.some(entry => !entry.synced);
  } catch (error) {
    console.error('Error checking for unsynced entries:', error);
    return false;
  }
}

/**
 * Get count of unsynced entries
 */
export async function getUnsyncedEntriesCount(): Promise<number> {
  try {
    const allEntries = await getOfflineEntries();
    return allEntries.filter(entry => !entry.synced).length;
  } catch (error) {
    console.error('Error getting unsynced entries count:', error);
    return 0;
  }
}
