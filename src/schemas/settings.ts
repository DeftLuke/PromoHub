import * as z from 'zod';

export const siteSettingsSchema = z.object({
  backgroundType: z.enum(['image', 'video', 'gif', 'color'], {
    required_error: "You need to select a background type.",
  }).default('color'),
  backgroundValue: z.string().min(1, { message: "Background value is required (URL or hex color)." }),
});

export type SiteSettingsFormData = z.infer<typeof siteSettingsSchema>;

export interface SiteSettings extends SiteSettingsFormData {
  _id: string; // Usually a single document, e.g., with a fixed ID or name
  updatedAt: Date;
}
