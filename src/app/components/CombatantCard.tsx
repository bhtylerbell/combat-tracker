import { Combatant } from "@/types/combatant";
import { useState, useRef, useEffect } from "react";

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
  const [recentChange, setRecentChange] = useState<"damage" | "heal" | null>(
    null
  );
  const [showConditions, setShowConditions] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isActive]);

  const applyHPChange = (delta: number) => {
    const newHP = Math.min(
      Math.max(combatant.currentHP + delta, 0),
      combatant.maxHP
    );
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

  if (combatant.type === "Lair Action") {
    return (
      <div
        ref={cardRef}
        className={`relative rounded-lg border shadow-sm p-2 transition-all duration-200 text-sm ${
          isActive
            ? "border-yellow-600 bg-yellow-900/30"
            : "border-gray-700 bg-yellow-900/30"
        } ${shouldGrayOut ? "opacity-50 grayscale" : ""} ${feedbackClass}`}
      >
        <button
          onClick={() => onRemove(combatant.id)}
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs font-bold"
          title="Remove Combatant"
        >
          ×
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={combatant.name}
                  onChange={(e) =>
                    onUpdate({ ...combatant, name: e.target.value })
                  }
                  className="bg-transparent text-lg font-semibold text-white border-b border-gray-500 focus:outline-none"
                />
                {isDead && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                    Dead
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex flex-col items-center">
                  <label className="text-xs text-gray-400">Init</label>
                  <input
                    type="number"
                    value={combatant.initiative}
                    onChange={(e) =>
                      onUpdate({
                        ...combatant,
                        initiative: Number(e.target.value),
                      })
                    }
                    className="bg-yellow-600/70 text-white px-3 py-2 rounded text-sm font-semibold w-16 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
          <span className="px-3 py-1 text-sm font-semibold rounded text-white bg-yellow-700/50">
            {combatant.type}
          </span>
        </div>
        <textarea
          value={combatant.notes || ""}
          onChange={(e) => onUpdate({ ...combatant, notes: e.target.value })}
          placeholder="Add notes..."
          className="w-full mt-2 px-2 py-1 bg-gray-900 border border-gray-600 rounded text-gray-300 text-sm resize-none"
        />
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`relative rounded-lg border shadow-sm p-2 transition-all duration-200 text-sm ${
        isActive
          ? "border-blue-500 bg-blue-900/30"
          : "border-gray-700 bg-blue-900/30"
      } ${
        combatant.type === "PC"
          ? "bg-blue-800/30"
          : combatant.type === "NPC"
          ? "bg-violet-800/30"
          : combatant.type === "Monster"
          ? "bg-red-800/30"
          : "bg-blue-800"
      } ${shouldGrayOut ? "opacity-50 grayscale" : ""} ${feedbackClass}`}
    >
      <button
        onClick={() => onRemove(combatant.id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xs font-bold"
        title="Remove Combatant"
      >
        ×
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={combatant.name}
                onChange={(e) =>
                  onUpdate({ ...combatant, name: e.target.value })
                }
                className="bg-transparent text-lg font-semibold text-white border-b border-gray-500 focus:outline-none"
              />
              {isDead && (
                <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded-full">
                  Dead
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-400">Init</label>
                <input
                  type="number"
                  value={combatant.initiative}
                  onChange={(e) =>
                    onUpdate({
                      ...combatant,
                      initiative: Number(e.target.value),
                    })
                  }
                  className="bg-blue-900 text-white px-3 py-2 rounded text-sm font-semibold w-16 text-center"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-400">HP</label>
                <input
                  type="text"
                  value={`${combatant.currentHP} / ${combatant.maxHP}`}
                  onChange={(e) => {
                    const [current, max] = e.target.value
                      .split("/")
                      .map(Number);
                    if (!isNaN(current) && !isNaN(max)) {
                      onUpdate({
                        ...combatant,
                        currentHP: current,
                        maxHP: max,
                      });
                    }
                  }}
                  className="bg-green-700/70 text-white px-3 py-2 rounded text-sm font-semibold w-28 text-center"
                />
              </div>
              <div className="flex flex-col items-center">
                <label className="text-xs text-gray-400">AC</label>
                <input
                  type="number"
                  value={combatant.ac}
                  onChange={(e) =>
                    onUpdate({ ...combatant, ac: Number(e.target.value) })
                  }
                  className="bg-purple-700/70 text-white px-3 py-2 rounded text-sm font-semibold w-16 text-center"
                />
              </div>
            </div>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded text-white ${
            combatant.type === "PC"
              ? "bg-blue-800/50"
              : combatant.type === "NPC"
              ? "bg-violet-800/50"
              : "bg-red-800/50"
          }`}
        >
          {combatant.type}
        </span>
      </div>

      {/* HP Controls */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        {[-5, -1, +1, +5].map((n) => (
          <button
            key={n}
            onClick={() => applyHPChange(n)}
            className={`px-2 py-1 rounded border border-gray-600 text-xs font-medium ${
              n < 0
                ? "text-red-200 bg-gray-700 hover:bg-gray-600"
                : "text-emerald-200 bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {n > 0 ? `+${n}` : n}
          </button>
        ))}
        <input
          type="number"
          value={adjustValue}
          onChange={(e) => setAdjustValue(Number(e.target.value))}
          className="w-16 px-2 py-1 rounded bg-gray-900 border border-gray-600 text-white text-xs"
        />
        <button
          onClick={() => applyHPChange(-adjustValue)}
          className="text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-red-200 hover:bg-gray-600"
        >
          -DMG
        </button>
        <button
          onClick={() => applyHPChange(adjustValue)}
          className="text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-emerald-200 hover:bg-gray-600"
        >
          +Heal
        </button>
      </div>

      {/* Active Statuses */}
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
                  updateStatuses(
                    combatant.statuses!.filter((_, idx) => idx !== i)
                  )
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

      {/* Toggleable Conditions */}
      <button
        className="text-xs text-blue-400 hover:underline mb-2"
        onClick={() => setShowConditions((prev) => !prev)}
      >
        {showConditions ? "Hide Conditions" : "Show Common Conditions"}
      </button>
      {showConditions && (
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
      )}

      

      {combatant.notes && (
        <p className="text-gray-400 text-xs italic mt-2">{combatant.notes}</p>
      )}
    </div>
  );
}
