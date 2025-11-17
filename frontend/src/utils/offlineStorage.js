// Offline storage utilities using IndexedDB

const DB_NAME = 'NexaNovaDB';
const DB_VERSION = 1;

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Offline requests store
      if (!db.objectStoreNames.contains('offlineRequests')) {
        const requestStore = db.createObjectStore('offlineRequests', {
          keyPath: 'id',
          autoIncrement: true
        });
        requestStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Habits store
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id', autoIncrement: true });
      }
      
      // Finance store
      if (!db.objectStoreNames.contains('finance')) {
        db.createObjectStore('finance', { keyPath: 'id', autoIncrement: true });
      }
      
      // Chats store
      if (!db.objectStoreNames.contains('chats')) {
        db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

export const saveOffline = async (storeName, data) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.add(data);
    return true;
  } catch (error) {
    console.error(`Error saving to ${storeName}:`, error);
    return false;
  }
};

export const getAllOffline = async (storeName) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    return await store.getAll();
  } catch (error) {
    console.error(`Error reading from ${storeName}:`, error);
    return [];
  }
};

export const clearOffline = async (storeName) => {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    await store.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${storeName}:`, error);
    return false;
  }
};

