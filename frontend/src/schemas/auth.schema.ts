import { z } from 'zod'
import { AUTH_MESSAGES } from '@/constants/auth.constants'

export const loginSchema = z.object({
  email: z.string().min(1, AUTH_MESSAGES.emailRequired).email(AUTH_MESSAGES.emailInvalid),
  password: z.string().min(1, AUTH_MESSAGES.passwordRequired),
})

export const registerSchema = z.object({
  nombre: z.string().min(2, AUTH_MESSAGES.nombreMinLength),
  email: z.string().min(1, AUTH_MESSAGES.emailRequired).email(AUTH_MESSAGES.emailInvalid),
  password: z.string().min(6, AUTH_MESSAGES.passwordMinLength),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
