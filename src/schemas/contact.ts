import * as z from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে।' }),
  email: z.string().email({ message: 'সঠিক ইমেইল ঠিকানা দিন।' }),
  subject: z.string().min(5, { message: 'বিষয় কমপক্ষে ৫ অক্ষরের হতে হবে।' }),
  message: z.string().min(10, { message: 'বার্তা কমপক্ষে ১০ অক্ষরের হতে হবে।' }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
