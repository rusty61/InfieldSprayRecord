import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { Paddock, InsertApplication } from "@shared/schema";

export default function NewApplication() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [operator, setOperator] = useState("");
  const [farm, setFarm] = useState("");
  const [applicationDate, setApplicationDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  
  // todo: remove mock functionality
  const [weatherData, setWeatherData] = useState({
    windSpeed: 2.5,
    windDirection: 135,
    temperature: 24.5,
    humidity: 65,
    timestamp: new Date(),
  });

  const [gpsData, setGpsData] = useState<{
    latitude?: number;
    longitude?: number;
    accuracy?: number;
  }>({});

  const [tankMix, setTankMix] = useState({
    name: "",
    waterRate: 100,
    items: [
      { id: "1", chemicalName: "", rate: 0, unit: "L/ha" },
    ],
  });

  const [selectedPaddocks, setSelectedPaddocks] = useState<string[]>([]);

  const { data: paddocks = [] } = useQuery<Paddock[]>({
    queryKey: ["/api/paddocks"],
  });

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

  const createApplicationMutation = useMutation({
    mutationFn: async (data: InsertApplication) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create application");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application Recorded",
        description: "Spray application has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!operator || !farm || selectedPaddocks.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in operator, farm, and select at least one paddock.",
        variant: "destructive",
      });
      return;
    }

    const applicationData: InsertApplication = {
      paddockId: selectedPaddocks[0], // For now, use first selected paddock
      operator,
      farm,
      applicationDate: new Date(applicationDate),
      chemicals: tankMix.items
        .filter((item) => item.chemicalName)
        .map((item) => ({
          name: item.chemicalName,
          rate: item.rate,
          unit: item.unit,
        })),
      waterRate: tankMix.waterRate,
      area: totalArea,
      windSpeed: weatherData.windSpeed,
      windDirection: weatherData.windDirection,
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      latitude: gpsData.latitude,
      longitude: gpsData.longitude,
    };

    createApplicationMutation.mutate(applicationData);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <AppHeader title="New Application" />
      <main className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto text-[#fcb32c] bg-[#000000]">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Create Application Record</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to record a new spray application
          </p>
        </div>

        <Card className="p-6 space-y-4 text-[#fcb32c]">
          <div>
            <Label htmlFor="operator" className="text-sm font-medium">
              Operator Name
            </Label>
            <Input
              id="operator"
              placeholder="John Davis"
              className="mt-1.5 bg-[#121212db]"
              data-testid="input-operator"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="farm" className="text-sm font-medium">
              Farm Name
            </Label>
            <Input
              id="farm"
              placeholder="Riverside Farm"
              className="mt-1.5 bg-[#121111e6]"
              data-testid="input-farm"
              value={farm}
              onChange={(e) => setFarm(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-sm font-medium">
              Application Date & Time
            </Label>
            <Input
              id="date"
              type="datetime-local"
              className="mt-1.5 bg-[#1a1a1a]"
              data-testid="input-datetime"
              value={applicationDate}
              onChange={(e) => setApplicationDate(e.target.value)}
            />
          </div>
        </Card>

        <div>
          <Label className="text-sm font-medium mb-3 block text-[#fcb32c]">Select Paddocks</Label>
          <PaddockSelector
            selectedIds={selectedPaddocks}
            onSelectionChange={setSelectedPaddocks}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between text-[#fcb32c]">
            <h3 className="text-lg font-semibold">Tank Mix</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={addChemical}
              data-testid="button-add-chemical"
              className="text-[#fc0000]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Chemical
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="w-1/4 text-[#fcb32c]">
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
                className="mt-1.5 text-right bg-[#000000]"
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
            <Card className="p-4 bg-accent/50 text-[#fcb32c]">
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
            className="flex-1 bg-[#093d2b] text-[#fcb32c]"
            data-testid="button-save-application"
            disabled={createApplicationMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {createApplicationMutation.isPending ? "Saving..." : "Save Application"}
          </Button>
        </div>
      </main>
    </div>
  );
}
