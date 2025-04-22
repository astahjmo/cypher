import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/Spinner';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <h2 className="mt-4 text-xl">Loading Cypher...</h2>
      </div>
    </div>
  );
};

export default Index;
