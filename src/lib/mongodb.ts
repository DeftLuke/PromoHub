
// src/lib/mongodb.ts
import type { MongoClient as RealMongoClient, Collection as RealCollectionType, ObjectId as RealObjectIdType, ServerApiVersion as RealServerApiVersion, FindCursor, AggregationCursor, InsertOneResult, UpdateResult, DeleteResult } from 'mongodb';

// Conditional type for ObjectId
type ObjectIdType = RealObjectIdType | string;

let client: RealMongoClient;
let clientPromiseInternal: Promise<RealMongoClient | MockMongoClient>;
// @ts-ignore MongoDB types might not be available in mock mode
let ObjectIdExport: typeof RealObjectIdType | { new (id?: string | number | RealObjectIdType | Buffer): string; (id?: string | number | RealObjectIdType | Buffer): string; };
let toObjectIdExport: (id: string) => RealObjectIdType | string;


const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

// --- Mock Implementation ---
interface MockCollection {
  find(query?: any): MockCursor;
  findOne(query?: any): Promise<any | null>;
  insertOne(doc: any): Promise<InsertOneResult<any>>;
  updateOne(filter: any, update: any, options?: any): Promise<UpdateResult>;
  deleteOne(filter: any): Promise<DeleteResult>;
  // Add other methods as needed by your application, e.g., aggregate, countDocuments
  aggregate?(pipeline?: any[]): MockAggregationCursor;
  countDocuments?(query?: any): Promise<number>;
}

interface MockCursor {
  sort(sortOptions?: any): MockCursor;
  limit(limitValue?: number): MockCursor;
  skip(skipValue?: number): MockCursor;
  toArray(): Promise<any[]>;
}
interface MockAggregationCursor extends MockCursor {}


interface MockDb {
  collection(name: string): MockCollection;
}

interface MockMongoClient {
  db(dbName?: string): MockDb;
  connect(): Promise<MockMongoClient>;
  close(): Promise<void>;
}

// Simple in-memory store for the mock
const mockDataStore: { [collectionName: string]: any[] } = {
  bonuses: [
    // Add some default mock bonuses if needed for development/testing
    // { _id: 'mockid-1', title: "Mock Welcome Bonus", description: "100% up to 1000TK", turnoverRequirement: "10x", imageUrl: "https://picsum.photos/seed/mbonus1/400/250", ctaLink: "#", isActive: true, createdAt: new Date(), updatedAt: new Date() },
    // { _id: 'mockid-2', title: "Mock Weekly Cashback", description: "10% cashback", turnoverRequirement: "1x", imageUrl: "https://picsum.photos/seed/mbonus2/400/250", ctaLink: "#", isActive: false, createdAt: new Date(), updatedAt: new Date() }
  ],
  siteSettings: [
    { _id: 'global_settings', backgroundType: 'color', backgroundValue: '#E0F2FE', updatedAt: new Date() }
  ],
  // Add other collections as needed
};

function createMockCollection(collectionName: string): MockCollection {
  if (!mockDataStore[collectionName]) {
    mockDataStore[collectionName] = [];
  }
  const store = mockDataStore[collectionName];

  return {
    find: (query?: any) => {
      let results = [...store];
      if (query && Object.keys(query).length > 0) {
        results = store.filter(doc => {
          return Object.keys(query).every(key => {
            if (key === '_id') {
                 // ObjectId comparison in mock can be tricky. For simplicity, direct string comparison.
                 // Real ObjectId would require query[key] to be an ObjectId instance or use $eq.
                return String(doc._id) === String(query._id);
            }
            // Add more complex query logic if needed (e.g., $in, $gt, etc.)
            return doc[key] === query[key];
          });
        });
      }
      
      let currentSort: any = null;
      let currentLimit: number | null = null;
      let currentSkip: number | null = null;

      return {
        sort: (sortOptions?: any) => {
          currentSort = sortOptions;
          return this as unknown as MockCursor; // Bodge to return the wrapping object
        },
        limit: (limitValue?: number) => {
          currentLimit = limitValue;
          return this as unknown as MockCursor;
        },
        skip: (skipValue?: number) => {
          currentSkip = skipValue;
          return this as unknown as MockCursor;
        },
        toArray: async () => {
          let sortedResults = [...results];
          if (currentSort) {
            const sortKey = Object.keys(currentSort)[0];
            const sortDir = currentSort[sortKey];
            sortedResults.sort((a, b) => {
              if (a[sortKey] < b[sortKey]) return sortDir === 1 ? -1 : 1;
              if (a[sortKey] > b[sortKey]) return sortDir === 1 ? 1 : -1;
              return 0;
            });
          }
          if (currentSkip !== null) {
            sortedResults = sortedResults.slice(currentSkip);
          }
          if (currentLimit !== null) {
            sortedResults = sortedResults.slice(0, currentLimit);
          }
          return Promise.resolve(sortedResults.map(doc => ({...doc}))); // Return copies
        }
      } as MockCursor; // Cast the returned object to MockCursor
    },
    findOne: async (query?: any) => {
      const found = store.find(doc => {
        return Object.keys(query).every(key => {
           if (key === '_id') return String(doc._id) === String(query._id);
           return doc[key] === query[key];
        });
      });
      return Promise.resolve(found ? {...found} : null); // Return copy
    },
    insertOne: async (doc: any) => {
      const newDoc = { ...doc };
      if (!newDoc._id) {
        newDoc._id = `mockid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }
      if (!newDoc.createdAt) newDoc.createdAt = new Date();
      if (!newDoc.updatedAt) newDoc.updatedAt = new Date();
      
      store.push(newDoc);
      return Promise.resolve({ acknowledged: true, insertedId: newDoc._id as any });
    },
    updateOne: async (filter: any, update: any, options?: any) => {
      const index = store.findIndex(doc => {
         return Object.keys(filter).every(key => {
           if (key === '_id') return String(doc._id) === String(filter._id);
           return doc[key] === filter[key];
        });
      });

      let matchedCount = 0;
      let modifiedCount = 0;
      let upsertedId: any = null;

      if (index !== -1) {
        matchedCount = 1;
        // Apply $set operations
        if (update.$set) {
          const oldDoc = {...store[index]}; // For checking if modified
          store[index] = { ...store[index], ...update.$set, updatedAt: new Date() };
          if (JSON.stringify(oldDoc) !== JSON.stringify({ ...store[index], updatedAt: oldDoc.updatedAt})) { // crude check
             modifiedCount = 1;
          }
        }
      } else if (options?.upsert) {
        const newDoc = { ...(update.$set || {}), ...filter, _id: filter._id || `mockid-upsert-${Date.now()}`, createdAt: new Date(), updatedAt: new Date() };
        store.push(newDoc);
        upsertedId = newDoc._id;
        modifiedCount = 1; // or upsertedCount = 1, driver might differ here
      }
      return Promise.resolve({ acknowledged: true, matchedCount, modifiedCount, upsertedCount: upsertedId ? 1 : 0, upsertedId } as UpdateResult);
    },
    deleteOne: async (filter: any) => {
      const initialLength = store.length;
      mockDataStore[collectionName] = store.filter(doc => {
        return !Object.keys(filter).every(key => {
          if (key === '_id') return String(doc._id) === String(filter._id);
          return doc[key] === filter[key];
        });
      });
      const deletedCount = initialLength - mockDataStore[collectionName].length;
      return Promise.resolve({ acknowledged: true, deletedCount } as DeleteResult);
    },
  };
}


const USE_MOCK_DB = !MONGODB_URI || MONGODB_URI === "YOUR_MONGODB_URI_HERE" || MONGODB_URI.trim() === "";

if (USE_MOCK_DB) {
  console.warn(
    'MONGODB_URI is not set or is a placeholder. Using MOCK MongoDB implementation. Data will not persist across server restarts.'
  );

  const mockMongoClientInstance: MockMongoClient = {
    db: (dbName?: string): MockDb => ({ // dbName is ignored in mock
      collection: (name: string): MockCollection => createMockCollection(name),
    }),
    connect: async () => mockMongoClientInstance,
    close: async () => {},
  };

  clientPromiseInternal = Promise.resolve(mockMongoClientInstance);
  
  ObjectIdExport = function MockObjectId(id?: string | number | Buffer | RealObjectIdType) {
    // For mock, string IDs are fine. If an ObjectId-like object is passed, stringify it.
    if (typeof id === 'object' && id && 'toHexString' in id && typeof id.toHexString === 'function') {
      return id.toHexString();
    }
    return String(id || `mockid-obj-${Date.now()}-${Math.random().toString(36).substring(2,9)}`);
  } as any;
  toObjectIdExport = (id: string): string => id; // In mock, IDs are just strings

} else {
  // REAL MongoDB implementation
  const { MongoClient: ActualMongoClient, ServerApiVersion: ActualServerApiVersion, ObjectId: ActualObjectId } = require('mongodb');

  if (!(MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://"))) {
    throw new Error('Invalid MONGODB_URI scheme. Must start with "mongodb://" or "mongodb+srv://". Please check your .env.local file.');
  }
  // New check to ensure URI is not just the scheme
  if (MONGODB_URI === "mongodb://" || MONGODB_URI === "mongodb+srv://") {
    throw new Error('Invalid MONGODB_URI. URI cannot be just the scheme (e.g., "mongodb://"). Please specify hosts (e.g., "mongodb://localhost:27017"). Check your .env.local file.');
  }
  if (!DB_NAME) {
    throw new Error('MONGODB_URI is set, but MONGODB_DB_NAME is not. Both are required for real MongoDB connection. Please check your .env.local file.');
  }

  client = new ActualMongoClient(MONGODB_URI, {
    serverApi: {
      version: ActualServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    } as any,
  });
  clientPromiseInternal = client.connect();
  ObjectIdExport = ActualObjectId;
  toObjectIdExport = (id: string): RealObjectIdType => new ActualObjectId(id);
}

export default clientPromiseInternal;
export { ObjectIdExport as ObjectId, toObjectIdExport as toObjectId };

// Export real Collection type for usage in actions, but FindCursor might be from mock or real
export type Collection<T extends Document = Document> = RealCollectionType<T>;
// We use 'any' for cursor types to avoid complex conditional types based on mock/real,
// assuming the methods like toArray() will be consistent.
export type { FindCursor as AppFindCursor, AggregationCursor as AppAggregationCursor };

    