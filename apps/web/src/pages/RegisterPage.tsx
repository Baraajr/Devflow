import RegisterForm from '../features/auth/RegisterForm';
import AuthLayout from '../ui/AuthLayout';

function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Get started with your DevFlow workspace."
    >
      <RegisterForm />
    </AuthLayout>
  );
}
export default RegisterPage;
