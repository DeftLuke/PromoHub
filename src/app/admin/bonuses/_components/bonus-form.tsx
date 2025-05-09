'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bonusSchema, BonusFormData } from '@/schemas/bonus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import type { BonusActionState } from '../_actions';
import Image from 'next/image';
import { useState } from 'react';
import * as z from 'zod';

interface BonusFormProps {
  initialData?: BonusFormData & { _id?: string }; // _id might not be part of form data schema but useful for context
  onSubmitAction: (data: BonusFormData) => Promise<BonusActionState>;
  submitButtonText?: string;
}

export default function BonusForm({ initialData, onSubmitAction, submitButtonText = 'Save Bonus' }: BonusFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(initialData?.imageUrl || null);


  const form = useForm<BonusFormData>({
    resolver: zodResolver(bonusSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      turnoverRequirement: '',
      imageUrl: '',
      ctaLink: '',
      isActive: true,
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for data URI preview
        toast({
          title: 'Image too large',
          description: 'For direct preview, image should be less than 2MB. Please use a URL for larger images or ensure server handles large uploads.',
          variant: 'destructive',
        });
        setPreviewImageUrl(null); 
        form.setValue('imageUrl', initialData?.imageUrl || ''); // Revert to initial or clear
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreviewImageUrl(dataUri);
        form.setValue('imageUrl', dataUri); // Update form value with data URI
      };
      reader.readAsDataURL(file);
    } else {
      const urlValue = form.getValues('imageUrl');
      if (urlValue && z.string().url().safeParse(urlValue).success) {
        setPreviewImageUrl(urlValue);
      } else if (!urlValue?.startsWith('data:image/')) { // If not a data URI either
        setPreviewImageUrl(initialData?.imageUrl || null); // Revert to initial if no file and not a valid URL
      }
    }
  };

  const handleImageUrlInputChange = (event: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue('imageUrl', url); // Update RHF state

    if (url && z.string().url().safeParse(url).success) {
      setPreviewImageUrl(url);
    } else if (url && url.startsWith('data:image/')) {
      // It's already a data URI, RHF is updated, preview will be set by handleImageChange or if pasted directly
      setPreviewImageUrl(url);
    }
     else {
      setPreviewImageUrl(null); // Clear preview if not a valid URL and not a data URI
    }
  };


  async function onSubmit(values: BonusFormData) {
    setIsSubmitting(true);
    try {
      const result = await onSubmitAction(values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message || 'Bonus saved successfully.',
        });
        router.push('/admin/bonuses');
        router.refresh(); 
      } else {
        toast({
          title: 'Error Saving Bonus',
          description: result.message || 'Failed to save bonus. Please check the details.',
          variant: 'destructive',
        });
      }
    } catch (error: any) { // Catch as any to inspect properties
      console.error("BonusForm onSubmit caught error:", error);
      let description = 'An unexpected client-side error occurred.';
      if (error instanceof Error) {
        description = error.message;
      } else if (typeof error === 'string') {
        description = error;
      } else if (error && typeof error.toString === 'function' && error.toString() !== '[object Object]') {
        description = error.toString();
      } else {
        // Attempt to get a message if it's an object with a message property (like from server action errors not fitting BonusActionState)
        description = error?.message || 'An unknown error occurred. Check console for details.';
      }
      toast({
        title: 'Error',
        description: description,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bonus Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Claim 1000৳ Bonus!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bonus Description</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Deposit 1000৳ and claim your reward!" {...field} rows={4} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="turnoverRequirement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Turnover Requirement</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 20x, 5x, None" {...field} />
              </FormControl>
              <FormDescription>Enter the turnover requirement, or 'None'.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => ( // field here is from RHF for imageUrl
            <FormItem>
              <FormLabel>Image URL or Upload</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Paste image URL or Data URI, or use upload button" 
                  {...field} // RHF handles value and onChange for this input
                  onChange={handleImageUrlInputChange} // Custom handler for URL/DataURI paste
                  onBlur={handleImageUrlInputChange}   // Also on blur for URL validation
                />
              </FormControl>
              <FormDescription>
                Enter a direct image URL, paste a Data URI, or use the button below to upload an image (max 2MB for preview).
              </FormDescription>
               <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  // This input is for file selection only, does not directly bind to RHF's imageUrl field's value
                  // RHF's imageUrl is updated by handleImageChange via form.setValue
                  onChange={handleImageChange} 
                />
              <FormMessage />
            </FormItem>
          )}
        />

        {previewImageUrl && (
          <div className="mt-4 space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <div className="w-full max-w-xs h-auto aspect-video relative">
              <Image
                src={previewImageUrl}
                alt="Bonus image preview"
                fill
                className="rounded-md border object-contain"
                onError={() => {
                  setPreviewImageUrl(null); 
                  toast({ title: 'Preview Error', description: 'Could not load image preview from the source.', variant: 'destructive'});
                }}
              />
            </div>
          </div>
        )}


        <FormField
          control={form.control}
          name="ctaLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CTA Link</FormLabel>
              <FormControl>
                <Input placeholder="https://sohoz88.com/deposit" {...field} />
              </FormControl>
              <FormDescription>Link for the Call to Action button (e.g., to deposit or register page).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Is this bonus currently active and visible to users?
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitButtonText}
        </Button>
      </form>
    </Form>
  );
}
