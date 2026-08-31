import LoginForm from '../features/auth/LoginForm';
import AuthLayout from '../ui/AuthLayout';

function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to continue to your workspace."
    >
      <LoginForm />
    </AuthLayout>
  );
}

export default LoginPage;
