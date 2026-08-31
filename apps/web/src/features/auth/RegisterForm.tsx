import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../../hooks/useRegister';

import { registerSchema, type RegisterFormValues } from './auth.schema';

import { Button } from '../../ui/Button';
import { FormField } from '../../ui/FormField';
import { Input } from '../../ui/Input';

function RegisterForm() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: RegisterFormValues) => {
    await registerMutation.mutateAsync(data);

    navigate('/', { replace: true });
  };

  const handleGithubLogin = () => {
    // redirect to Nest OAuth endpoint
  };

  const handleGoogleLogin = () => {
    // redirect to Nest OAuth endpoint
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="First name"
          htmlFor="firstName"
          error={errors.firstName?.message}
          required
        >
          <Input
            id="firstName"
            type="text"
            autoComplete="given-name"
            error={!!errors.firstName}
            {...register('firstName')}
          />
        </FormField>

        <FormField
          label="Last name"
          htmlFor="lastName"
          error={errors.lastName?.message}
          required
        >
          <Input
            id="lastName"
            type="text"
            autoComplete="family-name"
            error={!!errors.lastName}
            {...register('lastName')}
          />
        </FormField>
      </div>

      <FormField
        label="Email"
        htmlFor="email"
        error={errors.email?.message}
        required
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          error={!!errors.email}
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="password"
        error={errors.password?.message}
        required
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          error={!!errors.password}
          {...register('password')}
        />
      </FormField>

      <FormField
        label="Confirm password"
        htmlFor="passwordConfirm"
        error={errors.passwordConfirm?.message}
        required
      >
        <Input
          id="passwordConfirm"
          type="password"
          autoComplete="new-password"
          error={!!errors.passwordConfirm}
          {...register('passwordConfirm')}
        />
      </FormField>

      <Button
        type="submit"
        loading={registerMutation.isPending}
        className="w-full"
      >
        Create account
      </Button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>

        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            OR CONTINUE WITH
          </span>
        </div>
      </div>

      {/* Social login */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGithubLogin}
        >
          GitHub
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          Google
        </Button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export default RegisterForm;
