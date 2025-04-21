import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FocusScope } from '@radix-ui/react-focus-scope';
import { DismissableLayer } from '@radix-ui/react-dismissable-layer';
import { PortMapping, DockerNetwork } from '@/interfaces/containerConfig';

const standardNetworkModes = [
  { value: 'bridge', label: 'Bridge (Default)' },
  { value: 'host', label: 'Host' },
  { value: 'none', label: 'None' },
];

interface ContainerConfigNetworkProps {
  networkMode?: string | null;
  portMappings: PortMapping[];
  dockerNetworks: DockerNetwork[];
  isLoadingNetworks: boolean;
  onNetworkModeChange: (value: string) => void;
  onAddPortMapping: () => void;
  onRemovePortMapping: (index: number) => void;
  onPortMappingChange: (
    index: number,
    field: keyof PortMapping,
    value: string | number | null,
  ) => void;
  disabled?: boolean;
}

export function ContainerConfigNetwork({
  networkMode,
  portMappings,
  dockerNetworks,
  isLoadingNetworks,
  onNetworkModeChange,
  onAddPortMapping,
  onRemovePortMapping,
  onPortMappingChange,
  disabled = false,
}: ContainerConfigNetworkProps) {
  const [networkComboboxOpen, setNetworkComboboxOpen] = useState(false);

  const networkOptions = [
    ...standardNetworkModes,
    ...dockerNetworks.map((net) => ({ value: net.name, label: `${net.name} (${net.driver})` })),
  ];

  return (
    <div className="space-y-4">
      <Label className="text-lg font-medium">Network</Label>
      <div className="grid grid-cols-3 items-center gap-4">
        <Label htmlFor="network-mode" className="text-right">
          Mode
        </Label>
        <Popover open={networkComboboxOpen} onOpenChange={setNetworkComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={networkComboboxOpen}
              className="col-span-2 justify-between"
              disabled={isLoadingNetworks || disabled}
            >
              {isLoadingNetworks
                ? 'Loading networks...'
                : networkMode
                  ? (networkOptions.find((opt) => opt.value === networkMode)?.label ?? networkMode)
                  : 'Select network...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[--radix-popover-trigger-width] p-0 z-50"
            align="start"
            sideOffset={5}
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if ((e.target as HTMLElement)?.closest('[aria-expanded="true"]')) {
                e.preventDefault();
              }
            }}
          >
            <FocusScope asChild loop trapped>
              <DismissableLayer asChild>
                <Command>
                  <CommandInput placeholder="Search network or mode..." />
                  <CommandList className="max-h-72 overflow-y-auto">
                    <CommandEmpty>No network found.</CommandEmpty>
                    <CommandGroup heading="Standard Modes">
                      {standardNetworkModes.map((mode) => (
                        <CommandItem
                          key={mode.value}
                          value={mode.value}
                          onSelect={() => {
                            onNetworkModeChange(mode.value);
                            setNetworkComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              networkMode === mode.value ? 'opacity-100' : 'opacity-0',
                            )}
                          />
                          {mode.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {dockerNetworks.length > 0 && (
                      <CommandGroup heading="Available Networks">
                        {dockerNetworks.map((network) => (
                          <CommandItem
                            key={network.id}
                            value={network.name}
                            onSelect={() => {
                              onNetworkModeChange(network.name);
                              setNetworkComboboxOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                networkMode === network.name ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {network.name}{' '}
                            <span className="text-xs text-muted-foreground ml-2">
                              ({network.driver})
                            </span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </DismissableLayer>
            </FocusScope>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label className="text-sm font-medium">Port Mappings</Label>
        <p className="text-xs text-muted-foreground mb-2">Map container ports to host ports.</p>
        {portMappings.map((portMap, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              type="number"
              value={portMap.container_port}
              onChange={(e) => onPortMappingChange(index, 'container_port', e.target.value)}
              placeholder="Container Port"
              className="w-1/4"
              disabled={disabled}
              min="1"
              max="65535"
            />
            <Select
              value={portMap.protocol}
              onValueChange={(value: 'tcp' | 'udp') =>
                onPortMappingChange(index, 'protocol', value)
              }
              disabled={disabled}
            >
              <SelectTrigger className="w-[70px]">
                {' '}
                <SelectValue />{' '}
              </SelectTrigger>
              <SelectContent>
                {' '}
                <SelectItem value="tcp">TCP</SelectItem>{' '}
                <SelectItem value="udp">UDP</SelectItem>{' '}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Input
              type="number"
              value={portMap.host_port ?? ''}
              onChange={(e) => onPortMappingChange(index, 'host_port', e.target.value)}
              placeholder="Host Port (Optional)"
              className="w-1/3"
              disabled={disabled}
              min="1"
              max="65535"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemovePortMapping(index)}
              className="text-muted-foreground hover:text-destructive"
              disabled={disabled}
              aria-label={`Remove port mapping ${index + 1}`}
            >
              {' '}
              <Trash2 className="h-4 w-4" />{' '}
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddPortMapping} disabled={disabled}>
          {' '}
          <PlusCircle className="mr-2 h-4 w-4" /> Add Port Mapping{' '}
        </Button>
      </div>
    </div>
  );
}
