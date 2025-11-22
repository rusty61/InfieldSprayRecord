import { MapPin, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface GPSLocationProps {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  onCapture?: (lat: number, lng: number, accuracy: number) => void;
}

export function GPSLocation({ latitude, longitude, accuracy, onCapture }: GPSLocationProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = () => {
    setIsCapturing(true);
    // Simulate GPS capture
    setTimeout(() => {
      if (onCapture) {
        onCapture(-27.4698, 153.0251, 12); // todo: remove mock functionality
      }
      setIsCapturing(false);
    }, 1500);
  };

  return (
    <Card className="p-6" data-testid="card-gps">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold">GPS Location</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCapture}
          disabled={isCapturing}
          data-testid="button-capture-gps"
        >
          <Navigation className={`w-4 h-4 mr-2 ${isCapturing ? "animate-pulse" : ""}`} />
          {isCapturing ? "Capturing..." : "Update"}
        </Button>
      </div>

      {latitude && longitude ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Latitude</p>
              <p className="font-mono text-sm font-medium" data-testid="text-latitude">
                {latitude.toFixed(6)}°
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Longitude</p>
              <p className="font-mono text-sm font-medium" data-testid="text-longitude">
                {longitude.toFixed(6)}°
              </p>
            </div>
          </div>
          {accuracy && (
            <Badge variant="secondary" className="text-xs">
              Accuracy: ± {accuracy}m
            </Badge>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            No location captured yet
          </p>
        </div>
      )}
    </Card>
  );
}
