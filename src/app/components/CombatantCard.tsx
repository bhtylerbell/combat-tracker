import { Combatant } from "@/types/combatant";
import { useState, useRef, useEffect } from "react";
import { smallDanger, smallSuccess } from "@/styles/buttonStyles";

// Add debounce utility
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
};

interface Props {
  combatant: Combatant;
  isActive: boolean;
  onUpdate: (updated: Combatant) => void;
  onRemove: (id: string) => void;
}

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

export default function CombatantCard({
  combatant,
  isActive,
  onUpdate,
  onRemove,
}: Props) {
  const [showControls, setShowControls] = useState(false);
  const [adjustValue, setAdjustValue] = useState<number>(5);
  const [recentChange, setRecentChange] = useState<"damage" | "heal" | null>(null);
  const [localInitiative, setLocalInitiative] = useState(combatant.initiative);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Create debounced update function
  const debouncedInitiativeUpdate = useRef(
    debounce((value: number) => {
      onUpdate({
        ...combatant,
        initiative: value
      });
    }, 500)
  ).current;

  // Keep local state in sync with prop changes
  useEffect(() => {
    setLocalInitiative(combatant.initiative);
  }, [combatant.initiative]);

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
  const feedbackClass = recentChange === "damage"
    ? "animate-flash-damage"
    : recentChange === "heal"
    ? "animate-flash-heal"
    : "";

  // Calculate health percentage for color
  const healthPercent = (combatant.currentHP / combatant.maxHP) * 100;
  const healthColor = healthPercent <= 25 ? 'bg-red-700' 
    : healthPercent <= 50 ? 'bg-yellow-700' 
    : 'bg-emerald-700';

  if (combatant.type === "Lair") {
    return (
      <div
        ref={cardRef}
        onClick={() => setShowControls(prev => !prev)}
        className={`
          relative rounded-lg border shadow-sm transition-all duration-200
          ${isActive ? 'border-yellow-500' : 'border-gray-700'}
          hover:border-yellow-400 cursor-pointer
        `}
      >
        <div className="p-3 flex items-center gap-3">
          {/* Initiative Badge */}
          <div className="flex flex-col items-center gap-1">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
              ${isActive ? 'bg-yellow-600' : 'bg-gray-700'}
            `}>
              <input
                type="number"
                value={localInitiative}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setLocalInitiative(value);
                  debouncedInitiativeUpdate(value);
                }}
                onClick={e => e.stopPropagation()}
                className="w-10 text-center bg-transparent [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="0"
                max="99"
              />
            </div>
            <div className="w-[4.5rem] flex justify-center">
              <span className="px-2 py-0.5 text-xs rounded-full font-medium text-center w-full bg-yellow-900 text-yellow-200">
                {combatant.type}
              </span>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={combatant.name}
                onChange={(e) => onUpdate({ ...combatant, name: e.target.value })}
                onClick={e => e.stopPropagation()}
                className="font-bold bg-transparent border-b border-gray-700 focus:border-yellow-500 px-1"
              />
            </div>
            
            {/* Notes Area */}
            {(showControls || combatant.notes) && (
              <div className="mt-2">
                <textarea
                  value={combatant.notes || ""}
                  onChange={(e) => onUpdate({ ...combatant, notes: e.target.value })}
                  onClick={e => e.stopPropagation()}
                  placeholder="Add notes..."
                  className="w-full px-2 py-1 bg-gray-900/50 border border-gray-700 rounded text-gray-300 text-sm resize-none focus:border-yellow-500"
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(combatant.id);
              }}
              className="px-2 py-1 text-xs bg-gray-800 hover:bg-red-900/50 rounded"
              title="Remove Lair Action"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      onClick={() => setShowControls(prev => !prev)}
      className={`
        relative rounded-lg border shadow-sm transition-all duration-200
        ${isActive ? 'border-blue-500' : 'border-gray-700'}
        ${shouldGrayOut ? 'opacity-50 grayscale' : ''}
        hover:border-blue-400 cursor-pointer ${feedbackClass}
      `}
    >
      <div className="p-3 flex items-center gap-3">
        {/* Initiative & Type Badge */}
        <div className="flex flex-col items-center gap-1">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
            ${isActive ? 'bg-blue-600' : 'bg-gray-700'}
          `}>
            <input
              type="number"
              value={localInitiative}
              onChange={(e) => {
                const value = Number(e.target.value);
                setLocalInitiative(value);
                debouncedInitiativeUpdate(value);
              }}
              onClick={e => e.stopPropagation()}
              className="w-10 text-center bg-transparent [appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="99"
            />
          </div>
          <div className="w-[4.5rem] flex justify-center"> {/* Fixed width container */}
            <span className={`
              px-2 py-0.5 text-xs rounded-full font-medium text-center w-full
              ${combatant.type === 'PC' ? 'bg-blue-900 text-blue-200' 
                : combatant.type === 'NPC' ? 'bg-purple-900 text-purple-200'
                : 'bg-red-900 text-red-200'}
            `}>
              {combatant.type}
            </span>
          </div>
        </div>

        {/* Name & Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={combatant.name}
              onChange={(e) => onUpdate({ ...combatant, name: e.target.value })}
              onClick={e => e.stopPropagation()}
              className="font-bold bg-transparent border-b border-gray-700 focus:border-blue-500 px-1"
            />
            {isDead && (
              <span className="px-2 py-0.5 bg-red-900/50 text-white text-xs rounded-full">
                Dead
              </span>
            )}
            {(combatant.statuses && combatant.statuses.length > 0) && (
              <div className="flex gap-1">
                {combatant.statuses.map(status => (
                  <span key={status} className="px-1.5 py-0.5 text-xs rounded bg-gray-700">
                    {status}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Stats Bar */}
          <div className="flex items-center gap-4 mt-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-red-400">HP:</span>
              <input
                type="text"
                value={`${combatant.currentHP}/${combatant.maxHP}`}
                onChange={(e) => {
                  const [current, max] = e.target.value.split("/").map(Number);
                  if (!isNaN(current) && !isNaN(max)) {
                    onUpdate({
                      ...combatant,
                      currentHP: current,
                      maxHP: max,
                    });
                  }
                }}
                onClick={e => e.stopPropagation()}
                className="bg-transparent w-20 px-1 border-b border-gray-700 focus:border-red-500"
              />
              {/* Quick HP Adjustments */}
              <div className="flex gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    applyHPChange(-1);
                  }} 
                  className="px-1.5 py-0.5 text-xs bg-red-900/50 hover:bg-red-800/50 rounded"
                >
                  -1
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    applyHPChange(1);
                  }} 
                  className="px-1.5 py-0.5 text-xs bg-green-900/50 hover:bg-green-800/50 rounded"
                >
                  +1
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">AC:</span>
              <input
                type="number"
                value={combatant.ac}
                onChange={(e) => onUpdate({ ...combatant, ac: Number(e.target.value) })}
                onClick={e => e.stopPropagation()}
                className="bg-transparent w-12 px-1 border-b border-gray-700 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Health Bar */}
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${healthColor}`}
              style={{ width: `${Math.max(0, Math.min(100, healthPercent))}%` }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(combatant.id);
            }}
            className="px-2 py-1 text-xs bg-gray-800 hover:bg-red-900/50 rounded"
            title="Remove Combatant"
          >
            ×
          </button>
        </div>
      </div>

      {/* Expandable Controls Section */}
      {showControls && (
        <div className="p-3 border-t border-gray-700 bg-gray-800/50" onClick={e => e.stopPropagation()}>
          {/* HP Adjustments */}
          <div className="flex flex-wrap gap-2 items-center">
            {[-5, -2, +2, +5].map(n => (
              <button
                key={n}
                onClick={() => applyHPChange(n)}
                className={`px-2 py-1 text-xs rounded ${
                  n < 0 ? 'bg-red-900/50 hover:bg-red-800/50' : 'bg-green-900/50 hover:bg-green-800/50'
                }`}
              >
                {n > 0 ? `+${n}` : n}
              </button>
            ))}
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={adjustValue}
                onChange={e => setAdjustValue(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded bg-gray-900 border border-gray-600 text-white text-sm"
              />
              <button
                onClick={() => applyHPChange(-adjustValue)}
                className="px-2 py-1 text-xs bg-red-900/50 hover:bg-red-800/50 rounded"
              >
                Damage
              </button>
              <button
                onClick={() => applyHPChange(adjustValue)}
                className="px-2 py-1 text-xs bg-green-900/50 hover:bg-green-800/50 rounded"
              >
                Heal
              </button>
            </div>
          </div>

          {/* Conditions */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {COMMON_CONDITIONS.map(condition => {
                const isActive = (combatant.statuses || []).includes(condition);
                return (
                  <button
                    key={condition}
                    onClick={() => {
                      const current = combatant.statuses || [];
                      if (isActive) {
                        updateStatuses(current.filter(c => c !== condition));
                      } else {
                        updateStatuses([...current, condition]);
                      }
                    }}
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {condition}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}