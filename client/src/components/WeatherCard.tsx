import { Wind, Compass, Thermometer, Droplets, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeatherData {
  windSpeed: number;
  windDirection: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
}

interface WeatherCardProps {
  data: WeatherData;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function WeatherCard({ data, onRefresh, isLoading }: WeatherCardProps) {
  const windSpeedKmh = (data.windSpeed * 3.6).toFixed(1);
  const isWindCompliant = data.windSpeed >= 0.83 && data.windSpeed <= 4.17; // 3-15 km/h

  return (
    <Card className="p-6" data-testid="card-weather">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Weather Conditions</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRefresh}
          disabled={isLoading}
          data-testid="button-refresh-weather"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wind className="w-4 h-4" />
            <span className="text-sm">Wind Speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" data-testid="text-wind-speed">
              {windSpeedKmh}
            </span>
            <span className="text-sm text-muted-foreground">km/h</span>
            {!isWindCompliant && (
              <Badge variant="destructive" className="text-xs">
                !
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="w-4 h-4" />
            <span className="text-sm">Direction</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" data-testid="text-wind-direction">
              {data.windDirection}°
            </span>
            <span className="text-sm text-muted-foreground">
              {getWindDirection(data.windDirection)}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Thermometer className="w-4 h-4" />
            <span className="text-sm">Temperature</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" data-testid="text-temperature">
              {data.temperature.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">°C</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Droplets className="w-4 h-4" />
            <span className="text-sm">Humidity</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold" data-testid="text-humidity">
              {data.humidity}
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground" data-testid="text-weather-timestamp">
          Last updated: {data.timestamp.toLocaleTimeString("en-AU", { 
            timeZone: "Australia/Sydney",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>
      </div>
    </Card>
  );
}

function getWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}
