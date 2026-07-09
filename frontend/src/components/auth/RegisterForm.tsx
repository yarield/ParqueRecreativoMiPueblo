import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { registerSchema } from '@/schemas/auth.schema'
import { AUTH_MESSAGES, AUTH_LABELS } from '@/constants/auth.constants'
import type { RegisterFormData } from '@/schemas/auth.schema'
import type { LoginResponse } from '@/types/auth'

export default function RegisterForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: RegisterFormData) {
    setError('')
    try {
      await api.post('/auth/register', data)
      const res = await api.post<LoginResponse>('/auth/login', {
        email: data.email,
        password: data.password,
      })
      login(res.token, res.usuario)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : AUTH_MESSAGES.registerError)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="nombre">{AUTH_LABELS.nombre}</Label>
        <Input id="nombre" placeholder={AUTH_LABELS.nombrePlaceholder} {...register('nombre')} />
        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">{AUTH_LABELS.email}</Label>
        <Input id="email" type="email" placeholder={AUTH_LABELS.emailPlaceholder} {...register('email')} />
        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">{AUTH_LABELS.password}</Label>
        <Input id="password" type="password" placeholder={AUTH_LABELS.passwordPlaceholder} {...register('password')} />
        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? AUTH_MESSAGES.registering : AUTH_MESSAGES.registerButton}
      </Button>

      <p className="text-sm text-center text-gray-500">
        {AUTH_MESSAGES.alreadyHaveAccount}{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          {AUTH_MESSAGES.signIn}
        </Link>
      </p>
    </form>
  )
}
