import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/Spinner';
import { RefreshCw, Search, ServerCrash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuildListItem } from '@/interfaces/build';
import { BuildsTable } from '@/components/build/BuildsTable';
import { useBuildsList } from '@/hooks/useBuildsList';

export default function Builds() {
  const { builds, loading, error } = useBuildsList();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredBuilds = builds.filter((build) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      build.repo_full_name.toLowerCase().includes(searchLower) ||
      build.branch.toLowerCase().includes(searchLower) ||
      (build.commit_sha && build.commit_sha.toLowerCase().includes(searchLower)) ||
      (build.commit_message && build.commit_message.toLowerCase().includes(searchLower));

    const matchesStatus = statusFilter === 'all' || build.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Builds</h1>
        <p className="text-muted-foreground mt-1">Monitor all your pipeline builds</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search by repository, branch or commit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center p-8 text-destructive">
            <ServerCrash className="h-10 w-10 mb-4" />
            <h3 className="text-lg font-semibold text-center">Failed to load builds</h3>
            <p className="text-center mt-2">{error}</p>
          </CardContent>
        </Card>
      ) : filteredBuilds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="mb-4 rounded-full bg-muted p-3">
              <RefreshCw className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No builds found</h3>
            <p className="text-muted-foreground text-center mt-2">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No builds have been run yet. Configure a repository to start.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button className="mt-4" asChild>
                <Link to="/repositories">Configure Repository</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <BuildsTable builds={filteredBuilds} />
      )}
    </div>
  );
}
