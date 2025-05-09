// src/lib/mongodb.ts

// MOCK IMPLEMENTATION for MongoDB
// This mock is used because a real MongoDB URI was not provided or connection failed.
// It allows the admin panel's bonus and settings features to run with in-memory-like behavior.

console.warn(
  'MongoDB connection is MOCKED. Using in-memory-like data for /admin/bonuses and /admin/settings. Data will not persist across server restarts.'
);

const mockCollectionOperations = {
  find: (query?: any) => {
    // find() returns a cursor-like object synchronously
    const cursor = {
      sort: (sortOptions?: any) => {
        // sort() also returns a cursor-like object synchronously
        // console.log('MOCK DB: find().sort() called. Query:', query, 'Sort:', sortOptions);
        return {
          toArray: async () => {
            // console.log('MOCK DB: find().sort().toArray() called. Query:', query, 'Sort:', sortOptions);
            // Simulate returning an empty array for bonuses as a default.
            // For a more functional mock, this could interact with an in-memory array.
            return [];
          },
          // Other cursor methods like limit, skip can be chained here if needed
          limit: (num: number) => { return { toArray: async () => [] }; /* Simplified */ },
          skip: (num: number) => { return { toArray: async () => [] }; /* Simplified */ },
        };
      },
      toArray: async () => {
        // console.log('MOCK DB: find().toArray() (without sort) called. Query:', query);
        return []; // Simulate empty array
      },
      limit: (num: number) => {
        // console.log('MOCK DB: find().limit() called. Query:', query, 'Limit:', num);
        return { // returns a new cursor-like object
            sort: (sortOptions?: any) => ({ toArray: async () => [] }),
            toArray: async () => []
        };
      },
      skip: (num: number) => {
        // console.log('MOCK DB: find().skip() called. Query:', query, 'Skip:', num);
         return { // returns a new cursor-like object
            sort: (sortOptions?: any) => ({ toArray: async () => [] }),
            toArray: async () => []
        };
      }
    };
    return cursor;
  },
  findOne: async (query?: any) => {
    // console.log('MOCK DB: findOne() called. Query:', query);
    if (query && query._id === 'global_settings') {
      // Default settings for the site background
      return { _id: 'global_settings', backgroundType: 'color', backgroundValue: '#E0F2FE', updatedAt: new Date() };
    }
    // Default for bonus by ID
    return null;
  },
  insertOne: async (doc: any) => {
    const newId = doc._id || `mockid-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    // console.log('MOCK DB: insertOne() called. Doc:', doc, 'Generated ID:', newId);
    return { acknowledged: true, insertedId: newId };
  },
  updateOne: async (filter: any, update: any, options?: any) => {
    // console.log('MOCK DB: updateOne() called. Filter:', filter, 'Update:', update, 'Options:', options);
    if (options && options.upsert && filter._id === 'global_settings') {
      return { acknowledged: true, matchedCount: 0, modifiedCount: 1, upsertedId: filter._id };
    }
    // Assume a match for other updates
    return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedId: null };
  },
  deleteOne: async (filter: any) => {
    // console.log('MOCK DB: deleteOne() called. Filter:', filter);
    return { acknowledged: true, deletedCount: 1 }; // Assume deletion is successful
  },
};

const clientPromise: Promise<any> = Promise.resolve({
  // This outer object is what `await clientPromise` resolves to.
  connect: async () => {
    // console.log('MOCK DB: connect() called');
    // The connect method resolves to an object that has a `db` method.
    return {
      db: (dbName?: string) => {
        // console.log(`MOCK DB: db('${dbName}') called after connect`);
        return {
          collection: (colName?: string) => {
            // console.log(`MOCK DB: collection('${colName}') called after connect.db`);
            return mockCollectionOperations;
          },
        };
      },
      close: async () => {
        // console.log('MOCK DB: close() called after connect');
      },
    };
  },
  // This `db` method is available directly on the resolved `clientPromise` value.
  // This is the path typically taken by `getBonusesCollection` etc.
  db: (dbName?: string) => {
    // console.log(`MOCK DB: db('${dbName}') called directly`);
    return {
      collection: (colName?: string) => {
        // console.log(`MOCK DB: collection('${colName}') called directly on db`);
        return mockCollectionOperations;
      },
    };
  },
});

export default clientPromise;

// Helper to convert string ID to ObjectId (or mock equivalent)
export const toObjectId = (id: string): string => {
  // In a real MongoDB setup, this would involve `new ObjectId(id)` and validation.
  // For the mock, IDs are just strings, so we return the ID as is.
  return id;
};
