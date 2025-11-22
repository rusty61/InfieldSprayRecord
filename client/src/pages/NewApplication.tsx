import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { WeatherCard } from "@/components/WeatherCard";
import { GPSLocation } from "@/components/GPSLocation";
import { TankMixItem } from "@/components/TankMixItem";
import { PaddockSelector } from "@/components/PaddockSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Plus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function NewApplication() {
  const { toast } = useToast();
  
  // todo: remove mock functionality
  const [weatherData, setWeatherData] = useState({
    windSpeed: 2.5,
    windDirection: 135,
    temperature: 24.5,
    humidity: 65,
    timestamp: new Date(),
  });

  const [gpsData, setGpsData] = useState({
    latitude: -27.4698,
    longitude: 153.0251,
    accuracy: 12,
  });

  const [tankMix, setTankMix] = useState({
    name: "",
    waterRate: 100,
    items: [
      { id: "1", chemicalName: "", rate: 0, unit: "L/ha" },
    ],
  });

  const [selectedPaddocks, setSelectedPaddocks] = useState<string[]>([]);

  const paddocks = [
    { id: "1", name: "North Field 5", area: 12.5, farm: "Riverside Farm" },
    { id: "2", name: "South Block A", area: 8.3, farm: "Riverside Farm" },
    { id: "3", name: "East Paddock 12", area: 15.2, farm: "Hillside Farm" },
    { id: "4", name: "West Section 3", area: 6.8, farm: "Hillside Farm" },
  ];

  const selectedPaddocksList = paddocks.filter((p) =>
    selectedPaddocks.includes(p.id)
  );
  const totalArea = selectedPaddocksList.reduce((sum, p) => sum + p.area, 0);
  const totalWater = totalArea * tankMix.waterRate;

  const addChemical = () => {
    setTankMix({
      ...tankMix,
      items: [
        ...tankMix.items,
        { id: Date.now().toString(), chemicalName: "", rate: 0, unit: "L/ha" },
      ],
    });
  };

  const removeChemical = (id: string) => {
    setTankMix({
      ...tankMix,
      items: tankMix.items.filter((item) => item.id !== id),
    });
  };

  const updateChemical = (id: string, field: string, value: string | number) => {
    setTankMix({
      ...tankMix,
      items: tankMix.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const handleSubmit = () => {
    console.log("Application submitted", {
      tankMix,
      selectedPaddocks,
      weatherData,
      gpsData,
    });
    toast({
      title: "Application Recorded",
      description: "Spray application has been saved successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <AppHeader title="New Application" />

      <main className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Create Application Record</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to record a new spray application
          </p>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <Label htmlFor="operator" className="text-sm font-medium">
              Operator Name
            </Label>
            <Input
              id="operator"
              placeholder="John Davis"
              className="mt-1.5"
              data-testid="input-operator"
            />
          </div>

          <div>
            <Label htmlFor="farm" className="text-sm font-medium">
              Farm Name
            </Label>
            <Input
              id="farm"
              placeholder="Riverside Farm"
              className="mt-1.5"
              data-testid="input-farm"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium">
              Application Date & Time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              className="mt-1.5"
              data-testid="input-datetime"
              defaultValue={new Date().toISOString().slice(0, 16)}
            />
          </div>
        </Card>

        <div>
          <Label className="text-sm font-medium mb-3 block">Select Paddocks</Label>
          <PaddockSelector
            paddocks={paddocks}
            selectedIds={selectedPaddocks}
            onSelectionChange={setSelectedPaddocks}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tank Mix</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addChemical}
              data-testid="button-add-chemical"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chemical
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="w-1/4">
              <Label htmlFor="water-rate" className="text-sm font-medium">
                Water Rate (L/ha)
              </Label>
              <Input
                id="water-rate"
                type="number"
                step="10"
                value={tankMix.waterRate}
                onChange={(e) =>
                  setTankMix({ ...tankMix, waterRate: parseFloat(e.target.value) || 0 })
                }
                className="mt-1.5 text-right"
                data-testid="input-water-rate"
              />
            </div>

            <div className="w-3/4 space-y-3">
              {tankMix.items.map((item) => (
                <TankMixItem
                  key={item.id}
                  {...item}
                  onRemove={removeChemical}
                  onUpdate={updateChemical}
                />
              ))}
            </div>
          </div>

          {selectedPaddocks.length > 0 && (
            <Card className="p-4 bg-accent/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Water</p>
                  <p className="text-xl font-semibold" data-testid="text-total-water">
                    {totalWater.toFixed(1)} L
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Area</p>
                  <p className="text-xl font-semibold" data-testid="text-total-area">
                    {totalArea.toFixed(1)} ha
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <Separator />

        <div className="grid md:grid-cols-2 gap-6">
          <WeatherCard
            data={weatherData}
            onRefresh={() => {
              setWeatherData({ ...weatherData, timestamp: new Date() });
              console.log("Refreshing weather data");
            }}
          />
          <GPSLocation
            {...gpsData}
            onCapture={(lat, lng, accuracy) => {
              setGpsData({ latitude: lat, longitude: lng, accuracy });
              console.log("GPS captured:", lat, lng, accuracy);
            }}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            className="flex-1"
            data-testid="button-save-application"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Application
          </Button>
        </div>
      </main>
    </div>
  );
}
