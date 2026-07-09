import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AUTH_LABELS } from '@/constants/auth.constants'
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{AUTH_LABELS.appTitle}</CardTitle>
          <CardDescription>{AUTH_LABELS.loginSubtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
