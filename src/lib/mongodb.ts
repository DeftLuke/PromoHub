
// src/lib/mongodb.ts
import type { MongoClient as RealMongoClient, Collection as RealCollectionType, ObjectId as RealObjectIdType, ServerApiVersion as RealServerApiVersion, FindCursor, AggregationCursor, InsertOneResult, UpdateResult, DeleteResult, Document } from 'mongodb';

// Conditional type for ObjectId
type ObjectIdType = RealObjectIdType | string;

// --- Globals that will be initialized ---
let clientPromiseInternal: Promise<RealMongoClient | MockMongoClient>;
// These will be assigned dynamically based on whether mock or real DB is used.
let ObjectIdExport: { new (id?: string | number | RealObjectIdType | Buffer): ObjectIdType; (id?: string | number | RealObjectIdType | Buffer): ObjectIdType; };
let toObjectIdExport: (id: string) => ObjectIdType;


// --- Environment Variables ---
const MONGODB_URI_FROM_ENV = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

// --- Mock Implementation Details ---
interface MockCursor {
  sort(sortOptions?: any): MockCursor;
  limit(limitValue?: number): MockCursor;
  skip(skipValue?: number): MockCursor;
  toArray(): Promise<any[]>;
}
interface MockAggregationCursor extends MockCursor {}

interface MockCollection {
  find(query?: any): MockCursor;
  findOne(query?: any): Promise<any | null>;
  insertOne(doc: any): Promise<InsertOneResult<any>>;
  updateOne(filter: any, update: any, options?: any): Promise<UpdateResult>;
  deleteOne(filter: any): Promise<DeleteResult>;
  aggregate?(pipeline?: any[]): MockAggregationCursor;
  countDocuments?(query?: any): Promise<number>;
}

interface MockDb {
  collection(name: string): MockCollection;
}

interface MockMongoClient {
  db(dbName?: string): MockDb;
  connect(): Promise<MockMongoClient>;
  close(): Promise<void>;
}

const mockDataStore: { [collectionName: string]: any[] } = {
  bonuses: [],
  siteSettings: [
    { _id: 'global_settings', backgroundType: 'color', backgroundValue: '#E0F2FE', updatedAt: new Date() }
  ],
};

const mockCursorOperations = (initialData: any[]): MockCursor => {
    let currentData = [...initialData]; // Operate on a copy

    const cursor: MockCursor = {
        sort: (sortOptions?: any) => {
            if (sortOptions && currentData.length > 0) {
                const sortKey = Object.keys(sortOptions)[0];
                const sortDir = sortOptions[sortKey];
                currentData.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) return sortDir === 1 ? -1 : 1;
                    if (a[sortKey] > b[sortKey]) return sortDir === 1 ? 1 : -1;
                    return 0;
                });
            }
            return cursor;
        },
        limit: (limitValue?: number) => {
            if (typeof limitValue === 'number' && limitValue >= 0) {
                currentData = currentData.slice(0, limitValue);
            }
            return cursor;
        },
        skip: (skipValue?: number) => {
            if (typeof skipValue === 'number' && skipValue > 0) {
                currentData = currentData.slice(skipValue);
            }
            return cursor;
        },
        toArray: async () => Promise.resolve(currentData.map(doc => ({...doc}))), // Return copies
    };
    return cursor;
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
        results = store.filter(doc => 
          Object.keys(query).every(key => {
            if (key === '_id') return String(doc._id) === String(query._id);
            return doc[key] === query[key];
          })
        );
      }
      return mockCursorOperations(results);
    },
    findOne: async (query?: any) => {
      const found = store.find(doc => 
        Object.keys(query).every(key => {
           if (key === '_id') return String(doc._id) === String(query._id);
           return doc[key] === query[key];
        })
      );
      return Promise.resolve(found ? {...found} : null);
    },
    insertOne: async (doc: any) => {
      const newDoc = { ...doc };
      if (!newDoc._id) newDoc._id = `mockid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      if (!newDoc.createdAt) newDoc.createdAt = new Date();
      if (!newDoc.updatedAt) newDoc.updatedAt = new Date();
      store.push(newDoc);
      return Promise.resolve({ acknowledged: true, insertedId: newDoc._id as any });
    },
    updateOne: async (filter: any, update: any, options?: any) => {
      const index = store.findIndex(doc => 
        Object.keys(filter).every(key => {
           if (key === '_id') return String(doc._id) === String(filter._id);
           return doc[key] === filter[key];
        })
      );
      let matchedCount = 0, modifiedCount = 0, upsertedId: any = null;
      if (index !== -1) {
        matchedCount = 1;
        const oldDoc = {...store[index]};
        if (update.$set) store[index] = { ...store[index], ...update.$set, updatedAt: new Date() };
        if (JSON.stringify(oldDoc) !== JSON.stringify({ ...store[index], updatedAt: oldDoc.updatedAt})) modifiedCount = 1;
      } else if (options?.upsert) {
        const newDocData = { ...(update.$set || {}), ...filter };
        if (!newDocData._id) newDocData._id = filter._id || `mockid-upsert-${Date.now()}`;
        if (!newDocData.createdAt) newDocData.createdAt = new Date();
        newDocData.updatedAt = new Date();
        store.push(newDocData);
        upsertedId = newDocData._id;
        modifiedCount = 1; // MongoDB considers an upsert as a modification if it results in an insert
      }
      return Promise.resolve({ acknowledged: true, matchedCount, modifiedCount, upsertedCount: upsertedId ? 1 : 0, upsertedId } as UpdateResult);
    },
    deleteOne: async (filter: any) => {
      const initialLength = store.length;
      mockDataStore[collectionName] = store.filter(doc => 
        !Object.keys(filter).every(key => {
          if (key === '_id') return String(doc._id) === String(filter._id);
          return doc[key] === filter[key];
        })
      );
      return Promise.resolve({ acknowledged: true, deletedCount: initialLength - mockDataStore[collectionName].length } as DeleteResult);
    },
    aggregate: (pipeline?: any[]) => {
        let results = [...store];
        if (pipeline && pipeline.length > 0 && pipeline[0].$match) {
            const matchQuery = pipeline[0].$match;
            results = results.filter(doc => 
                Object.keys(matchQuery).every(key => {
                    if (key === '_id') return String(doc._id) === String(matchQuery._id);
                    return doc[key] === matchQuery[key];
                })
            );
        }
        // Add more pipeline stage mocks if needed (e.g., $group, $sort within aggregate)
        return mockCursorOperations(results) as MockAggregationCursor;
    },
    countDocuments: async (query?: any): Promise<number> => {
        if (!query || Object.keys(query).length === 0) return store.length;
        const results = store.filter(doc => 
            Object.keys(query).every(key => doc[key] === query[key])
        );
        return results.length;
    }
  };
}

const initializeMockDbAndGlobals = (): Promise<MockMongoClient> => {
  console.warn('Using MOCK MongoDB implementation. Data will not persist across server restarts.');
  const mockMongoClientInstance: MockMongoClient = {
    db: (dbName?: string): MockDb => ({
      collection: (name: string): MockCollection => createMockCollection(name),
    }),
    connect: async () => mockMongoClientInstance,
    close: async () => {},
  };
  
  ObjectIdExport = function MockObjectIdFunc(id?: string | number | Buffer | RealObjectIdType): string {
    if (typeof id === 'object' && id && 'toHexString' in id && typeof id.toHexString === 'function') {
      return id.toHexString();
    }
    return String(id || `mockid-obj-${Date.now()}-${Math.random().toString(36).substring(2,9)}`);
  } as any;
  toObjectIdExport = (id: string): string => id;
  return Promise.resolve(mockMongoClientInstance);
};

// --- Logic to determine using mock or real ---
const SHOULD_USE_MOCK_DB_INITIALLY = !MONGODB_URI_FROM_ENV || MONGODB_URI_FROM_ENV === "YOUR_MONGODB_URI_HERE" || MONGODB_URI_FROM_ENV.trim() === "";

if (SHOULD_USE_MOCK_DB_INITIALLY) {
  clientPromiseInternal = initializeMockDbAndGlobals();
} else {
  try {
    const { MongoClient: ActualMongoClient, ServerApiVersion: ActualServerApiVersion, ObjectId: ActualObjectId } = require('mongodb');

    if (!DB_NAME) {
      throw new Error('MONGODB_URI is set, but MONGODB_DB_NAME is not. Both are required for real MongoDB connection. Please check your .env.local file.');
    }
    if (!(MONGODB_URI_FROM_ENV.startsWith("mongodb://") || MONGODB_URI_FROM_ENV.startsWith("mongodb+srv://"))) {
      throw new Error('Invalid MONGODB_URI scheme. Must start with "mongodb://" or "mongodb+srv://". Please check your .env.local file.');
    }
    if (MONGODB_URI_FROM_ENV === "mongodb://" || MONGODB_URI_FROM_ENV === "mongodb+srv://") {
       throw new Error('Invalid MONGODB_URI. URI cannot be just the scheme (e.g., "mongodb://"). Please specify hosts (e.g., "mongodb://localhost:27017"). Check your .env.local file.');
    }

    const client = new ActualMongoClient(MONGODB_URI_FROM_ENV, {
      serverApi: {
        version: ActualServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      } as any,
      serverSelectionTimeoutMS: 5000, // Fail fast if server is not reachable
      connectTimeoutMS: 5000,
    });
    
    clientPromiseInternal = client.connect()
      .then(connectedClient => {
        console.log("Successfully connected to Real MongoDB.");
        ObjectIdExport = ActualObjectId as any; // Assign real ObjectId
        toObjectIdExport = (id: string): RealObjectIdType => new ActualObjectId(id); // Use real ObjectId conversion
        return connectedClient as RealMongoClient;
      })
      .catch(err => {
        const uriToLog = MONGODB_URI_FROM_ENV.substring(0, MONGODB_URI_FROM_ENV.indexOf('@') > 0 ? MONGODB_URI_FROM_ENV.indexOf('@') : MONGODB_URI_FROM_ENV.length);
        console.warn(`Real MongoDB connection failed (URI: ${uriToLog}, Error: ${err.message}). Falling back to MOCK MongoDB implementation.`);
        return initializeMockDbAndGlobals(); // Fallback sets mock globals and returns Promise<MockMongoClient>
      });

  } catch (e: any) {
    console.error(`Critical error during Real MongoDB setup: ${e.message}. Falling back to MOCK MongoDB implementation.`);
    clientPromiseInternal = initializeMockDbAndGlobals();
  }
}

export default clientPromiseInternal;
export { ObjectIdExport as ObjectId, toObjectIdExport as toObjectId };

export type Collection<T extends Document = Document> = RealCollectionType<T>;
export type { FindCursor as AppFindCursor, AggregationCursor as AppAggregationCursor };
