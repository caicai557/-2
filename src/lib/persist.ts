import type { StateStorage } from 'zustand/middleware';

export type MigrationTable<T> = Record<number, (state: T) => T>;

function getLocalStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch (error) {
    console.warn('localStorage unavailable', error);
    return null;
  }
}

export function createStateStorage(): StateStorage {
  const fallback = new Map<string, string>();

  return {
    getItem: (name) => {
      const storage = getLocalStorage();
      if (storage) {
        return storage.getItem(name);
      }
      return fallback.get(name) ?? null;
    },
    setItem: (name, value) => {
      const storage = getLocalStorage();
      if (storage) {
        storage.setItem(name, value);
      } else {
        fallback.set(name, value);
      }
    },
    removeItem: (name) => {
      const storage = getLocalStorage();
      if (storage) {
        storage.removeItem(name);
      }
      fallback.delete(name);
    },
  };
}

export function applyMigrations<T>(state: T, persistedVersion: number, migrations: MigrationTable<T>): T {
  let migratedState = state;
  const sorted = Object.keys(migrations)
    .map(Number)
    .sort((a, b) => a - b);

  for (const version of sorted) {
    if (persistedVersion < version) {
      migratedState = migrations[version](migratedState);
    }
  }

  return migratedState;
}
