import * as z from 'zod';

export const bonusSchema = z.object({
  title: z.string().min(5, { message: "Bonus title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Bonus description must be at least 10 characters." }),
  turnoverRequirement: z.string().min(1, { message: "Turnover requirement is required (e.g., '20x', 'None')." }),
  // Accepts a standard URL or a data URI for images. Note: Storing large data URIs in MongoDB is not recommended for production.
  imageUrl: z.string().refine(value => {
    const isUrl = z.string().url().safeParse(value).success;
    const isDataUri = value.startsWith('data:image/');
    return isUrl || isDataUri;
  }, { message: "Please enter a valid image URL or a data URI (e.g., data:image/png;base64,...)."}),
  ctaLink: z.string().url({ message: "Please enter a valid CTA link (e.g., https://example.com/register)." }),
  isActive: z.boolean().default(true),
});

export type BonusFormData = z.infer<typeof bonusSchema>;

export interface Bonus extends BonusFormData {
  _id: string; // Comes from MongoDB as string after conversion
  createdAt: Date;
  updatedAt: Date;
}
