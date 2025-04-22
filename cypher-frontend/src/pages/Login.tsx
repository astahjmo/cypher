import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Github, GitBranch } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function Login() {
  const { login, user, loading, checkAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      setCheckingAuth(true);
      if (location.search.includes('callback=true')) {
        const authenticated = await checkAuth();
        if (authenticated) {
          navigate('/dashboard');
        }
      } else if (user) {
        navigate('/dashboard');
      }
      setCheckingAuth(false);
    };

    verifyAuth();
  }, [user, navigate, location.search, checkAuth]);

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pipeline-pattern-bg">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold">Verifying authentication...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pipeline-pattern-bg">
      <div className="max-w-md w-full p-8 bg-white dark:bg-card rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#2563EB" />
              <path
                d="M2 17L12 22L22 17"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold">Cypher</h1>
          <p className="text-muted-foreground mt-2">Modern CI/CD pipeline orchestration platform</p>
        </div>

        <div className="space-y-4">
          <Button className="w-full gap-2" onClick={login} size="lg">
            <Github size={20} />
            <span>Continue with GitHub</span>
          </Button>

          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Other login options coming soon
            </span>
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled className="gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
              >
                <path d="M128.075 236.075l47.104-144.97H80.97l47.104 144.97z" fill="#E24329" />
                <path d="M128.075 236.074L80.97 91.104H14.956l113.119 144.97z" fill="#FC6D26" />
                <path
                  d="M14.956 91.104L.642 135.16a9.752 9.752 0 0 0 3.542 10.903l123.891 90.012-113.12-144.97z"
                  fill="#FCA326"
                />
                <path
                  d="M14.956 91.105H80.97L52.601 3.79c-1.46-4.493-7.816-4.492-9.275 0l-28.37 87.315z"
                  fill="#E24329"
                />
                <path d="M128.075 236.074l47.104-144.97h66.015l-113.12 144.97z" fill="#FC6D26" />
                <path
                  d="M241.194 91.104l14.314 44.056a9.752 9.752 0 0 1-3.543 10.903l-123.89 90.012 113.119-144.97z"
                  fill="#FCA326"
                />
                <path
                  d="M241.194 91.105h-66.015l28.37-87.315c1.46-4.493 7.816-4.492 9.275 0l28.37 87.315z"
                  fill="#E24329"
                />
              </svg>
              <span>GitLab</span>
            </Button>
            <Button variant="outline" disabled className="gap-2">
              <svg
                className="w-4 h-4"
                viewBox="0 0 256 256"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid"
              >
                <path
                  d="M20 0a20 20 0 0 0-6.25 39.063V216.934A20 20 0 0 0 39.999 236h176.001V20A20 20 0 0 0 196 0H20zm91.54 48.249c23.089 0 38.214 18.281 38.214 40.255 0 21.978-15.125 40.255-38.214 40.255-23.089 0-38.213-18.277-38.213-40.255 0-21.974 15.124-40.255 38.213-40.255zm35.73 134.615H85.978v-15.5h61.292v15.5z"
                  fill="#2684FF"
                />
              </svg>
              <span>Bitbucket</span>
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to Cypher's Terms of Service and Privacy Policy.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto mb-4">
              <Github size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">GitHub Integration</h3>
            <p className="text-muted-foreground text-sm">
              Seamlessly connect your GitHub repositories for automated builds.
            </p>
          </div>

          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto mb-4">
              <GitBranch size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">Branch Management</h3>
            <p className="text-muted-foreground text-sm">
              Configure automatic builds on specific branches with webhooks.
            </p>
          </div>

          <div className="bg-white dark:bg-card p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="4"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="14"
                  y="4"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <rect
                  x="4"
                  y="14"
                  width="6"
                  height="6"
                  rx="1"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 17H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M17 14V20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">Pipeline Visualization</h3>
            <p className="text-muted-foreground text-sm">
              Monitor builds and pipelines with real-time status updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
