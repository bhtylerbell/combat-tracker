import { openDB, DBSchema } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { Combatant } from '@/types/combatant';

interface CombatTrackerDB extends DBSchema {
  sessions: {
    key: string;
    value: {
      id: string;
      createdAt: number;
      lastAccessed: number;
    };
  };
  combatData: {
    key: string;
    value: {
      sessionId: string;
      timestamp: number;
      data: {
        combatants: Combatant[];
        turnIndex: number;
        round: number;
        timer: number;
      };
    };
    indexes: { 'by-session': string };
  };
}

const DB_NAME = 'combat-tracker';
const DB_VERSION = 1;

export async function initDB() {
  return openDB<CombatTrackerDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores if they don't exist
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions');
      }
      
      if (!db.objectStoreNames.contains('combatData')) {
        const store = db.createObjectStore('combatData');
        store.createIndex('by-session', 'sessionId');
      }
    },
  });
}

export async function initSession() {
  let sessionId = localStorage.getItem('combat_session_id');
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem('combat_session_id', sessionId);
  }

  const db = await initDB();
  await db.put('sessions', {
    id: sessionId,
    createdAt: Date.now(),
    lastAccessed: Date.now()
  }, sessionId);

  return sessionId;
}

export async function cleanupOldSessions(maxAge = 7 * 24 * 60 * 60 * 1000) { // 7 days
  const db = await initDB();
  const oldSessions = await db.getAllKeys('sessions');
  
  for (const sessionId of oldSessions) {
    const session = await db.get('sessions', sessionId);
    if (session && Date.now() - session.lastAccessed > maxAge) {
      await db.delete('sessions', sessionId);
      await db.delete('combatData', sessionId);
    }
  }
}

export async function checkStorageQuota(): Promise<boolean> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate();
    const percentageUsed = (estimate.usage! / estimate.quota!) * 100;
    if (percentageUsed > 90) {
      console.warn('Storage quota nearly full');
      return false;
    }
  }
  return true;
}
