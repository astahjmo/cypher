import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { LabelPair } from '@/interfaces/containerConfig';

interface ContainerConfigLabelsProps {
  labels: LabelPair[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: keyof LabelPair, value: string) => void;
  disabled?: boolean;
}

export function ContainerConfigLabels({
  labels,
  onAdd,
  onRemove,
  onChange,
  disabled = false,
}: ContainerConfigLabelsProps) {
  return (
    <div className="space-y-2">
      <Label className="text-lg font-medium">Labels</Label>
      <p className="text-sm text-muted-foreground">Add metadata labels to the container.</p>
      {labels.map((label, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={label.key}
            onChange={(e) => onChange(index, 'key', e.target.value)}
            placeholder="label.key"
            className="w-1/3"
            disabled={disabled}
          />
          <span className="text-muted-foreground">=</span>
          <Input
            value={label.value}
            onChange={(e) => onChange(index, 'value', e.target.value)}
            placeholder="label_value"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(index)}
            className="text-muted-foreground hover:text-destructive"
            disabled={disabled}
            aria-label={`Remove label ${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} disabled={disabled}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Label
      </Button>
    </div>
  );
}
