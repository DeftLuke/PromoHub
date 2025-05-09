
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { siteSettingsSchema, SiteSettingsFormData, SiteSettings } from '@/schemas/settings';
import clientPromise, { DB_NAME } from '@/lib/mongodb'; // Import DB_NAME
import type { Collection } from 'mongodb'; // ObjectId is not explicitly used here with string ID

// const DB_NAME = process.env.MONGODB_DB_NAME; // Replaced by import
const SETTINGS_COLLECTION = process.env.SETTINGS_COLLECTION_NAME || 'siteSettings';
const SITE_SETTINGS_DOC_ID = 'global_settings'; 

async function getSettingsCollection(): Promise<Collection<Omit<SiteSettings, '_id' | 'updatedAt'> & { _id: string; updatedAt: Date }>> {
  if (!DB_NAME) {
    throw new Error('MongoDB DB_NAME is not configured.');
  }
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection(SETTINGS_COLLECTION);
}

export type SettingsActionState = {
  error?: string;
  success?: boolean;
  message?: string;
};

export async function getSiteSettings(): Promise<SiteSettingsFormData | null> {
  try {
    const collection = await getSettingsCollection();
    const settingsDoc = await collection.findOne({ _id: SITE_SETTINGS_DOC_ID });

    if (settingsDoc) {
      const { backgroundType, backgroundValue } = settingsDoc;
      return { backgroundType, backgroundValue };
    }
    return { 
        backgroundType: 'color',
        backgroundValue: '#E0F2FE', 
      };
  } catch (e) {
    console.error('Failed to fetch site settings:', e);
    return { 
        backgroundType: 'color',
        backgroundValue: '#E0F2FE',
      };
  }
}

export async function updateSiteSettings(data: SiteSettingsFormData): Promise<SettingsActionState> {
  const validatedFields = siteSettingsSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: 'Invalid data.', message: JSON.stringify(validatedFields.error.flatten().fieldErrors) };
  }

  try {
    const collection = await getSettingsCollection();
    const settingsToUpdate = {
      ...validatedFields.data,
      updatedAt: new Date(),
    };

    await collection.updateOne(
      { _id: SITE_SETTINGS_DOC_ID },
      { $set: settingsToUpdate },
      { upsert: true } 
    );

    revalidatePath('/admin/settings');
    revalidatePath('/'); 
    return { success: true, message: 'Site settings updated successfully.' };
  } catch (e) {
    console.error('Failed to update site settings:', e);
    let errorMessage = 'Failed to update site settings due to a server issue.';
    if (e instanceof Error) {
      errorMessage = e.message;
    } else if (typeof e === 'string') {
      errorMessage = e;
    }
    return { error: 'Database error.', message: errorMessage };
  }
}

