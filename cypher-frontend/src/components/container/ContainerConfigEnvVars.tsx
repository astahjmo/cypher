import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { EnvironmentVariable } from '@/interfaces/containerConfig';

interface ContainerConfigEnvVarsProps {
  envVars: EnvironmentVariable[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof EnvironmentVariable, value: string) => void;
  disabled?: boolean;
}

export function ContainerConfigEnvVars({
  envVars,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
}: ContainerConfigEnvVarsProps) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Environment Variables</Label>
      <p className="text-sm text-muted-foreground">Set environment variables for the container.</p>
      {envVars.map((envVar, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={envVar.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="VARIABLE_NAME"
            className="w-1/3"
            disabled={disabled}
          />
          <span className="text-muted-foreground">=</span>
          <Input
            value={envVar.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
            placeholder="value"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive"
            disabled={disabled}
            aria-label={`Remove environment variable ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Variable
      </Button>
    </div>
  );
}
