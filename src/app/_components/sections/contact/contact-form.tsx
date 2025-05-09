'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from './_actions';
import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { contactFormSchema } from '@/schemas/contact';


type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true);
    try {
      const result = await submitContactForm(values);
      if (result.success) {
        toast({
          title: 'বার্তা পাঠানো হয়েছে!',
          description: 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।',
        });
        form.reset();
      } else {
        toast({
          title: 'ত্রুটি',
          description: result.error || 'বার্তা পাঠাতে একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'ত্রুটি',
        description: 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 md:p-8 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>আপনার নাম</FormLabel>
                <FormControl>
                  <Input placeholder="যেমনঃ মোঃ আব্দুল্লাহ" {...field} className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>আপনার ইমেইল</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="example@mail.com" {...field} className="bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>বিষয়</FormLabel>
              <FormControl>
                <Input placeholder="আপনার বার্তার বিষয় লিখুন" {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>আপনার বার্তা</FormLabel>
              <FormControl>
                <Textarea placeholder="আপনার বিস্তারিত বার্তা এখানে লিখুন..." rows={5} {...field} className="bg-background" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              পাঠানো হচ্ছে...
            </>
          ) : (
            <>
              বার্তা পাঠান
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
