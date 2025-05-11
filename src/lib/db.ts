import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SongDB extends DBSchema {
  songs: {
    key: number;
    value: {
      id: number;
      name: string;
      artist: string;
      lastUpdated: number;
    };
  };
  songData: {
    key: number;
    value: {
      id: number;
      data: any;
      lastUpdated: number;
    };
  };
}

let db: IDBPDatabase<SongDB> | null = null;

export async function initDB() {
  if (db) return db;
  
  db = await openDB<SongDB>('songbook-poc', 1, {
    upgrade(database) {
      database.createObjectStore('songs', { keyPath: 'id' });
      database.createObjectStore('songData', { keyPath: 'id' });
    },
  });
  
  return db;
}

export async function saveSong(song: SongDB['songs']['value']) {
  const database = await initDB();
  await database.put('songs', song);
}

export async function saveSongData(id: number, data: any) {
  const database = await initDB();
  await database.put('songData', {
    id,
    data,
    lastUpdated: Date.now()
  });
}

export async function getSong(id: number) {
  const database = await initDB();
  return database.get('songs', id);
}

export async function getSongData(id: number) {
  const database = await initDB();
  return database.get('songData', id);
}

export async function getAllSongs() {
  const database = await initDB();
  return database.getAll('songs');
}

export async function deleteAllData() {
  const database = await initDB();
  await database.clear('songs');
  await database.clear('songData');
} 