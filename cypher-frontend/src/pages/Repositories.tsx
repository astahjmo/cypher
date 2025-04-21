import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Lock, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_URL } from '@/config';

interface Repository {
  name: string;
  full_name: string;
  private: boolean;
  url: string;
}

interface RepositoryConfig {
  _id: string;
  user_id: string;
  repo_full_name: string;
  auto_build_branches: string[];
  created_at: string;
  updated_at: string;
}

const fetchRepositories = async (): Promise<Repository[]> => {
  const response = await fetch(`${API_URL}/repositories`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

const RepoCardSkeleton = () => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="h-4 w-20" />
      </CardDescription>
    </CardHeader>
    <CardFooter>
      <Skeleton className="h-9 w-32" />
    </CardFooter>
  </Card>
);

export default function Repositories() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const [configuredRepos, setConfiguredRepos] = useState<string[]>([]);

  const {
    data: repositories = [],
    isLoading,
    isError,
    error,
  } = useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    staleTime: 5 * 60 * 1000,
  });

  const safeRepositories = Array.isArray(repositories) ? repositories : [];
  const filteredRepositories = safeRepositories.filter((repo) =>
    repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  useEffect(() => {
    if (isError && error) {
      toast({
        title: 'Error Fetching Repositories',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  }, [isError, error, toast]);

  useEffect(() => {
    if (!isLoading && !isError && safeRepositories.length > 0 && configuredRepos.length === 0) {
      setConfiguredRepos([safeRepositories[0].full_name]);
    }
  }, [isLoading, isError, safeRepositories, configuredRepos.length]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
        <p className="text-muted-foreground mt-1">
          Select a repository to configure for automated builds
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <RepoCardSkeleton key={index} />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8 text-destructive">
            <h3 className="text-lg font-semibold">Failed to load repositories</h3>
            <p className="text-center mt-2 max-w-md">
              {error?.message || 'An unknown error occurred.'}
            </p>
          </CardContent>
        </Card>
      ) : filteredRepositories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="mb-4 rounded-full bg-muted p-3">
              <Github className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">
              {searchQuery ? 'No repositories found' : 'No repositories available'}
            </h3>
            <p className="text-muted-foreground text-center mt-2 max-w-md">
              {searchQuery
                ? `No repositories matching "${searchQuery}" were found.`
                : 'No repositories accessible or GitHub account not connected.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map((repo) => (
            <Card
              key={repo.full_name}
              className={cn(configuredRepos.includes(repo.full_name) && 'border-primary')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Github className="h-5 w-5" />
                  {repo.name}
                  {repo.private && <Lock className="h-4 w-4 text-muted-foreground" />}
                </CardTitle>
                <CardDescription>{repo.full_name.split('/')[0]}</CardDescription>
              </CardHeader>

              <CardFooter>
                {configuredRepos.includes(repo.full_name) ? (
                  <Button asChild>
                    <Link to={`/repositories/${repo.full_name}`}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                    <Link to={`/repositories/${repo.full_name}`}>Set Up Pipeline</Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
