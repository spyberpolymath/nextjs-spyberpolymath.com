import { z } from 'zod';

// Basic validation schemas
export const emailSchema = z.string().email();
export const idSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password must be at most 100 characters');

// Endpoint schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});

export const twofaDisableSchema = z.object({
  userId: idSchema,
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(), // Will be parsed as Date
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  role: z.enum(['user', 'admin', 'moderator']).optional(),
  address: z.object({
    street: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    stateProvince: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
  // Prevent password updates via this route
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');

export const userPasswordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const userToggle2FASchema = z.object({
  enable: z.boolean(),
});

export const twofaOptionsGetSchema = z.object({}); // Headers only

export const twofaOptionsPostSchema = z.object({
  userId: idSchema,
  type: z.literal('email'),
});

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.string().min(1).max(50),
  description: z.string().max(1000),
  richDescription: z.string().min(1, 'Rich Description is required'),
  tags: z.array(z.string()).optional(),
  github: z.string().optional(),
  demo: z.string().optional(),
  kaggle: z.string().optional(),
  linkedin: z.string().optional(),
  demo2: z.string().optional(),
  published: z.boolean().optional(),
  price: z.number().min(0).optional(),
  currency: z.literal('INR').optional(),
  isPaid: z.boolean().optional(),
  zipUrl: z.string().optional(),
  downloadLimit: z.number().min(1).max(1000).optional(),
  downloadCount: z.number().min(0).optional(),
  isPaidAfterLimit: z.boolean().optional(),
});

export const projectUpdateSchema = projectCreateSchema.partial().refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');

export const projectImageSchema = z.object({}); // Form data, validated separately

export const contactCreateSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().min(10).max(20).regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

export const contactUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional(),
  phone: z.string().min(10).max(20).regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  subject: z.string().min(1).max(200).optional(),
  message: z.string().min(10).max(2000).optional(),
  status: z.enum(['new', 'read', 'replied', 'archived']).optional(),
  is_starred: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');

export const newsletterSubscribeSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  phone: z.string().min(10).max(20).regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
  whatsappEnabled: z.boolean().optional(),
});

export const newsletterUpdateSchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  lastEmailSent: z.date().optional(),
}).refine((data) => Object.keys(data).length > 0, 'At least one field must be provided');

// Helper function to validate request body
export async function validateBody<T>(schema: z.ZodSchema<T>, req: Request | any): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await req.json();
    const validated = schema.parse(body);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    return { success: false, error: 'Invalid request body' };
  }
}

// Helper for form data validation (e.g., file uploads)
export async function validateFormData(req: Request, maxFileSize: number = 5 * 1024 * 1024): Promise<{ success: true; file: File; slug: string } | { success: false; error: string }> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const slug = formData.get('slug') as string;

    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    if (!slug) {
      return { success: false, error: 'No slug provided' };
    }

    if (file.size > maxFileSize) {
      return { success: false, error: `File too large. Max size: ${maxFileSize / (1024 * 1024)}MB` };
    }

    // Basic content type check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only images allowed.' };
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { success: false, error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' };
    }

    return { success: true, file, slug };
  } catch (error) {
    return { success: false, error: 'Failed to process form data' };
  }
}