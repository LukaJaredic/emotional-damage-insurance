import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { InputField } from '@/components/form'
import { CommonTooltip, Spinner } from '@/components/ui'
import { Button } from '@/components/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/shadcn/card'
import { FieldGroup } from '@/components/ui/shadcn/field'

import { useLogin } from '../api/login'
import type { LoginFormData } from '../types/login.types'
import { loginSchema } from '../utils/login'

type LoginFormProps = {
  redirectTo: string
}

function LoginForm({ redirectTo }: LoginFormProps) {
  const loginMutation = useLogin(redirectTo)

  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    // RISK: Default credentials are included for convenience, but make sure to change/remove them in production!
    defaultValues: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  })

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="animate-fade-in-up stagger-self-2">
        <CardTitle className="animate-fade-in-up flex items-center gap-2">
          <CommonTooltip
            title="Log in help"
            className="animate-fade-in-up stagger-self-10"
          >
            <p>The app comes with a predefined user:</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
            <p>These credentials are filled in already for your convenience.</p>
          </CommonTooltip>
          Login
        </CardTitle>
        <CardDescription className="animate-fade-in-up">
          Enter your credentials to log in. <br />
          If you don&apos;t have an account, ask your administrator for one.
        </CardDescription>
      </CardHeader>
      <CardContent className="animate-fade-in-up">
        <form
          id="login-form"
          onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
          noValidate
        >
          <FieldGroup>
            <InputField
              className="animate-fade-in-up stagger-self-4"
              control={control}
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="admin@example.com"
            />
            <InputField
              className="animate-fade-in-up stagger-self-6"
              control={control}
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="animate-fade-in-up stagger-self-8">
        <Button
          form="login-form"
          type="submit"
          className="mt-4 w-full"
          disabled={loginMutation.isPending}
          title="Log in"
        >
          {loginMutation.isPending ? <Spinner /> : 'Login'}
        </Button>
      </CardFooter>
    </Card>
  )
}

export default LoginForm
