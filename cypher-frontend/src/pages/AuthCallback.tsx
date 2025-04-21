import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/Spinner';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pipeline-pattern-bg">
      <Spinner size="lg" />
      <p className="mt-4 text-muted-foreground">Authentication successful, redirecting...</p>
    </div>
  );
}
