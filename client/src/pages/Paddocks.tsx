import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MapPin, Trash2, Navigation, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Paddock } from "@shared/schema";

interface GPSPoint {
  latitude: number;
  longitude: number;
}

export default function Paddocks() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newPaddock, setNewPaddock] = useState({
    name: "",
    farm: "",
    area: 0,
  });
  const [boundaryPoints, setBoundaryPoints] = useState<GPSPoint[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  const { data: paddocks = [], isLoading } = useQuery<Paddock[]>({
    queryKey: ["/api/paddocks"],
  });

  const createMutation = useMutation({
    mutationFn: async (paddock: any) => {
      return apiRequest("POST", "/api/paddocks", paddock);
    },
    onSuccess: () => {
      // Invalidate all paddock queries (including proximity-specific ones)
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/paddocks');
        }
      });
      setIsCreating(false);
      setBoundaryPoints([]);
      setNewPaddock({ name: "", farm: "", area: 0 });
      toast({
        title: "Paddock created",
        description: "Your paddock has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create paddock. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/paddocks/${id}`);
    },
    onSuccess: () => {
      // Invalidate all paddock queries (including proximity-specific ones)
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/paddocks');
        }
      });
      toast({
        title: "Paddock deleted",
        description: "The paddock has been removed.",
      });
    },
  });

  const captureGPSPoint = () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not available",
        description: "Your device doesn't support GPS.",
        variant: "destructive",
      });
      return;
    }

    setIsCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setBoundaryPoints([...boundaryPoints, { latitude, longitude }]);
        setIsCapturing(false);
        toast({
          title: "Point captured",
          description: `Point ${boundaryPoints.length + 1} logged at ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        console.error("Error getting location:", error.message);
        setIsCapturing(false);
        toast({
          title: "GPS error",
          description: "Failed to capture GPS location. Please try again.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const calculateCenterPoint = (points: GPSPoint[]): { lat: number; lng: number } => {
    const sum = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.latitude,
        lng: acc.lng + point.longitude,
      }),
      { lat: 0, lng: 0 }
    );
    return {
      lat: sum.lat / points.length,
      lng: sum.lng / points.length,
    };
  };

  const handleCreatePaddock = () => {
    if (!newPaddock.name || !newPaddock.farm || boundaryPoints.length < 3) {
      toast({
        title: "Invalid data",
        description: "Please enter paddock details and capture at least 3 boundary points.",
        variant: "destructive",
      });
      return;
    }

    const center = calculateCenterPoint(boundaryPoints);
    const paddockData = {
      ...newPaddock,
      boundaryCoordinates: boundaryPoints,
      centerLatitude: center.lat,
      centerLongitude: center.lng,
    };

    createMutation.mutate(paddockData);
  };

  const removeBoundaryPoint = (index: number) => {
    setBoundaryPoints(boundaryPoints.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <header className="bg-primary text-primary-foreground p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Paddock Management</h1>
          <p className="text-sm opacity-90 mt-1">Manage your farm paddocks and GPS boundaries</p>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Paddocks ({paddocks.length})</h2>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-paddock">
                <Plus className="w-4 h-4 mr-2" />
                Create Paddock
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Paddock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="paddock-name">Paddock Name</Label>
                  <Input
                    id="paddock-name"
                    value={newPaddock.name}
                    onChange={(e) => setNewPaddock({ ...newPaddock, name: e.target.value })}
                    placeholder="e.g. North Field 5"
                    className="mt-1.5"
                    data-testid="input-paddock-name"
                  />
                </div>

                <div>
                  <Label htmlFor="farm-name">Farm Name</Label>
                  <Input
                    id="farm-name"
                    value={newPaddock.farm}
                    onChange={(e) => setNewPaddock({ ...newPaddock, farm: e.target.value })}
                    placeholder="e.g. Riverside Farm"
                    className="mt-1.5"
                    data-testid="input-farm-name"
                  />
                </div>

                <div>
                  <Label htmlFor="paddock-area">Area (hectares)</Label>
                  <Input
                    id="paddock-area"
                    type="number"
                    step="0.1"
                    value={newPaddock.area || ""}
                    onChange={(e) => setNewPaddock({ ...newPaddock, area: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 12.5"
                    className="mt-1.5"
                    data-testid="input-paddock-area"
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>GPS Boundary Points ({boundaryPoints.length})</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={captureGPSPoint}
                      disabled={isCapturing}
                      data-testid="button-capture-gps"
                    >
                      {isCapturing ? (
                        <>Capturing...</>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4 mr-2" />
                          Capture Point
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {boundaryPoints.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {boundaryPoints.map((point, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-accent/50 rounded-md text-sm"
                          data-testid={`gps-point-${index}`}
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                            <span>
                              Point {index + 1}: {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBoundaryPoint(index)}
                            data-testid={`button-remove-point-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Walk around the paddock perimeter and capture GPS points at each corner (minimum 3 points)
                    </p>
                  )}

                  {boundaryPoints.length > 0 && boundaryPoints.length < 3 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Capture at least {3 - boundaryPoints.length} more point{3 - boundaryPoints.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleCreatePaddock}
                  className="w-full"
                  disabled={createMutation.isPending || boundaryPoints.length < 3}
                  data-testid="button-save-paddock"
                >
                  {createMutation.isPending ? "Saving..." : "Save Paddock"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading paddocks...</div>
        ) : paddocks.length === 0 ? (
          <Card className="p-8 text-center text-[#fcb32c]">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No paddocks yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first paddock to start tracking spray applications
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {paddocks.map((paddock) => (
              <Card key={paddock.id} className="p-4 text-[#fcb32c]" data-testid={`paddock-card-${paddock.id}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{paddock.name}</h3>
                      <Badge variant="secondary">{paddock.area} ha</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{paddock.farm}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {paddock.boundaryCoordinates.length} boundary points • Center: {paddock.centerLatitude.toFixed(4)}, {paddock.centerLongitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(paddock.id)}
                    disabled={deleteMutation.isPending}
                    data-testid={`button-delete-${paddock.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
