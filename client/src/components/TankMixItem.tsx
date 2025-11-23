import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TankMixItemProps {
  id: string;
  chemicalName: string;
  rate: number;
  unit: string;
  onRemove?: (id: string) => void;
  onUpdate?: (id: string, field: string, value: string | number) => void;
}

export function TankMixItem({
  id,
  chemicalName,
  rate,
  unit,
  onRemove,
  onUpdate,
}: TankMixItemProps) {
  return (
    <div
      className="border-l-4 border-l-primary rounded-lg p-4 space-y-3 bg-[#171616c7]"
      data-testid={`tank-mix-item-${id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Label htmlFor={`chemical-${id}`} className="text-sm font-medium">
            Chemical Name
          </Label>
          <Input
            id={`chemical-${id}`}
            value={chemicalName}
            onChange={(e) => onUpdate?.(id, "chemicalName", e.target.value)}
            placeholder="e.g., Glyphosate 540"
            className="mt-1.5 bg-[#fcb32c]"
            data-testid={`input-chemical-name-${id}`}
          />
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onRemove?.(id)}
          data-testid={`button-remove-${id}`}
          className="mt-6"
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`rate-${id}`} className="text-sm font-medium">
            Rate
          </Label>
          <Input
            id={`rate-${id}`}
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => onUpdate?.(id, "rate", parseFloat(e.target.value) || 0)}
            className="mt-1.5 text-right bg-[#000000b5]"
            data-testid={`input-rate-${id}`}
          />
        </div>
        <div>
          <Label htmlFor={`unit-${id}`} className="text-sm font-medium">
            Unit
          </Label>
          <Select
            value={unit}
            onValueChange={(value) => onUpdate?.(id, "unit", value)}
          >
            <SelectTrigger
              id={`unit-${id}`}
              className="mt-1.5 bg-[#fcb32c]"
              data-testid={`select-unit-${id}`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L/ha">L/ha</SelectItem>
              <SelectItem value="mL/ha">mL/ha</SelectItem>
              <SelectItem value="g/ha">g/ha</SelectItem>
              <SelectItem value="kg/ha">kg/ha</SelectItem>
              <SelectItem value="L/100L">L/100L</SelectItem>
              <SelectItem value="mL/100L">mL/100L</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
