import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MainLayout } from '@/components/MainLayout';

import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Repositories';
import RepositoryDetail from './pages/RepositoryDetail';
import Builds from './pages/Builds';
import BuildDetail from './pages/BuildDetail';
import Settings from './pages/Settings';
import ContainersPage from './pages/Containers';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/repositories" element={<Repositories />} />
                <Route path="/repositories/:owner/:repo" element={<RepositoryDetail />} />
                <Route path="/builds" element={<Builds />} />
                <Route path="/builds/:buildId" element={<BuildDetail />} />
                <Route path="/containers" element={<ContainersPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
