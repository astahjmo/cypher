import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/Spinner';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};
