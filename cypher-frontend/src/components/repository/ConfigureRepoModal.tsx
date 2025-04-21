import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/Spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Loader2, Save, Check as CheckIcon, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Repository, Branch, RepositoryConfig } from '@/interfaces/dashboard';
import { fetchRepositories, fetchBranches, saveConfig } from '@/services/api/repositoryService';

const BranchListSkeleton = () => (
  <div className="space-y-2">
    {[...Array(4)].map((_, index) => (
      <div key={index} className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-[80%]" />
      </div>
    ))}
  </div>
);

interface ConfigureRepoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveSuccess?: (config: RepositoryConfig) => void;
}

export function ConfigureRepoModal({ open, onOpenChange, onSaveSuccess }: ConfigureRepoModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [pipelineName, setPipelineName] = useState('');
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string | undefined>(undefined);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [repoComboboxOpen, setRepoComboboxOpen] = useState(false);

  const {
    data: repositories = [],
    isLoading: isLoadingRepos,
    isError: isErrorRepos,
  } = useQuery<Repository[], Error>({
    queryKey: ['repositories'],
    queryFn: fetchRepositories,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const selectedRepoDetails = selectedRepoFullName?.split('/');
  const owner = selectedRepoDetails?.[0];
  const repo = selectedRepoDetails?.[1];

  const {
    data: branches = [],
    isLoading: isLoadingBranches,
    isError: isErrorBranches,
  } = useQuery<Branch[], Error>({
    queryKey: ['branches', owner, repo],
    queryFn: () => fetchBranches(owner!, repo!),
    enabled: !!owner && !!repo && open,
    staleTime: 1 * 60 * 1000,
  });

  useEffect(() => {
    setSelectedBranches([]);
  }, [selectedRepoFullName]);

  const saveMutation = useMutation<
    RepositoryConfig,
    Error,
    { owner: string; repo: string; branches: string[] }
  >({
    mutationFn: ({ owner, repo, branches }) => saveConfig(owner, repo, branches),
    onSuccess: (data) => {
      toast({ title: 'Success', description: 'Configuration saved successfully.' });
      queryClient.invalidateQueries({ queryKey: ['config', owner, repo] });
      queryClient.invalidateQueries({ queryKey: ['repoConfigs'] });
      onOpenChange(false);
      if (onSaveSuccess) {
        onSaveSuccess(data);
      }
      setPipelineName('');
      setSelectedRepoFullName(undefined);
      setSelectedBranches([]);
    },
    onError: (err) => {
      toast({
        title: 'Error Saving Configuration',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const handleBranchToggle = (branchName: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branchName) ? prev.filter((b) => b !== branchName) : [...prev, branchName],
    );
  };

  const handleSave = () => {
    if (!owner || !repo || !selectedRepoFullName) {
      toast({ title: 'Error', description: 'Please select a repository.', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({ owner, repo, branches: selectedBranches });
  };

  const safeBranches = Array.isArray(branches) ? branches : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] pointer-events-auto">
        <DialogHeader>
          <DialogTitle>Configure Repository Pipeline</DialogTitle>
          <DialogDescription>
            Select a repository and choose branches to enable automatic builds.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pipeline-name" className="text-right">
              Pipeline Name
            </Label>
            <Input
              id="pipeline-name"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., My Production Pipeline (optional)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repository" className="text-right">
              Repository
            </Label>
            <Popover open={repoComboboxOpen} onOpenChange={setRepoComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={repoComboboxOpen}
                  className="col-span-3 justify-between"
                  disabled={isLoadingRepos || isErrorRepos}
                >
                  {isLoadingRepos
                    ? 'Loading...'
                    : selectedRepoFullName
                      ? repositories.find((r) => r.full_name === selectedRepoFullName)?.full_name
                      : 'Select repository...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0 pointer-events-auto">
                <Command>
                  <CommandInput placeholder="Search repository..." />
                  <CommandList className="max-h-[200px] overscroll-contain">
                    <CommandEmpty>
                      {isLoadingRepos
                        ? 'Loading...'
                        : isErrorRepos
                          ? 'Error loading.'
                          : 'No repository found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {repositories.map((r) => (
                        <CommandItem
                          key={r.full_name}
                          value={r.full_name}
                          onSelect={(currentValue) => {
                            setSelectedRepoFullName(
                              currentValue === selectedRepoFullName ? undefined : currentValue,
                            );
                            setRepoComboboxOpen(false);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                            }
                          }}
                        >
                          <CheckIcon
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedRepoFullName === r.full_name ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          <Github size={14} className="mr-2" />
                          {r.full_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedRepoFullName && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Branches</Label>
              <div className="col-span-3">
                {isLoadingBranches ? (
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                    <BranchListSkeleton />
                  </ScrollArea>
                ) : isErrorBranches ? (
                  <p className="text-destructive text-sm">Error loading branches.</p>
                ) : safeBranches.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No branches found for this repository.
                  </p>
                ) : (
                  <ScrollArea className="h-40 w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {safeBranches.map((branch) => (
                        <div key={branch.name} className="flex items-center space-x-2">
                          <Checkbox
                            id={`branch-${branch.name}`}
                            checked={selectedBranches.includes(branch.name)}
                            onCheckedChange={() => handleBranchToggle(branch.name)}
                            disabled={saveMutation.isPending}
                          />
                          <label
                            htmlFor={`branch-${branch.name}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {branch.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={saveMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedRepoFullName || saveMutation.isPending || isLoadingBranches}
          >
            {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
