// src/lib/mongodb.ts
import type { MongoClient as RealMongoClient, Collection as RealCollection, ObjectId as RealObjectIdType, ServerApiVersion as RealServerApiVersion } from 'mongodb';

// Conditional type for ObjectId
type ObjectIdType = RealObjectIdType | string;

let client: RealMongoClient;
let clientPromiseInternal: Promise<RealMongoClient | any>; // Use 'any' for mock client
let ObjectIdExport: { new (id?: string | number | RealObjectIdType | Buffer): ObjectIdType; (id?: string | number | RealObjectIdType | Buffer): ObjectIdType; };
let toObjectIdExport: (id: string) => ObjectIdType;


const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
  console.warn(
    'MONGODB_URI is not set. Using MOCK MongoDB implementation. Data will not persist across server restarts.'
  );

  const mockCollectionOperations = {
    find: function(query?: any) {
      // console.log('MOCK DB: find() called with query:', query);
      const cursorObject = {
        _query: query,
        _sortOptions: null as any,
        _limit: null as number | null,
        _skip: null as number | null,
        _dataStore: [] as any[], // Simplified in-memory store for this mock

        sort: function(sortOptions?: any) {
          // console.log('MOCK DB: sort() called with options:', sortOptions, 'on query:', this._query);
          this._sortOptions = sortOptions;
          // Simulate sorting if a basic in-memory store were more complex
          return this; 
        },
        limit: function(limitValue?: number) {
          // console.log('MOCK DB: limit() called with value:', limitValue);
          this._limit = limitValue as number;
          return this;
        },
        skip: function(skipValue?: number) {
          // console.log('MOCK DB: skip() called with value:', skipValue);
          this._skip = skipValue as number;
          return this;
        },
        toArray: async function(): Promise<any[]> {
          // console.log(`MOCK DB: toArray() called. Query: ${JSON.stringify(this._query)}, Sort: ${JSON.stringify(this._sortOptions)}, Limit: ${this._limit}, Skip: ${this._skip}`);
          
          // Simulate very basic data fetching for known mock items
          if (this._query && query._id === 'global_settings') { // typically findOne is used for this
            // return [{ _id: 'global_settings', backgroundType: 'color', backgroundValue: '#E0F2FE', updatedAt: new Date() }];
          }
          // For bonuses, just return empty array as per previous mock behavior to avoid breaking tests/pages expecting empty.
          // A more complex mock would filter/sort an in-memory array here.
          return Promise.resolve([]); 
        }
      };
      return cursorObject;
    },
    findOne: async (query?: any) => {
      // console.log('MOCK DB: findOne() called. Query:', query);
      if (query && query._id === 'global_settings') {
        return { _id: 'global_settings', backgroundType: 'color', backgroundValue: '#E0F2FE', updatedAt: new Date() };
      }
      // Simulate finding a bonus by mock ID (string)
      if (query && typeof query._id === 'string' && query._id.startsWith('mockid-')) {
        // Return a sample bonus structure. In a real mock, you'd search an in-memory array.
        // return { _id: query._id, title: "Mock Bonus", description: "Mock Desc", turnoverRequirement: "1x", imageUrl: "https://picsum.photos/200", ctaLink: "#", isActive: true, createdAt: new Date(), updatedAt: new Date() };
      }
      return null;
    },
    insertOne: async (doc: any) => {
      const newId = doc._id || `mockid-${Date.now()}-${Math.random().toString(36).substring(2,7)}`;
      // console.log('MOCK DB: insertOne() called. Doc:', doc, 'Generated ID:', newId);
      // In a real mock, you'd add 'doc' to an in-memory array.
      return { acknowledged: true, insertedId: String(newId) };
    },
    updateOne: async (filter: any, update: any, options?: any) => {
      // console.log('MOCK DB: updateOne() called. Filter:', filter, 'Update:', update, 'Options:', options);
      // In a real mock, you'd find and update an item in an in-memory array.
      if (options && options.upsert && filter._id === 'global_settings') {
        return { acknowledged: true, matchedCount: 0, modifiedCount: 1, upsertedCount: 1, upsertedId: filter._id as string };
      }
      return { acknowledged: true, matchedCount: 1, modifiedCount: 1, upsertedCount: 0, upsertedId: null };
    },
    deleteOne: async (filter: any) => {
      // console.log('MOCK DB: deleteOne() called. Filter:', filter);
      // In a real mock, you'd remove an item from an in-memory array.
      return { acknowledged: true, deletedCount: 1 };
    },
  };

  clientPromiseInternal = Promise.resolve({
    db: (dbName?: string) => ({
      collection: (colName?: string) => mockCollectionOperations as any, // Cast to 'any' to satisfy Collection type for mock
    }),
    connect: async () => clientPromiseInternal, // Mock connect returns itself
    close: async () => {}, // Mock close
  } as any); // Cast to 'any' to satisfy MongoClient type for mock

  ObjectIdExport = function ObjectId(id?: string | number | Buffer | RealObjectIdType) {
    if (id instanceof Buffer) return `mockid-buffer-${id.toString('hex')}`;
    return String(id || `mockid-obj-${Date.now()}-${Math.random().toString(36).substring(2,7)}`);
  } as any;
  toObjectIdExport = (id: string): string => id; // In mock, IDs are just strings

} else {
  // REAL MongoDB implementation
  if (!DB_NAME) {
    throw new Error('MONGODB_URI is set, but MONGODB_DB_NAME is not. Both are required for real MongoDB connection.');
  }
  // These imports are only used if MONGODB_URI is set.
  const { MongoClient: ActualMongoClient, ServerApiVersion: ActualServerApiVersion, ObjectId: ActualObjectId } = require('mongodb');

  client = new ActualMongoClient(MONGODB_URI, {
    serverApi: {
      version: ActualServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    } as any, // Cast to any if ServerApiVersion type from require differs slightly
  });
  clientPromiseInternal = client.connect();
  ObjectIdExport = ActualObjectId;
  toObjectIdExport = (id: string): RealObjectIdType => new ActualObjectId(id);
}

export default clientPromiseInternal;
// Export ObjectId and toObjectId based on the mode (mock or real)
export { ObjectIdExport as ObjectId, toObjectIdExport as toObjectId };
export type { Collection }; // Export real Collection type for usage in actions
