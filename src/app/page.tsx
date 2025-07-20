"use client";

import { useState } from "react";
import AddCombatantForm from "@/components/AddCombatantForm";
import CombatantCard from "@/components/CombatantCard";
import { Combatant } from "@/types/combatant";

export default function CombatPage() {
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const addCombatant = (newC: Combatant) => {
    const updated = [...combatants, newC].sort((a, b) => b.initiative - a.initiative);
    setCombatants(updated);
  };

  const nextTurn = () => {
    setTurnIndex((prev) => (prev + 1) % combatants.length);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Combat Tracker</h1>
      <AddCombatantForm onAdd={addCombatant} />
      <div className="space-y-4">
        {combatants.map((c, idx) => (
          <CombatantCard key={c.id} combatant={c} isActive={idx === turnIndex} />
        ))}
      </div>
      {combatants.length > 0 && (
        <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded" onClick={nextTurn}>
          Next Turn
        </button>
      )}
    </div>
  );
}
