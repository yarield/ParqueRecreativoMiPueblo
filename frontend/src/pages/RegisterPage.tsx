import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AUTH_LABELS } from '@/constants/auth.constants'
import RegisterForm from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{AUTH_LABELS.registerTitle}</CardTitle>
          <CardDescription>{AUTH_LABELS.registerSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  )
}
