import { WeatherCard } from "../WeatherCard";

export default function WeatherCardExample() {
  const mockData = {
    windSpeed: 2.5,
    windDirection: 135,
    temperature: 24.5,
    humidity: 65,
    timestamp: new Date(),
  };

  return (
    <WeatherCard
      data={mockData}
      onRefresh={() => console.log("Refresh clicked")}
    />
  );
}
