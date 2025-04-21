import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  VolumeMapping,
  EnvironmentVariable,
  LabelPair,
  PortMapping,
  DockerNetwork,
  ContainerRuntimeConfig,
} from '@/interfaces/containerConfig';
import { ContainerConfigVolumes } from './ContainerConfigVolumes';
import { ContainerConfigEnvVars } from './ContainerConfigEnvVars';
import { ContainerConfigLabels } from './ContainerConfigLabels';
import { ContainerConfigNetwork } from './ContainerConfigNetwork';
import {
  fetchContainerConfig,
  fetchDockerNetworks,
  saveContainerConfig,
} from '@/services/api/containerService';

interface ContainerConfigModalProps {
  repoFullName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultContainerConfig: Omit<
  ContainerRuntimeConfig,
  'repo_full_name' | 'id' | 'user_id' | 'created_at' | 'updated_at'
> = {
  scaling: 1,
  volumes: [],
  environment_variables: [],
  labels: [],
  network_mode: 'bridge',
  port_mappings: [],
};

export function ContainerConfigModal({
  repoFullName,
  open,
  onOpenChange,
}: ContainerConfigModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [config, setConfig] =
    useState<
      Omit<
        ContainerRuntimeConfig,
        'repo_full_name' | 'id' | 'user_id' | 'created_at' | 'updated_at'
      >
    >(defaultContainerConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [dockerNetworks, setDockerNetworks] = useState<DockerNetwork[]>([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(false);

  const [repoOwner, repoName] = repoFullName.split('/');

  const fetchConfigAndNetworks = useCallback(async () => {
    if (!open || !repoOwner || !repoName || !user) {
      if (!open || !user) {
        setConfig(defaultContainerConfig);
        setDockerNetworks([]);
        setFetchError(null);
      }
      return;
    }

    setIsLoading(true);
    setIsLoadingNetworks(true);
    setFetchError(null);
    console.log(`Fetching config and networks for ${repoFullName}`);

    try {
      const [fetchedConfig, fetchedNetworks] = await Promise.all([
        fetchContainerConfig(repoOwner, repoName),
        fetchDockerNetworks(),
      ]);

      if (fetchedConfig) {
        console.log('Fetched config:', fetchedConfig);
        setConfig({
          scaling: fetchedConfig.scaling ?? defaultContainerConfig.scaling,
          volumes: fetchedConfig.volumes ?? defaultContainerConfig.volumes,
          environment_variables:
            fetchedConfig.environment_variables ?? defaultContainerConfig.environment_variables,
          labels: fetchedConfig.labels ?? defaultContainerConfig.labels,
          network_mode: fetchedConfig.network_mode ?? defaultContainerConfig.network_mode,
          port_mappings: fetchedConfig.port_mappings ?? defaultContainerConfig.port_mappings,
        });
      } else {
        console.log('No existing config found, using defaults.');
        setConfig(defaultContainerConfig);
      }

      setDockerNetworks(fetchedNetworks);
      console.log('Fetched networks:', fetchedNetworks);
    } catch (error) {
      console.error('Failed to fetch container config or networks:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setFetchError(errorMessage);
      toast({ title: 'Fetch Failed', description: errorMessage, variant: 'destructive' });
      setConfig(defaultContainerConfig);
      setDockerNetworks([]);
    } finally {
      setIsLoading(false);
      setIsLoadingNetworks(false);
    }
  }, [open, repoFullName, repoOwner, repoName, toast, user]);

  useEffect(() => {
    fetchConfigAndNetworks();
  }, [fetchConfigAndNetworks]);

  const handleScalingChange = (value: string) => {
    const num = parseInt(value, 10);
    setConfig((prev) => ({ ...prev, scaling: isNaN(num) || num < 0 ? 0 : num }));
  };

  const handleAddVolume = () =>
    setConfig((prev) => ({
      ...prev,
      volumes: [...prev.volumes, { host_path: '', container_path: '' }],
    }));
  const handleRemoveVolume = (index: number) =>
    setConfig((prev) => ({ ...prev, volumes: prev.volumes.filter((_, i) => i !== index) }));
  const handleVolumeChange = (index: number, field: keyof VolumeMapping, value: string) => {
    setConfig((prev) => {
      const newVolumes = [...prev.volumes];
      newVolumes[index] = { ...newVolumes[index], [field]: value };
      return { ...prev, volumes: newVolumes };
    });
  };

  const handleAddEnvVar = () =>
    setConfig((prev) => ({
      ...prev,
      environment_variables: [...prev.environment_variables, { name: '', value: '' }],
    }));
  const handleRemoveEnvVar = (index: number) =>
    setConfig((prev) => ({
      ...prev,
      environment_variables: prev.environment_variables.filter((_, i) => i !== index),
    }));
  const handleEnvVarChange = (index: number, field: keyof EnvironmentVariable, value: string) => {
    setConfig((prev) => {
      const newEnvVars = [...prev.environment_variables];
      newEnvVars[index] = { ...newEnvVars[index], [field]: value };
      return { ...prev, environment_variables: newEnvVars };
    });
  };

  const handleAddLabel = () =>
    setConfig((prev) => ({ ...prev, labels: [...prev.labels, { key: '', value: '' }] }));
  const handleRemoveLabel = (index: number) =>
    setConfig((prev) => ({ ...prev, labels: prev.labels.filter((_, i) => i !== index) }));
  const handleLabelChange = (index: number, field: keyof LabelPair, value: string) => {
    setConfig((prev) => {
      const newLabels = [...prev.labels];
      newLabels[index] = { ...newLabels[index], [field]: value };
      return { ...prev, labels: newLabels };
    });
  };

  const handleNetworkModeChange = (value: string) => {
    setConfig((prev) => ({ ...prev, network_mode: value }));
  };

  const handleAddPortMapping = () =>
    setConfig((prev) => ({
      ...prev,
      port_mappings: [
        ...prev.port_mappings,
        { container_port: '', host_port: '', protocol: 'tcp' },
      ],
    }));
  const handleRemovePortMapping = (index: number) =>
    setConfig((prev) => ({
      ...prev,
      port_mappings: prev.port_mappings.filter((_, i) => i !== index),
    }));
  const handlePortMappingChange = (
    index: number,
    field: keyof PortMapping,
    value: string | number | null,
  ) => {
    setConfig((prev) => {
      const newPortMappings = [...prev.port_mappings];
      if (field === 'protocol' && (value === 'tcp' || value === 'udp')) {
        newPortMappings[index] = { ...newPortMappings[index], protocol: value };
      } else if (field !== 'protocol') {
        let processedValue: string | number | null = value;
        if (field === 'container_port' || (field === 'host_port' && value !== '')) {
          const num = parseInt(String(value), 10);
          processedValue = isNaN(num) ? '' : num;
        } else if (field === 'host_port' && value === '') {
          processedValue = null;
        }
        newPortMappings[index] = { ...newPortMappings[index], [field]: processedValue };
      }
      return { ...prev, port_mappings: newPortMappings };
    });
  };

  const handleSaveChanges = async () => {
    if (!repoOwner || !repoName || !user) {
      toast({
        title: 'Error',
        description: 'User or repository details are missing.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      const savedData = await saveContainerConfig(repoOwner, repoName, config);
      console.log('Saved config response:', savedData);
      toast({ title: 'Configuration Saved', description: `Settings for ${repoFullName} updated.` });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save container config:', error);
      toast({
        title: 'Save Failed',
        description: error instanceof Error ? error.message : 'Could not save configuration.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Container Configuration</DialogTitle>
          <DialogDescription>
            Configure runtime settings for containers of{' '}
            <span className="font-semibold">{repoFullName}</span>.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            {' '}
            <Spinner size="lg" />{' '}
          </div>
        ) : fetchError ? (
          <div className="text-destructive text-center p-4">
            {' '}
            Error loading configuration: {fetchError}{' '}
          </div>
        ) : (
          <div className="grid gap-6 pt-4 pb-6 max-h-[65vh] overflow-y-auto pr-3">
            <div className="space-y-2">
              <Label htmlFor="scaling" className="text-lg font-medium">
                Scaling
              </Label>
              <p className="text-sm text-muted-foreground">
                Set the desired number of running container instances.
              </p>
              <Input
                id="scaling"
                type="number"
                min="0"
                value={config.scaling}
                onChange={(e) => handleScalingChange(e.target.value)}
                className="w-24 ml-1"
                disabled={isSaving}
              />
            </div>

            <ContainerConfigNetwork
              networkMode={config.network_mode}
              portMappings={config.port_mappings}
              dockerNetworks={dockerNetworks}
              isLoadingNetworks={isLoadingNetworks}
              onNetworkModeChange={handleNetworkModeChange}
              onAddPortMapping={handleAddPortMapping}
              onRemovePortMapping={handleRemovePortMapping}
              onPortMappingChange={handlePortMappingChange}
              disabled={isSaving}
            />

            <ContainerConfigVolumes
              volumes={config.volumes}
              onAdd={handleAddVolume}
              onRemove={handleRemoveVolume}
              onChange={handleVolumeChange}
              disabled={isSaving}
            />

            <ContainerConfigEnvVars
              envVars={config.environment_variables}
              onAdd={handleAddEnvVar}
              onRemove={handleRemoveEnvVar}
              onChange={handleEnvVarChange}
              disabled={isSaving}
            />

            <ContainerConfigLabels
              labels={config.labels}
              onAdd={handleAddLabel}
              onRemove={handleRemoveLabel}
              onChange={handleLabelChange}
              disabled={isSaving}
            />
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving || isLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaving || isLoading || !!fetchError}>
            {' '}
            {isSaving ? <Spinner size="sm" className="mr-2" /> : null} Save Changes{' '}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
