import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { VolumeMapping } from '@/interfaces/containerConfig';

interface ContainerConfigVolumesProps {
  volumes: VolumeMapping[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof VolumeMapping, value: string) => void;
  disabled?: boolean;
}

export function ContainerConfigVolumes({
  volumes,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
}: ContainerConfigVolumesProps) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Volumes</Label>
      <p className="text-sm text-muted-foreground">Map host paths to container paths.</p>
      {volumes.map((volume, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={volume.host_path}
            onChange={(e) => onChange(index, 'host_path', e.target.value)}
            placeholder="/host/path"
            className="flex-1"
            disabled={disabled}
          />
          <span className="text-muted-foreground">:</span>
          <Input
            value={volume.container_path}
            onChange={(e) => onChange(index, 'container_path', e.target.value)}
            placeholder="/container/path"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive"
            disabled={disabled}
            aria-label={`Remove volume mapping ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Volume
      </Button>
    </div>
  );
}
