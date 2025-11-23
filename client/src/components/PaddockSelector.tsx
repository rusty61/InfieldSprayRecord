import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, MapPin, Navigation } from "lucide-react";
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
import type { Paddock } from "@shared/schema";

interface PaddockWithDistance extends Paddock {
  distance?: number;
}

interface PaddockSelectorProps {
  selectedIds: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function PaddockSelector({
  selectedIds,
  onSelectionChange,
}: PaddockSelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const queryKey = currentLocation
    ? [`/api/paddocks?lat=${currentLocation.lat}&lng=${currentLocation.lng}`]
    : ["/api/paddocks"];

  const { data: paddocks = [] } = useQuery<PaddockWithDistance[]>({
    queryKey,
  });

  useEffect(() => {
    if (open && !currentLocation && navigator.geolocation) {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsGettingLocation(false);
        },
        () => {
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 60000,
        }
      );
    }
  }, [open, currentLocation]);

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
            className="w-full justify-between h-12 text-[#fcb32c] bg-[#000000d4]"
            data-testid="button-select-paddocks"
          >
            <div className="flex items-center gap-2">
              {isGettingLocation ? (
                <Navigation className="w-4 h-4 text-muted-foreground animate-pulse" />
              ) : (
                <MapPin className="w-4 h-4 text-muted-foreground" />
              )}
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
                {isGettingLocation && (
                  <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                    Getting your location...
                  </div>
                )}
                {currentLocation && paddocks.length > 0 && (
                  <div className="px-2 py-1 text-xs text-muted-foreground border-b">
                    Sorted by distance from current location
                  </div>
                )}
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
                        {paddock.distance !== undefined && (
                          <> • {paddock.distance < 1 
                            ? `${(paddock.distance * 1000).toFixed(0)}m away`
                            : `${paddock.distance.toFixed(1)}km away`}</>
                        )}
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
