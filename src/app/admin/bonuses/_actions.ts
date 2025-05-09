'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { bonusSchema, BonusFormData, Bonus } from '@/schemas/bonus';
import clientPromise, { toObjectId, DB_NAME, ObjectId } from '@/lib/mongodb';
import type { Collection, ObjectId as RealObjectIdType } from 'mongodb';

const BONUSES_COLLECTION = process.env.BONUSES_COLLECTION_NAME || 'bonuses';

async function getBonusesCollection(): Promise<Collection<Omit<Bonus, '_id' | 'createdAt' | 'updatedAt'> & { _id: RealObjectIdType | string; createdAt: Date; updatedAt: Date }>> {
  if (!DB_NAME) {
    throw new Error('MongoDB DB_NAME is not configured.');
  }
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(BONUSES_COLLECTION);
}

export type BonusActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  bonusId?: string; 
};

export async function createBonus(data: BonusFormData): Promise<BonusActionState> {
  const validatedFields = bonusSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: JSON.stringify(validatedFields.error.flatten().fieldErrors) };
  }

  try {
    const collection = await getBonusesCollection();
    const newBonusDocument = {
      ...validatedFields.data,
      // The imported ObjectId handles mock (string) vs real (ObjectId instance)
      _id: new ObjectId(), 
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // The 'as any' here is because the mock collection's _id might be string while real is ObjectId.
    // The document structure itself matches Bonus (omitting the _id type part handled by new ObjectId()).
    const result = await collection.insertOne(newBonusDocument as any); 

    revalidatePath('/admin/bonuses');
    revalidatePath('/'); 
    revalidatePath('/promotions');

    let bonusIdString: string;
    const insertedIdValue = result.insertedId;

    if (typeof insertedIdValue === 'string') {
        // Mock path: insertedIdValue is already a string
        bonusIdString = insertedIdValue;
    } else if (insertedIdValue && typeof (insertedIdValue as RealObjectIdType).toHexString === 'function') {
        // Real MongoDB path: insertedIdValue is an ObjectId instance
        bonusIdString = (insertedIdValue as RealObjectIdType).toHexString();
    } else {
        console.error("Unexpected insertedId type from MongoDB:", insertedIdValue);
        throw new Error("Failed to correctly process bonus ID after creation.");
    }

    return { success: true, message: 'Bonus created successfully.', bonusId: bonusIdString };
  } catch (e) {
    console.error('Failed to create bonus:', e);
    let errorMessage = 'Failed to create bonus due to a server issue.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    return { error: 'Database error.', message: errorMessage };
  }
}

export async function updateBonus(id: string, data: BonusFormData): Promise<BonusActionState> {
  let loggedImageUrl = 'Invalid imageUrl type';
  if (typeof data.imageUrl === 'string') {
    loggedImageUrl = data.imageUrl.startsWith('data:image/') ? `Data URI (length: ${data.imageUrl.length})` : data.imageUrl;
  }
  console.log('updateBonus action called with id:', id);
  console.log('updateBonus action called with data (imageUrl potentially summarized):', {
    ...data,
    imageUrl: loggedImageUrl,
  });

  const validatedFields = bonusSchema.safeParse(data);
  if (!validatedFields.success) {
    console.error('Validation failed for updateBonus:', validatedFields.error.flatten().fieldErrors);
    return { error: 'Invalid data.', message: JSON.stringify(validatedFields.error.flatten().fieldErrors) };
  }

  try {
    const collection = await getBonusesCollection();
    const bonusObjectId = toObjectId(id); // Handles conversion to ObjectId for real DB, string for mock

    if (!bonusObjectId) {
      console.error(`Invalid bonus ID format for update: ${id}`);
      return { error: 'Invalid ID format.', message: 'Bonus ID is not a valid ObjectId format.' };
    }
    
    const updateData: Partial<BonusFormData> & { updatedAt: Date } = {
      ...validatedFields.data,
      updatedAt: new Date(),
    };

    // Remove _id and createdAt from $set if they accidentally got in from validatedFields.data
    // (though bonusSchema doesn't include them, so this is defensive)
    const {_id, createdAt, ...setValues} = updateData as any;


    const result = await collection.updateOne(
      { _id: bonusObjectId }, // Use the converted ObjectId or string ID
      { $set: setValues }
    );

    if (result.matchedCount === 0) {
      console.warn(`No bonus found with ID ${id} to update.`);
      return { error: 'Not found.', message: 'Bonus not found. It may have been deleted.' };
    }

    revalidatePath('/admin/bonuses');
    revalidatePath(`/admin/bonuses/edit/${id}`);
    revalidatePath('/');
    revalidatePath('/promotions');

    console.log(`Bonus with ID ${id} updated successfully. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    return { success: true, message: 'Bonus updated successfully.' };

  } catch (e) {
    console.error('Failed to update bonus in _actions.ts catch block:', e);
    let errorMessage = 'Failed to update bonus due to a server issue.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else {
      try {
        errorMessage = `Non-Error exception: ${String(e)}`;
      } catch (stringifyError) {
        errorMessage = 'Failed to update bonus and could not stringify the error object.';
      }
    }
    return { error: 'Database error.', message: errorMessage };
  }
}

export async function deleteBonus(id: string): Promise<BonusActionState> {
  try {
    const collection = await getBonusesCollection();
    const bonusObjectId = toObjectId(id);

    if (!bonusObjectId) {
      return { error: 'Invalid ID format.', message: 'Bonus ID is not a valid ObjectId format.' };
    }

    const result = await collection.deleteOne({ _id: bonusObjectId });

    if (result.deletedCount === 0) {
      return { error: 'Not found.', message: 'Bonus not found or already deleted.' };
    }

    revalidatePath('/admin/bonuses');
    revalidatePath('/');
    revalidatePath('/promotions');
    return { success: true, message: 'Bonus deleted successfully.' };
  } catch (e) {
    console.error('Failed to delete bonus:', e);
    let errorMessage = 'Failed to delete bonus due to a server issue.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    return { error: 'Database error.', message: errorMessage };
  }
}

export async function getBonuses(): Promise<Bonus[]> {
  try {
    const collection = await getBonusesCollection();
    const bonusesFromDB = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    return bonusesFromDB.map(bonus => ({
      ...bonus,
      // Ensure _id is always a string for the Bonus type, whether from mock (string) or real (ObjectId)
      _id: typeof bonus._id === 'string' ? bonus._id : bonus._id.toHexString(),
      createdAt: new Date(bonus.createdAt), 
      updatedAt: new Date(bonus.updatedAt), 
    })) as unknown as Bonus[]; // Cast needed because Bonus _id is string, DB _id is ObjectId | string
  } catch (e) {
    console.error('Failed to fetch bonuses:', e);
    return [];
  }
}

export async function getBonusById(id: string): Promise<Bonus | null> {
  try {
    const collection = await getBonusesCollection();
    const bonusObjectId = toObjectId(id);

    if (!bonusObjectId) {
      console.error(`Invalid bonus ID format for getBonusById: ${id}`);
      return null;
    }

    const bonusFromDB = await collection.findOne({ _id: bonusObjectId });

    if (!bonusFromDB) {
      return null;
    }

    return {
      ...(bonusFromDB as Omit<Bonus, '_id' | 'createdAt' | 'updatedAt'>), // Cast to base type, then add processed fields
      _id: typeof bonusFromDB._id === 'string' ? bonusFromDB._id : bonusFromDB._id.toHexString(),
      createdAt: new Date(bonusFromDB.createdAt),
      updatedAt: new Date(bonusFromDB.updatedAt),
    } as Bonus;
  } catch (e) {
    console.error('Failed to fetch bonus by ID:', e);
    return null;
  }
}
