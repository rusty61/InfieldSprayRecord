import { useState } from "react";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Paddock {
  id: string;
  name: string;
  area: number;
  farm: string;
}

interface PaddockSelectorProps {
  paddocks: Paddock[];
  selectedIds: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function PaddockSelector({
  paddocks,
  selectedIds,
  onSelectionChange,
}: PaddockSelectorProps) {
  const [open, setOpen] = useState(false);

  const togglePaddock = (paddockId: string) => {
    const newSelection = selectedIds.includes(paddockId)
      ? selectedIds.filter((id) => id !== paddockId)
      : [...selectedIds, paddockId];
    onSelectionChange?.(newSelection);
  };

  const selectedPaddocks = paddocks.filter((p) => selectedIds.includes(p.id));
  const totalArea = selectedPaddocks.reduce((sum, p) => sum + p.area, 0);

  return (
    <div className="space-y-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-12"
            data-testid="button-select-paddocks"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>
                {selectedIds.length === 0
                  ? "Select paddocks"
                  : `${selectedIds.length} paddock${selectedIds.length > 1 ? "s" : ""} selected`}
              </span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search paddocks..." />
            <CommandList>
              <CommandEmpty>No paddock found.</CommandEmpty>
              <CommandGroup>
                {paddocks.map((paddock) => (
                  <CommandItem
                    key={paddock.id}
                    onSelect={() => togglePaddock(paddock.id)}
                    data-testid={`paddock-option-${paddock.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.includes(paddock.id)
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{paddock.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {paddock.farm} • {paddock.area} ha
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedPaddocks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPaddocks.map((paddock) => (
            <Badge
              key={paddock.id}
              variant="secondary"
              className="gap-1"
              data-testid={`badge-paddock-${paddock.id}`}
            >
              {paddock.name} ({paddock.area} ha)
            </Badge>
          ))}
          <Badge variant="outline" className="font-semibold" data-testid="badge-total-area">
            Total: {totalArea.toFixed(1)} ha
          </Badge>
        </div>
      )}
    </div>
  );
}
