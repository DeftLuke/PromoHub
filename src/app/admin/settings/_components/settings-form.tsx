'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { siteSettingsSchema, SiteSettingsFormData } from '@/schemas/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SettingsActionState } from '../_actions';
import { useState } from 'react';

interface SettingsFormProps {
  initialData: SiteSettingsFormData; // Must be non-null from server
  onSubmitAction: (data: SiteSettingsFormData) => Promise<SettingsActionState>;
}

export default function SettingsForm({ initialData, onSubmitAction }: SettingsFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewValue, setPreviewValue] = useState(initialData.backgroundValue);
  const [previewType, setPreviewType] = useState(initialData.backgroundType);

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: SiteSettingsFormData) {
    setIsSubmitting(true);
    try {
      const result = await onSubmitAction(values);
      if (result.success) {
        toast({
          title: 'Success!',
          description: result.message || 'Settings saved successfully.',
        });
        router.refresh(); // Refresh current page to reflect changes if any shown here
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to save settings.',
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
  
  const currentBackgroundType = form.watch('backgroundType');

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue('backgroundValue', e.target.value);
    setPreviewValue(e.target.value);
  };

  const handleTypeChange = (value: 'image' | 'video' | 'gif' | 'color') => {
    form.setValue('backgroundType', value);
    setPreviewType(value);
  };


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="backgroundType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Type</FormLabel>
              <Select onValueChange={(value: 'image' | 'video' | 'gif' | 'color') => {
                  field.onChange(value);
                  handleTypeChange(value);
                }} 
                defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select background type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="image">Image URL</SelectItem>
                  <SelectItem value="video">Video URL (MP4)</SelectItem>
                  <SelectItem value="gif">GIF URL</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>Choose the type of background for the site.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="backgroundValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Background Value</FormLabel>
              <FormControl>
                {currentBackgroundType === 'color' ? (
                  <Input type="color" {...field} onChange={handleValueChange} className="h-12 p-1"/>
                ) : (
                  <Input placeholder="Enter URL (e.g., https://example.com/image.jpg)" {...field} onChange={handleValueChange} />
                )}
              </FormControl>
              <FormDescription>
                {currentBackgroundType === 'color'
                  ? 'Enter a hex color code (e.g., #FF0000).'
                  : `Enter the URL for the ${currentBackgroundType}. For videos, use MP4.`}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {previewValue && (
          <div className="mt-4 space-y-2">
            <FormLabel>Background Preview</FormLabel>
            <div
              className="w-full h-48 rounded-md border flex items-center justify-center text-muted-foreground"
              style={previewType === 'color' ? { backgroundColor: previewValue } : {}}
            >
              {previewType === 'image' && <img src={previewValue} alt="Background Preview" className="max-w-full max-h-full object-contain rounded-md" />}
              {previewType === 'gif' && <img src={previewValue} alt="Background Preview" className="max-w-full max-h-full object-contain rounded-md" />}
              {previewType === 'video' && <video src={previewValue} className="max-w-full max-h-full object-contain rounded-md" controls autoPlay muted loop >Your browser does not support the video tag.</video>}
              {previewType === 'color' && <span>Color Preview</span>}
            </div>
          </div>
        )}

        <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </form>
    </Form>
  );
}
