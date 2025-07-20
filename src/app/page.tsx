"use client";

import { useState } from "react";
import AddCombatantForm from "@/components/AddCombatantForm";
import CombatantCard from "@/components/CombatantCard";
import { Combatant } from "@/types/combatant";

export default function CombatPage() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const addCombatant = (newC: Combatant) => {
    const updated = [...combatants, newC].sort(
      (a, b) => b.initiative - a.initiative
    );
    setCombatants(updated);
  };

  const nextTurn = () => {
    setTurnIndex((prev) => (prev + 1) % combatants.length);
  };

  const updateCombatant = (updated: Combatant) => {
  setCombatants((prev) =>
    prev.map((c) => (c.id === updated.id ? updated : c))
  );
};
const removeCombatant = (id: string) => {
  setCombatants((prev) => prev.filter((c) => c.id !== id));
};


  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen overflow-y-auto w-full md:w-1/3 lg:w-1/4 p-4 border-r border-gray-700 bg-gray-900">
        <AddCombatantForm onAdd={addCombatant} />
        {combatants.length > 0 && (
          <button
            className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition duration-150"
            onClick={nextTurn}
          >
            Next Turn
          </button>
        )}
      </aside>

      {/* Main Combat Area */}
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Initiative Order</h1>

        {combatants.length === 0 && (
          <p className="text-gray-400">No combatants yet. Add some on the left!</p>
        )}

        <div className="space-y-3">
          {combatants.map((c, idx) => (
  <CombatantCard
    key={c.id}
    combatant={c}
    isActive={idx === turnIndex}
    onUpdate={updateCombatant}
    onRemove={removeCombatant} // <--- ✅ Add this
  />
))}

        </div>

        
      </main>
    </div>
  );
}
