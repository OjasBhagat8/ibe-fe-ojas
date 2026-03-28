import { useParams } from 'react-router-dom';
import LoginPage from './LoginPage';

export default function SupervisorLoginPage() {
  const { tenantName = '' } = useParams<{ tenantName: string }>();
  return (
    <LoginPage
      role="SUPERVISOR"
      redirectTo={`/${tenantName}/supervisor/dashboard`}
      switchLink={{ label: 'Staff? Login here', to: '/staff/login' }}
    />
  );
}
