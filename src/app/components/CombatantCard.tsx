import { Combatant } from "@/types/combatant";
import { useState } from "react";

interface Props {
  combatant: Combatant;
  isActive: boolean;
  onUpdate: (updated: Combatant) => void;
  onRemove: (id: string) => void;
}

export default function CombatantCard({
  combatant,
  isActive,
  onUpdate,
  onRemove,
}: Props) {
  const [adjustValue, setAdjustValue] = useState<number>(5);
  const [recentChange, setRecentChange] = useState<"damage" | "heal" | null>(null);

  const applyHPChange = (delta: number) => {
    const newHP = Math.min(Math.max(combatant.currentHP + delta, 0), combatant.maxHP);
    onUpdate({ ...combatant, currentHP: newHP });

    setRecentChange(delta < 0 ? "damage" : "heal");
    setTimeout(() => setRecentChange(null), 300);
  };

  const isDead = combatant.currentHP <= 0;
  const shouldGrayOut = isDead && combatant.type !== "PC";


  const feedbackClass =
    recentChange === "damage"
      ? "animate-flash-damage"
      : recentChange === "heal"
      ? "animate-flash-heal"
      : "";

  return (
    <div
      className={`relative rounded-lg border shadow-sm p-3 transition-all duration-200 overflow-hidden text-sm ${
        isActive
          ? "border-blue-500 bg-blue-900/30"
          : "border-gray-700 bg-gray-800"
      }  ${shouldGrayOut ? "opacity-50 grayscale" : ""} ${feedbackClass}`}
    >
      {/* Remove Button */}
      <button
        onClick={() => onRemove(combatant.id)}
        className="absolute top-1 right-2 text-gray-400 hover:text-red-500 text-xs font-bold"
        title="Remove Combatant"
      >
        ×
      </button>

      {/* Header Row */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-white">{combatant.name}</h2>
          {isDead && (
            <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded-full">Dead</span>
          )}
        </div>
        <span className="px-2 py-0.5 text-[10px] bg-gray-700 text-gray-300 rounded mr-5">
          {combatant.type}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <div className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
          Init: {combatant.initiative}
        </div>
        <div className="bg-green-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
          HP: {combatant.currentHP} / {combatant.maxHP}
        </div>
        <div className="bg-purple-700 text-white px-2 py-0.5 rounded text-xs font-semibold">
          AC: {combatant.ac}
        </div>
      </div>

      {/* Quick Adjust */}
      <div className="flex items-center gap-1 mb-1 flex-wrap">
        {[ -5, -1, +1, +5 ].map((n) => (
          <button
            key={n}
            onClick={() => applyHPChange(n)}
            className={`px-2 py-0.5 rounded border border-gray-600 text-xs font-medium ${
              n < 0 ? "text-red-200 bg-gray-700 hover:bg-gray-600" : "text-emerald-200 bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {n > 0 ? `+${n}` : n}
          </button>
        ))}
        <input
          type="number"
          value={adjustValue}
          onChange={(e) => setAdjustValue(Number(e.target.value))}
          className="w-14 px-1 py-0.5 rounded bg-gray-900 border border-gray-600 text-white text-xs"
        />
        <button
          onClick={() => applyHPChange(-adjustValue)}
          className="text-xs px-2 py-0.5 rounded bg-gray-700 border border-gray-600 text-red-200 hover:bg-gray-600"
        >
          -DMG
        </button>
        <button
          onClick={() => applyHPChange(adjustValue)}
          className="text-xs px-2 py-0.5 rounded bg-gray-700 border border-gray-600 text-emerald-200 hover:bg-gray-600"
        >
          +Heal
        </button>
      </div>

      {/* Notes (optional) */}
      {combatant.notes && (
        <p className="text-gray-400 text-xs italic mt-1">{combatant.notes}</p>
      )}
    </div>
  );
}
