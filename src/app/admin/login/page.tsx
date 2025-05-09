'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { login, LoginFormState } from './_actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { KeyRound, Loader2 } from 'lucide-react';
import SiteLogo from '@/components/layout/site-logo';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
      Login
    </Button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const initialState: LoginFormState = {};
  const [state, formAction] = useFormState(login, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
      router.push(redirectPath);
    }
    if (state.error) {
      toast({ title: 'Login Failed', description: state.error, variant: 'destructive' });
    }
  }, [state, router, redirectPath]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <SiteLogo />
          </div>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>Enter your password to access the Sohoz88 dashboard.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
