"use client";

import { useState } from "react";
import AddCombatantForm from "@/components/AddCombatantForm";
import CombatantCard from "@/components/CombatantCard";
import { Combatant } from "@/types/combatant";
import { useEffect } from "react";

export default function CombatPage() {
  const STORAGE_KEY = "combat_tracker_state";
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);

  const addCombatant = (newC: Combatant) => {
    const updated = [...combatants, newC].sort(
      (a, b) => b.initiative - a.initiative
    );
    setCombatants(updated);
  };


// Inside CombatPage component
useEffect(() => {
  if (!hasLoaded) return; // ⛔ prevent premature saving

  const state = {
    combatants,
    turnIndex,
    round,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}, [combatants, turnIndex, round, hasLoaded]);


useEffect(() => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      setCombatants(parsed.combatants || []);
      setTurnIndex(parsed.turnIndex || 0);
      setRound(parsed.round || 1);
    } catch (err) {
      console.error("Failed to load combat state:", err);
    }
  }
  setHasLoaded(true); // ✅ Only after load is complete
}, []);



const nextTurn = () => {
  const nextIndex = (turnIndex + 1) % combatants.length;

  if (nextIndex === 0) {
    setRound((r) => r + 1); // Will only run once
  }

  setTurnIndex(nextIndex);
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
      <aside className="sticky top-0 h-screen w-full md:w-1/3 lg:w-1/4 p-4 border-r border-gray-700 bg-gray-900 flex flex-col">
<div className="flex-1 overflow-y-auto">
  {/* Round Tracker */}
  <div className="mb-6 text-center">
    <h2 className="text-lg font-semibold text-blue-400 mb-2">🕒 Round Tracker</h2>
    <div className="flex justify-center items-center gap-2">
      <button type="button" onClick={() => setRound((r) => Math.max(1, r - 1))} className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">
        -1
      </button>
      <span className="text-white text-xl font-bold">{round}</span>
      <button type="button" onClick={() => setRound((r) => r + 1)} className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600">
        +1
      </button>
    </div>
  </div>

  <AddCombatantForm onAdd={addCombatant} />

  {combatants.length > 0 && (
    <button
      type="button"
      className="mt-6 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-md transition duration-150 w-full"
      onClick={nextTurn}
    >
      Next Turn
    </button>
  )}
</div>

    <button
  type="button"
  onClick={() => setShowConfirmClear(true)}
  className="mt-4 text-sm text-red-300 hover:text-red-400 w-full"
>
  🧹 Clear Combat
</button>



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

        {showConfirmClear && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm border border-gray-600 text-center">
      <h2 className="text-lg font-semibold text-red-400 mb-2">Clear Combat?</h2>
      <p className="text-gray-300 text-sm mb-4">
        This will remove all combatants and reset the round. Are you sure?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowConfirmClear(false)}
          className="px-4 py-1 text-sm text-gray-300 bg-gray-700 hover:bg-gray-600 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            setCombatants([]);
            setTurnIndex(0);
            setRound(1);
            localStorage.removeItem(STORAGE_KEY);
            setShowConfirmClear(false);
          }}
          className="px-4 py-1 text-sm bg-red-600 hover:bg-red-500 text-white rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}
