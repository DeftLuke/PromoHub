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
    return { error: 'অবৈধ পাসওয়ার্ড ফরম্যাট।' }; // "Invalid password format."
  }

  if (validatedFields.data.password === ADMIN_PASSWORD) {
    cookies().set(ADMIN_PASSWORD_COOKIE_NAME, 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', 
      sameSite: 'lax',
    });

    const submittedRedirectPath = formData.get('redirectPath') as string | null;
    let targetPath = '/admin'; 
    // Ensure submittedRedirectPath is a safe, relative path starting with /admin and not /admin/login
    if (submittedRedirectPath && 
        submittedRedirectPath.startsWith('/admin') && 
        submittedRedirectPath !== '/admin/login') {
      try {
        // Validate if it's a valid relative URL structure, preventing // or http lead-ins
        const testUrl = new URL(submittedRedirectPath, 'http://localhost'); // Base URL is arbitrary for path validation
        if (testUrl.pathname === submittedRedirectPath) { // Ensures no scheme/host was injected
             targetPath = submittedRedirectPath;
        }
      } catch (e) {
        // Invalid path, fall back to default
        targetPath = '/admin';
      }
    }
    redirect(targetPath);

  } else {
    return { error: 'ভুল পাসওয়ার্ড।' }; // "Incorrect password."
  }
}

export async function logout() {
  cookies().delete(ADMIN_PASSWORD_COOKIE_NAME);
  redirect('/admin/login');
}
