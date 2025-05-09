
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
      secure: process.env.NODE_ENV === 'production', // IMPORTANT: This cookie will only be sent over HTTPS if secure is true. For local HTTP development, NODE_ENV should be 'development'.
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/', // Cookie available for all paths on the domain
      sameSite: 'lax', // Recommended for security
    });

    // Original redirect logic:
    // const submittedRedirectPath = formData.get('redirectPath') as string | null;
    // let targetPath = '/admin'; 
    // if (submittedRedirectPath && submittedRedirectPath.startsWith('/')) {
    //   if (!submittedRedirectPath.startsWith('//') && !submittedRedirectPath.startsWith('http')) {
    //     targetPath = submittedRedirectPath;
    //   }
    // }
    // redirect(targetPath);

    // Simplified redirect: always go to /admin dashboard after login.
    // This can help simplify debugging if complex redirect paths were an issue.
    // If the cookie persistence issue is due to environment (e.g. NODE_ENV=production on HTTP),
    // this change won't fix that, but it removes one variable.
    redirect('/admin');

  } else {
    return { error: 'ভুল পাসওয়ার্ড।' }; // "Incorrect password."
  }
}

export async function logout() {
  cookies().delete(ADMIN_PASSWORD_COOKIE_NAME);
  redirect('/admin/login');
}

