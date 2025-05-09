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
import { BonusActionState } from '../_actions';
import Image from 'next/image';
import { useState } from 'react';

interface BonusFormProps {
  initialData?: BonusFormData & { _id?: string };
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
          description: 'For direct preview, image should be less than 2MB. Please use a URL for larger images.',
          variant: 'destructive',
        });
        setPreviewImageUrl(null); 
        form.setValue('imageUrl', ''); // Clear the value if too large
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreviewImageUrl(dataUri);
        form.setValue('imageUrl', dataUri);
      };
      reader.readAsDataURL(file);
    } else {
       // If no file is selected (e.g., selection cancelled), try to use URL input for preview
      const urlValue = form.getValues('imageUrl');
      if (urlValue && z.string().url().safeParse(urlValue).success) {
        setPreviewImageUrl(urlValue);
      } else {
        setPreviewImageUrl(null);
      }
    }
  };

  const handleImageUrlBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const url = event.target.value;
    if (url && z.string().url().safeParse(url).success) {
      setPreviewImageUrl(url);
    } else if (!url.startsWith('data:image/')) { // Don't clear if it's a data URI
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
        router.refresh(); // Ensure the list page is updated
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to save bonus.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
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
                  placeholder="https://example.com/image.png or paste Data URI" 
                  {...field} 
                  onBlur={handleImageUrlBlur}
                  onChange={(e) => {
                    field.onChange(e); // RHF's onChange
                    // If it's not a data URI starting, try to set preview from URL
                    if (!e.target.value.startsWith('data:image/')) {
                       if (z.string().url().safeParse(e.target.value).success) {
                         setPreviewImageUrl(e.target.value);
                       } else {
                         setPreviewImageUrl(null);
                       }
                    }
                  }}
                />
              </FormControl>
              <FormDescription>
                Enter a direct image URL, or use the button below to upload an image (max 2MB for preview).
              </FormDescription>
               <Input
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={handleImageChange}
                />
              <FormMessage />
            </FormItem>
          )}
        />

        {previewImageUrl && (
          <div className="mt-4 space-y-2">
            <FormLabel>Image Preview</FormLabel>
            <Image
              src={previewImageUrl}
              alt="Bonus image preview"
              width={200}
              height={125}
              className="rounded-md border object-contain aspect-video"
              onError={() => {
                // This could happen if the URL is invalid or image fails to load
                setPreviewImageUrl(null); 
                toast({ title: 'Preview Error', description: 'Could not load image preview from the URL.', variant: 'destructive'});
              }}
            />
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
