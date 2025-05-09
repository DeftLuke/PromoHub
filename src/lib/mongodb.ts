// src/lib/mongodb.ts
// import { MongoClient, ServerApiVersion, ObjectId } from 'mongodb'; // Actual MongoDB imports commented out for mock

// const MONGODB_URI = process.env.MONGODB_URI;

// console.warn(
//   'MongoDB connection is currently MOCKED for core features. Using in-memory data for /admin/bonuses and /admin/settings.'
// );

// if (!MONGODB_URI && process.env.NODE_ENV !== 'test' && !(process.env.USE_MOCK_DB === 'true')) {
//   // In a real scenario, you'd throw an error or ensure URI is set.
//   // For this mock, we allow it to be undefined if USE_MOCK_DB is true.
//   // console.error('CRITICAL: MONGODB_URI is not set. App may not function correctly if real DB is expected.');
// }


// let client: MongoClient;
// let clientPromise: Promise<MongoClient>;


// MOCK IMPLEMENTATION: clientPromise resolves to null or a dummy object.
// This file's default export is not actively used by mocked action files for bonuses/settings.
const clientPromise: Promise<any> = Promise.resolve({
  connect: async () => ({
    db: (dbName?: string) => ({
      collection: (colName?: string) => ({
        // Provide mock methods that return empty/default values
        // to prevent crashes if other parts of the app try to use them.
        find: async (query?: any) => ({
          sort: (s?: any) => ({
            toArray: async () => [],
          }),
          toArray: async () => [],
        }),
        findOne: async (query?: any) => null,
        insertOne: async (doc: any) => ({ acknowledged: true, insertedId: 'mock-' + Date.now().toString(), ...doc }),
        updateOne: async (filter: any, update: any, options?: any) => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedId: null }),
        deleteOne: async (filter: any) => ({ acknowledged: true, deletedCount: 0 }),
      }),
    }),
    close: async () => {},
  }),
  db: (dbName?: string) => ({ // Also mock db on the promise itself if called before connect
      collection: (colName?: string) => ({
        find: async (query?: any) => ({
          sort: (s?: any) => ({
            toArray: async () => [],
          }),
          toArray: async () => [],
        }),
        findOne: async (query?: any) => null,
        insertOne: async (doc: any) => ({ acknowledged: true, insertedId: 'mock-' + Date.now().toString(), ...doc }),
        updateOne: async (filter: any, update: any, options?: any) => ({ acknowledged: true, matchedCount: 0, modifiedCount: 0, upsertedId: null }),
        deleteOne: async (filter: any) => ({ acknowledged: true, deletedCount: 0 }),
      }),
    }),
});


export default clientPromise;

// Helper to convert string ID to ObjectId (or mock equivalent)
// This function will also not be used by mocked actions if they manage IDs as strings.
export const toObjectId = (id: string): string => {
  // For mock, IDs are just strings. In a real ObjectId scenario, validation and conversion happen here.
  // e.g., if (!ObjectId.isValid(id)) throw new Error... return new ObjectId(id);
  return id; 
};
