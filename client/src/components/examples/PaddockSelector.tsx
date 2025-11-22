import { PaddockSelector } from "../PaddockSelector";
import { useState } from "react";

export default function PaddockSelectorExample() {
  const [selected, setSelected] = useState<string[]>(["1"]);

  const paddocks = [
    { id: "1", name: "North Field 5", area: 12.5, farm: "Riverside Farm" },
    { id: "2", name: "South Block A", area: 8.3, farm: "Riverside Farm" },
    { id: "3", name: "East Paddock 12", area: 15.2, farm: "Hillside Farm" },
  ];

  return (
    <div className="p-4">
      <PaddockSelector
        paddocks={paddocks}
        selectedIds={selected}
        onSelectionChange={setSelected}
      />
    </div>
  );
}
