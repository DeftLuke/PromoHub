'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { bonusSchema, BonusFormData, Bonus } from '@/schemas/bonus';
// Removed MongoDB specific imports:
// import clientPromise, { toObjectId } from '@/lib/mongodb';
// import type { Collection, ObjectId } from 'mongodb';

// const DB_NAME = process.env.MONGODB_DB_NAME || 'sohoz88';
// const BONUSES_COLLECTION = 'bonuses';

// In-memory store for bonuses
let mockBonusesStore: Bonus[] = [
  {
    _id: '1',
    title: 'স্বাগতম বোনাস - প্রথম ডিপোজিটে ১০০% পর্যন্ত!',
    description: 'নতুন খেলোয়াড়দের জন্য দারুণ সুযোগ! আপনার প্রথম ডিপোজিটে পান ১০০% বোনাস, সর্বোচ্চ ১০,০০০ টাকা পর্যন্ত। আজই রেজিস্টার করুন!',
    turnoverRequirement: '20x',
    imageUrl: 'https://picsum.photos/seed/promo1/400/250',
    ctaLink: '/register',
    isActive: true,
    createdAt: new Date('2023-01-01T10:00:00Z'),
    updatedAt: new Date('2023-01-01T10:00:00Z'),
  },
  {
    _id: '2',
    title: 'সাপ্তাহিক ক্যাশব্যাক অফার',
    description: 'প্রতি সপ্তাহে আপনার লসের উপর পান ১০% পর্যন্ত ক্যাশব্যাক। খেলা চালিয়ে যান, সোহজ৮৮ আছে আপনার পাশে!',
    turnoverRequirement: '5x',
    imageUrl: 'https://picsum.photos/seed/promo2/400/250',
    ctaLink: '/promotions/cashback',
    isActive: true,
    createdAt: new Date('2023-01-05T12:00:00Z'),
    updatedAt: new Date('2023-01-05T12:00:00Z'),
  },
    {
    _id: '3',
    title: 'বিশেষ টুর্নামেন্ট বোনাস',
    description: 'আমাদের বিশেষ স্লট এবং টেবিল গেম টুর্নামেন্টে অংশগ্রহণ করে জিতে নিন আকর্ষণীয় পুরস্কার ও বোনাস।',
    turnoverRequirement: 'None',
    imageUrl: 'https://picsum.photos/seed/promo3/400/250',
    ctaLink: '/tournaments',
    isActive: false,
    createdAt: new Date('2023-01-10T15:00:00Z'),
    updatedAt: new Date('2023-01-10T15:00:00Z'),
  },
];
let nextId = mockBonusesStore.length + 1;

const generateId = () => (nextId++).toString();

// async function getBonusesCollection(): Promise<Collection<Omit<BonusFormData, '_id'> & { createdAt?: Date, updatedAt?: Date }>> {
//   const client = await clientPromise;
//   const db = client.db(DB_NAME);
//   return db.collection(BONUSES_COLLECTION);
// }

export type BonusActionState = {
  error?: string;
  success?: boolean;
  message?: string;
  bonusId?: string;
};

export async function createBonus(data: BonusFormData): Promise<BonusActionState> {
  const validatedFields = bonusSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: validatedFields.error.flatten().fieldErrors._messages.join(', ') };
  }

  try {
    const newBonus: Bonus = {
      ...validatedFields.data,
      _id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockBonusesStore.push(newBonus);
    revalidatePath('/admin/bonuses');
    revalidatePath('/'); 
    return { success: true, message: 'Bonus created successfully (mock).', bonusId: newBonus._id };
  } catch (e) {
    console.error('Failed to create bonus (mock):', e);
    return { error: 'Mock error.', message: 'Failed to create bonus (mock).' };
  }
}

export async function updateBonus(id: string, data: BonusFormData): Promise<BonusActionState> {
  const validatedFields = bonusSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: validatedFields.error.flatten().fieldErrors._messages.join(', ') };
  }

  try {
    const bonusIndex = mockBonusesStore.findIndex(b => b._id === id);
    if (bonusIndex === -1) {
      return { error: 'Not found.', message: 'Bonus not found (mock).' };
    }
    mockBonusesStore[bonusIndex] = {
      ...mockBonusesStore[bonusIndex],
      ...validatedFields.data,
      updatedAt: new Date(),
    };
    revalidatePath('/admin/bonuses');
    revalidatePath(`/admin/bonuses/edit/${id}`);
    revalidatePath('/');
    return { success: true, message: 'Bonus updated successfully (mock).' };
  } catch (e) {
    console.error('Failed to update bonus (mock):', e);
    return { error: 'Mock error.', message: 'Failed to update bonus (mock).' };
  }
}

export async function deleteBonus(id: string): Promise<BonusActionState> {
  try {
    const initialLength = mockBonusesStore.length;
    mockBonusesStore = mockBonusesStore.filter(b => b._id !== id);
    if (mockBonusesStore.length === initialLength) {
      return { error: 'Not found.', message: 'Bonus not found (mock).' };
    }
    revalidatePath('/admin/bonuses');
    revalidatePath('/');
    return { success: true, message: 'Bonus deleted successfully (mock).' };
  } catch (e) {
    console.error('Failed to delete bonus (mock):', e);
    return { error: 'Mock error.', message: 'Failed to delete bonus (mock).' };
  }
}

export async function getBonuses(): Promise<Bonus[]> {
  try {
    // Return a deep copy to prevent direct modification of the store
    return JSON.parse(JSON.stringify(mockBonusesStore.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())));
  } catch (e) {
    console.error('Failed to fetch bonuses (mock):', e);
    return [];
  }
}

export async function getBonusById(id: string): Promise<Bonus | null> {
  try {
    const bonus = mockBonusesStore.find(b => b._id === id);
    if (!bonus) return null;
    // Return a deep copy
    return JSON.parse(JSON.stringify(bonus));
  } catch (e) {
    console.error('Failed to fetch bonus by ID (mock):', e);
    return null;
  }
}
