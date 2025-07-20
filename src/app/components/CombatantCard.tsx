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
const updateStatuses = (newStatuses: string[]) => {
  onUpdate({ ...combatant, statuses: newStatuses });
};
  const isDead = combatant.currentHP <= 0;
  const shouldGrayOut = isDead && combatant.type !== "PC";


  const feedbackClass =
    recentChange === "damage"
      ? "animate-flash-damage"
      : recentChange === "heal"
      ? "animate-flash-heal"
      : "";
const COMMON_CONDITIONS = [
  "Blinded",
  "Charmed",
  "Deafened",
  "Frightened",
  "Grappled",
  "Incapacitated",
  "Invisible",
  "Paralyzed",
  "Petrified",
  "Poisoned",
  "Prone",
  "Restrained",
  "Stunned",
  "Unconscious",
  "Concentrating",
  "Blessed",
  "Cursed",
];

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
          <h2 className="text-base font-semibold text-white text-xl">{combatant.name}</h2>
          {isDead && (
            <span className="px-1 py-0.5 bg-red-600 text-white text-xs rounded-full">Dead</span>
          )}
        </div>
        <span
  className={`px-2 py-0.5 text-xs font-semibold rounded text-white mr-5 ${
    combatant.type === "PC"
      ? "bg-blue-600"
      : combatant.type === "NPC"
      ? "bg-violet-600"
      : "bg-red-600"
  }`}
>
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
{/* Status Badges */}
{combatant.statuses && combatant.statuses.length > 0 && (
  <div className="flex flex-wrap gap-2 mb-2 text-xs text-white">
    {combatant.statuses.map((status, i) => (
      <span
        key={i}
        className="bg-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"
      >
        {status}
        <button
          onClick={() =>
            updateStatuses(combatant.statuses!.filter((_, idx) => idx !== i))
          }
          className="text-xs text-red-300 hover:text-red-400"
          title="Remove condition"
        >
          ×
        </button>
      </span>
    ))}
  </div>
)}

<div className="flex flex-wrap gap-2 mb-2">
  {COMMON_CONDITIONS.map((condition) => {
    const isActive = combatant.statuses?.includes(condition);
    return (
      <button
        key={condition}
        onClick={() => {
          const current = combatant.statuses || [];
          if (isActive) {
            updateStatuses(current.filter((c) => c !== condition));
          } else {
            updateStatuses([...current, condition]);
          }
        }}
        className={`px-2 py-0.5 rounded-full text-xs font-medium border transition ${
          isActive
            ? "bg-blue-600 text-white border-blue-400"
            : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
        }`}
      >
        {condition}
      </button>
    );
  })}
</div>


<input
  type="text"
  placeholder="Add custom status"
  className="w-full mb-2 px-2 py-1 text-sm bg-gray-900 border border-gray-600 rounded text-white"
  onKeyDown={(e) => {
    if (e.key === "Enter" && e.currentTarget.value.trim() !== "") {
      e.preventDefault();
      const newStatus = e.currentTarget.value.trim();
      if (
        !combatant.statuses?.includes(newStatus)
      ) {
        updateStatuses([...(combatant.statuses || []), newStatus]);
      }
      e.currentTarget.value = "";
    }
  }}
/>


      {/* Notes (optional) */}
      {combatant.notes && (
        <p className="text-gray-400 text-xs italic mt-1">{combatant.notes}</p>
      )}
    </div>
  );
}
