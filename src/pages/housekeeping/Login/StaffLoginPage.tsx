import { useParams } from 'react-router-dom';
import LoginPage from './LoginPage';

export default function StaffLoginPage() {
  const { tenantName = '' } = useParams<{ tenantName: string }>();
  return (
    <LoginPage
      role="STAFF"
      redirectTo={`/${tenantName}/staff/overview`}
      switchLink={{ label: 'Supervisor? Login here', to: '/supervisor/login' }}
    />
  );
}
