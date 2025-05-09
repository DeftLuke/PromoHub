'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { siteSettingsSchema, SiteSettingsFormData } from '@/schemas/settings';
// Removed MongoDB specific imports:
// import clientPromise from '@/lib/mongodb';
// import type { Collection } from 'mongodb';

// const DB_NAME = process.env.MONGODB_DB_NAME || 'sohoz88';
// const SETTINGS_COLLECTION = 'siteSettings';
// const SITE_SETTINGS_DOC_ID = 'global_settings'; 

// In-memory store for site settings
let mockSettingsStore: SiteSettingsFormData = {
  backgroundType: 'color',
  backgroundValue: '#E0F2FE', // Default light blue background
};

// async function getSettingsCollection(): Promise<Collection<Omit<SiteSettingsFormData, '_id'> & { _id?: string, updatedAt?: Date }>> {
//   const client = await clientPromise;
//   const db = client.db(DB_NAME);
//   return db.collection(SETTINGS_COLLECTION);
// }

export type SettingsActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function getSiteSettings(): Promise<SiteSettingsFormData | null> {
  try {
    // Return a deep copy of the mock settings
    return JSON.parse(JSON.stringify(mockSettingsStore));
  } catch (e) {
    console.error('Failed to fetch site settings (mock):', e);
    // Fallback default if store is somehow corrupted (should not happen with simple object)
    return { 
        backgroundType: 'color',
        backgroundValue: '#E0F2FE',
      };
  }
}

export async function updateSiteSettings(data: SiteSettingsFormData): Promise<SettingsActionState> {
  const validatedFields = siteSettingsSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: validatedFields.error.flatten().fieldErrors._messages.join(', ') };
  }

  try {
    mockSettingsStore = { ...validatedFields.data };
    // In a real DB, you'd also set `updatedAt: new Date()` here.
    // For mock, it's not stored unless added to SiteSettingsFormData.

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate all pages that might use site settings
    return { success: true, message: 'Site settings updated successfully (mock).' };
  } catch (e) {
    console.error('Failed to update site settings (mock):', e);
    return { error: 'Mock error.', message: 'Failed to update site settings (mock).' };
  }
}
