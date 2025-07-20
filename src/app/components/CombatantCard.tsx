import { Combatant } from "@/types/combatant";

interface Props {
  combatant: Combatant;
  isActive: boolean;
}

export default function CombatantCard({ combatant, isActive }: Props) {
  return (
    <div
      className={`rounded-xl border shadow-md p-4 transition-all duration-200 ${
        isActive
          ? "border-blue-500 bg-blue-900/30"
          : "border-gray-700 bg-gray-800"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-white">{combatant.name}</h2>
        <span className="px-2 py-0.5 text-xs font-medium bg-gray-700 text-gray-300 rounded">
          {combatant.type}
        </span>
      </div>

      <div className="text-sm text-gray-300 space-y-1">
        <p>
          <span className="text-gray-400">Initiative:</span>{" "}
          {combatant.initiative}
        </p>
        <p>
          <span className="text-gray-400">HP:</span>{" "}
          {combatant.currentHP} / {combatant.maxHP}
        </p>
        <p>
          <span className="text-gray-400">AC:</span> {combatant.ac}
        </p>
        {combatant.notes && (
          <p className="pt-2 text-gray-400 italic">{combatant.notes}</p>
        )}
      </div>
    </div>
  );
}
