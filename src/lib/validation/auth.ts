import { z } from 'zod'

// ─── Password rules ────────────────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8,  'Password must be at least 8 characters')
  .max(72, 'Password must be under 72 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email address is too long')
  .toLowerCase()

// ─── Login schema ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email:    emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ─── Signup schema ─────────────────────────────────────────────────────────

export const signupSchema = z.object({
  displayName: z
    .string()
    .min(2,  'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .regex(/^[a-zA-Z0-9 _.'-]+$/, 'Name contains invalid characters'),
  email:           emailSchema,
  password:        passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  acceptTerms:     z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' }),
  }),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] },
)

export type SignupFormData = z.infer<typeof signupSchema>

// ─── Forgot password schema ────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ─── Reset password schema ─────────────────────────────────────────────────

export const resetPasswordSchema = z.object({
  password:        passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match', path: ['confirmPassword'] },
)

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ─── KYC schemas ──────────────────────────────────────────────────────────

export const kycStep1Schema = z.object({
  firstName:   z.string().min(1, 'First name is required').max(50),
  lastName:    z.string().min(1, 'Last name is required').max(50),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine((dob) => {
    const age = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000)
    return age >= 18
  }, 'You must be at least 18 years old'),
  nationality: z.string().min(2, 'Nationality is required').max(2),
  phone:       z.string().min(7, 'Phone number is required').max(20).optional(),
})

export type KYCStep1Data = z.infer<typeof kycStep1Schema>

export const kycStep2Schema = z.object({
  documentType:   z.enum(['passport', 'national-id', 'drivers-license'], {
    errorMap: () => ({ message: 'Please select a document type' }),
  }),
  documentNumber: z.string().min(4, 'Document number is required').max(30),
  expiryDate:     z.string().min(1, 'Expiry date is required').refine((d) => {
    return new Date(d) > new Date()
  }, 'Document must not be expired'),
})

export type KYCStep2Data = z.infer<typeof kycStep2Schema>

export const kycStep3Schema = z.object({
  addressLine1: z.string().min(3,  'Address is required').max(100),
  addressLine2: z.string().max(100).optional(),
  city:         z.string().min(1, 'City is required').max(50),
  state:        z.string().max(50).optional(),
  postalCode:   z.string().min(3, 'Postal code is required').max(20),
  country:      z.string().min(2).max(2),
})

export type KYCStep3Data = z.infer<typeof kycStep3Schema>
