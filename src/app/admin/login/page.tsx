'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const initialState: LoginFormState = {};
  const [state, formAction] = useActionState(login, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({ title: 'লগইন ব্যর্থ হয়েছে', description: state.error, variant: 'destructive' }); // "Login Failed"
    }
  }, [state]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <SiteLogo />
          </div>
          <CardTitle className="text-2xl">অ্যাডমিন লগইন</CardTitle> {/* Admin Login */}
          <CardDescription>Sohoz88 ড্যাশবোর্ড অ্যাক্সেস করতে আপনার পাসওয়ার্ড লিখুন।</CardDescription> {/* Enter your password to access the Sohoz88 dashboard. */}
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">পাসওয়ার্ড</Label> {/* Password */}
              <Input id="password" name="password" type="password" required />
            </div>
            <input type="hidden" name="redirectPath" value={redirectPath} /> 
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
