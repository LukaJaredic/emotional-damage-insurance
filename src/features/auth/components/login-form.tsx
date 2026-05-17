import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import CommonTooltip from '@/components/common-tooltip'
import InputField from '@/components/input-field'
import Spinner from '@/components/spinner'
import Button from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FieldGroup } from '@/components/ui/field'

import { useLogin } from '../api/login'
import { loginSchema, type LoginFormData } from '../utils/login'

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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CommonTooltip title="Log in help">
            <p>The app comes with a predefined user:</p>
            <p>Email: admin@example.com</p>
            <p>Password: admin123</p>
            <p>These credentials are filled in already for your convenience.</p>
          </CommonTooltip>
          Login
        </CardTitle>
        <CardDescription>
          Enter your credentials to log in. <br />
          If you don&apos;t have an account, ask your administrator for one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          onSubmit={handleSubmit((data) => loginMutation.mutate(data))}
          noValidate
        >
          <FieldGroup>
            <InputField
              control={control}
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="admin@example.com"
            />
            <InputField
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
      <CardFooter>
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
