import { TankMixItem } from "../TankMixItem";

export default function TankMixItemExample() {
  return (
    <div className="space-y-3 p-4">
      <TankMixItem
        id="1"
        chemicalName="Glyphosate 540"
        rate={1.2}
        unit="L/ha"
        onRemove={(id) => console.log("Remove", id)}
        onUpdate={(id, field, value) =>
          console.log("Update", id, field, value)
        }
      />
    </div>
  );
}
