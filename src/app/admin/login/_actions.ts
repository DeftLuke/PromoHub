'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/schemas/login';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'sohoz88admin';
const ADMIN_PASSWORD_COOKIE_NAME = 'sohoz88_admin_auth';

export type LoginFormState = {
  error?: string;
  success?: boolean;
};

export async function login(
  prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validatedFields = loginSchema.safeParse({
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return { error: 'Invalid password format.' };
  }

  if (validatedFields.data.password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_PASSWORD_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    // Redirect handled by client-side after form submission success
    return { success: true };
  } else {
    return { error: 'Incorrect password.' };
  }
}

export async function logout() {
  cookies().delete(ADMIN_PASSWORD_COOKIE_NAME);
  redirect('/admin/login');
}
