import { GPSLocation } from "../GPSLocation";

export default function GPSLocationExample() {
  return (
    <GPSLocation
      latitude={-27.4698}
      longitude={153.0251}
      accuracy={12}
      onCapture={(lat, lng, acc) =>
        console.log("GPS captured:", lat, lng, acc)
      }
    />
  );
}
