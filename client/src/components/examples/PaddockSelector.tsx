import { PaddockSelector } from "../PaddockSelector";
import { useState } from "react";

export default function PaddockSelectorExample() {
  const [selected, setSelected] = useState<string[]>(["1"]);

  return (
    <div className="p-4">
      <PaddockSelector selectedIds={selected} onSelectionChange={setSelected} />
      <div className="mt-4 text-sm text-muted-foreground">
        Selected paddock IDs: {selected.join(", ") || "none"}
      </div>
    </div>
  );
}
