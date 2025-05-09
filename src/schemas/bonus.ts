import * as z from 'zod';

const MAX_DATA_URI_STRING_LENGTH = 1 * 1024 * 1024; // 1MB for the Data URI string itself

export const bonusSchema = z.object({
  title: z.string().min(5, { message: "Bonus title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Bonus description must be at least 10 characters." }),
  turnoverRequirement: z.string().min(1, { message: "Turnover requirement is required (e.g., '20x', 'None')." }),
  imageUrl: z.string().superRefine((val, ctx) => {
    const isUrl = z.string().url().safeParse(val).success;
    const isDataUri = val.startsWith('data:image/');

    if (!val || val.trim() === '') {
      // Allow empty string or provide a specific message if it's required
      // For now, assuming empty might be valid if not required by min(1) elsewhere,
      // but if it is required, Zod's default non-empty checks would handle it.
      // If it must be non-empty, add .min(1, { message: "Image URL or Data URI is required." }) before .superRefine
    } else if (!isUrl && !isDataUri) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid image URL or a data URI (e.g., data:image/png;base64,...).",
      });
    } else if (isDataUri && val.length > MAX_DATA_URI_STRING_LENGTH) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: MAX_DATA_URI_STRING_LENGTH,
        type: "string",
        inclusive: true,
        message: `Image data is too large (max ${Math.floor(MAX_DATA_URI_STRING_LENGTH / (1024 * 1024))}MB). Please use a URL or upload a smaller image file.`,
      });
    }
  }),
  ctaLink: z.string().url({ message: "Please enter a valid CTA link (e.g., https://example.com/register)." }),
  isActive: z.boolean().default(true),
});

export type BonusFormData = z.infer<typeof bonusSchema>;

export interface Bonus extends BonusFormData {
  _id: string; // Comes from MongoDB as string after conversion
  createdAt: Date;
  updatedAt: Date;
}
