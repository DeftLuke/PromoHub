// src/app/admin/bonuses/_components/bonus-form.tsx
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
  initialData?: BonusFormData & { _id?: string };
  onSubmitAction: (data: BonusFormData) => Promise<BonusActionState>;
  submitButtonText?: string;
}

// Consistent size limits
const MAX_FILE_SIZE_BYTES = 0.7 * 1024 * 1024; // Approx 700KB for binary file, leading to <1MB Data URI
const MAX_PREVIEW_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB for client-side preview generation feasibility

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
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'Image File Too Large',
          description: `For submission, image file should be less than ${Math.floor(MAX_FILE_SIZE_BYTES / 1024)}KB. Please use a smaller file or a URL.`,
          variant: 'destructive',
        });
        setPreviewImageUrl(null);
        form.setValue('imageUrl', initialData?.imageUrl || ''); // Revert or clear
        event.target.value = ''; // Clear the file input
        return;
      }
      
      // Separate check for preview generation if needed, but primary concern is submission size.
      // If MAX_FILE_SIZE_BYTES is small enough, MAX_PREVIEW_FILE_SIZE_BYTES might be redundant here if it was larger.
      // For simplicity, we'll use MAX_FILE_SIZE_BYTES as the hard limit for attempting to read as Data URI.

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreviewImageUrl(dataUri);
        form.setValue('imageUrl', dataUri, { shouldValidate: true }); 
      };
      reader.onerror = () => {
        toast({ title: 'File Read Error', description: 'Could not read the selected file.', variant: 'destructive'});
        setPreviewImageUrl(null);
        form.setValue('imageUrl', initialData?.imageUrl || '');
      }
      reader.readAsDataURL(file);
    } else {
      // If no file is selected, or selection is cleared
      const currentUrlValue = form.getValues('imageUrl');
      // If the current value is not a Data URI (meaning it was likely a URL or initial data)
      // and the file input is cleared, we might want to revert to initialData's imageUrl if it was a URL.
      // Or simply clear the preview if the value is no longer a valid image source.
      if (!currentUrlValue?.startsWith('data:image/')) {
        setPreviewImageUrl(currentUrlValue && z.string().url().safeParse(currentUrlValue).success ? currentUrlValue : null);
      } else if (!currentUrlValue) { // If imageUrl field is empty
        setPreviewImageUrl(null);
      }
    }
  };

  const handleImageUrlInputChange = (event: React.FocusEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue('imageUrl', url, { shouldValidate: true }); 

    if (url && z.string().url().safeParse(url).success) {
      setPreviewImageUrl(url);
    } else if (url && url.startsWith('data:image/')) {
      setPreviewImageUrl(url); // Zod schema will validate its length on submit
    } else {
      setPreviewImageUrl(null);
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
        // Handle Zod validation errors from server specifically
        if (result.error === 'Invalid data.' && result.message) {
          try {
            const fieldErrors = JSON.parse(result.message) as Partial<Record<keyof BonusFormData, string[]>>;
            Object.entries(fieldErrors).forEach(([fieldName, errors]) => {
              if (errors && errors.length > 0) {
                form.setError(fieldName as keyof BonusFormData, { type: 'server', message: errors.join(', ') });
              }
            });
            toast({
              title: 'Validation Error',
              description: 'Please correct the errors highlighted in the form.',
              variant: 'destructive',
            });
          } catch (parseError) {
            // Fallback if JSON parsing of error message fails
            toast({
              title: 'Error Saving Bonus',
              description: result.message || 'Failed to save bonus. Please check the details.',
              variant: 'destructive',
            });
          }
        } else {
          // Handle other types of errors (e.g., 'Database error.')
          toast({
            title: 'Error Saving Bonus',
            description: result.message || 'Failed to save bonus. Please check the details.',
            variant: 'destructive',
          });
        }
      }
    } catch (error: any) {
      console.error("BonusForm onSubmit caught error:", error);
      let description = 'An unexpected client-side error occurred.';
      if (error instanceof Error) {
        description = error.message;
      } else if (typeof error === 'string') {
        description = error;
      } else if (error && typeof error.toString === 'function' && error.toString() !== '[object Object]') {
        description = error.toString();
      } else {
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
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL or Upload</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Paste image URL or Data URI, or use upload button" 
                  {...field}
                  onChange={(e) => {
                    field.onChange(e); // RHF's own onChange
                    handleImageUrlInputChange(e); // Custom handler for preview
                  }}
                  onBlur={(e) => {
                    field.onBlur(); // RHF's own onBlur
                    handleImageUrlInputChange(e); // Custom handler for preview
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter a direct image URL, or use the button below to upload an image (max {Math.floor(MAX_FILE_SIZE_BYTES / 1024)}KB file).
              </FormDescription>
               <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  // This input is for file selection only.
                  // RHF's imageUrl is updated by handleImageChange via form.setValue
                  onChange={handleImageChange} 
                />
              <FormMessage /> {/* This will show Zod schema errors for imageUrl, including Data URI length */}
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
                  // Don't clear form.setValue('imageUrl') here if it was a valid URL that just failed to load for preview
                  // Only clear previewImageUrl
                  setPreviewImageUrl(null); 
                  toast({ title: 'Preview Error', description: 'Could not load image preview from the source.', variant: 'warning'});
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
