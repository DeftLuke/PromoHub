'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { bonusSchema, BonusFormData } from '@/schemas/bonus';
import clientPromise, { toObjectId } from '@/lib/mongodb';
import type { Collection, ObjectId } from 'mongodb';

const DB_NAME = process.env.MONGODB_DB_NAME || 'sohoz88'; // Use a default if not set
const BONUSES_COLLECTION = 'bonuses';

async function getBonusesCollection(): Promise<Collection<Omit<BonusFormData, '_id'> & { createdAt?: Date, updatedAt?: Date }>> {
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
    return { error: 'Invalid data.', message: validatedFields.error.flatten().fieldErrors_messages.join(', ') };
  }

  try {
    const bonuses = await getBonusesCollection();
    const result = await bonuses.insertOne({
      ...validatedFields.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    revalidatePath('/admin/bonuses');
    revalidatePath('/'); // Revalidate home page where promotions might be shown
    return { success: true, message: 'Bonus created successfully.', bonusId: result.insertedId.toString() };
  } catch (e) {
    console.error('Failed to create bonus:', e);
    return { error: 'Database error.', message: 'Failed to create bonus.' };
  }
}

export async function updateBonus(id: string, data: BonusFormData): Promise<BonusActionState> {
  const validatedFields = bonusSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: validatedFields.error.flatten().fieldErrors_messages.join(', ') };
  }

  try {
    const objectId = toObjectId(id);
    const bonuses = await getBonusesCollection();
    const result = await bonuses.updateOne(
      { _id: objectId },
      { $set: { ...validatedFields.data, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return { error: 'Not found.', message: 'Bonus not found.' };
    }
    revalidatePath('/admin/bonuses');
    revalidatePath(`/admin/bonuses/edit/${id}`);
    revalidatePath('/');
    return { success: true, message: 'Bonus updated successfully.' };
  } catch (e) {
    console.error('Failed to update bonus:', e);
    if (e instanceof Error && e.message.startsWith('Invalid ObjectId')) {
      return { error: 'Invalid ID.', message: 'Invalid bonus ID format.' };
    }
    return { error: 'Database error.', message: 'Failed to update bonus.' };
  }
}

export async function deleteBonus(id: string): Promise<BonusActionState> {
  try {
    const objectId = toObjectId(id);
    const bonuses = await getBonusesCollection();
    const result = await bonuses.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return { error: 'Not found.', message: 'Bonus not found.' };
    }
    revalidatePath('/admin/bonuses');
    revalidatePath('/');
    return { success: true, message: 'Bonus deleted successfully.' };
  } catch (e) {
    console.error('Failed to delete bonus:', e);
     if (e instanceof Error && e.message.startsWith('Invalid ObjectId')) {
      return { error: 'Invalid ID.', message: 'Invalid bonus ID format.' };
    }
    return { error: 'Database error.', message: 'Failed to delete bonus.' };
  }
}

export async function getBonuses() {
  try {
    const bonusesCollection = await getBonusesCollection();
    const bonuses = await bonusesCollection.find({}).sort({ createdAt: -1 }).toArray();
    return JSON.parse(JSON.stringify(bonuses)); // Serialize _id and dates
  } catch (e) {
    console.error('Failed to fetch bonuses:', e);
    return [];
  }
}

export async function getBonusById(id: string) {
  try {
    const objectId = toObjectId(id);
    const bonusesCollection = await getBonusesCollection();
    const bonus = await bonusesCollection.findOne({ _id: objectId });
    if (!bonus) return null;
    return JSON.parse(JSON.stringify(bonus)); // Serialize _id and dates
  } catch (e) {
    console.error('Failed to fetch bonus by ID:', e);
    if (e instanceof Error && e.message.startsWith('Invalid ObjectId')) {
       return null; // Or throw a specific error if preferred
    }
    return null;
  }
}
