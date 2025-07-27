"use client";

import { useState, useEffect, useRef } from "react";
import { Combatant, CombatantType } from "@/types/combatant";
import { v4 as uuidv4 } from "uuid";
import { primaryButton } from "@/styles/buttonStyles";
import { findMonster, searchMonsters, Monster } from "@/utils/srdMonsters";

interface Props {
  onAdd: (combatant: Combatant) => void;
  combatantCount: number;
}

export default function AddCombatantForm({ onAdd, combatantCount }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CombatantType>("PC");
  const [initiative, setInitiative] = useState<number>(0);
  const [hp, setHp] = useState<number>(10);
  const [ac, setAc] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [suggestions, setSuggestions] = useState<Monster[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle monster name input and lookup
  useEffect(() => {
    if (type === "Monster" && name.length > 0) {
      const results = searchMonsters(name);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [name, type]);

  // Handle clicking outside suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (type === "Monster") {
      const monster = findMonster(newName);
      if (monster) {
        setHp(monster.hp);
        setAc(monster.ac);
      }
    }
  };

  const handleSuggestionClick = (monster: Monster) => {
    setName(monster.name);
    setHp(monster.hp);
    setAc(monster.ac);
    setShowSuggestions(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCombatant: Combatant = {
      id: uuidv4(),
      name,
      type,
      initiative,
      currentHP: hp,
      maxHP: hp,
      ac,
      notes,
      isActive: false,
    };
    onAdd(newCombatant);

    // Reset form
    setName("");
    setInitiative(0);
    setHp(10);
    setAc(10);
    setNotes("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-6 space-y-5"
    >
      <h2 className="text-xl font-bold text-blue-400">Add Combatant</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={type === "Monster" ? "Type to search monsters..." : "Combatant name"}
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {suggestions.map((monster) => (
                  <button
                    key={monster.name}
                    type="button"
                    onClick={() => handleSuggestionClick(monster)}
                    className="w-full px-4 py-2 text-left text-gray-200 hover:bg-gray-700 focus:outline-none focus:bg-gray-700"
                  >
                    {monster.name} (AC: {monster.ac}, HP: {monster.hp})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as CombatantType)}
            className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="PC">Player</option>
            <option value="NPC">NPC</option>
            <option value="Monster">Monster</option>
            <option value="Lair Action">Lair</option>
          </select>
        </div>

        {/* Initiative */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">Initiative</label>
          <input
            type="number"
            value={initiative}
            onChange={(e) => setInitiative(+e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 15"
          />
        </div>

        {/* HP and AC - Only show if not Lair Action */}
        {type !== "Lair Action" && (
          <>
            {/* HP */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Hit Points</label>
              <input
                type="number"
                value={hp}
                onChange={(e) => setHp(+e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 40"
              />
            </div>

            {/* AC */}
            <div>
              <label className="block text-sm text-gray-300 mb-1">Armor Class</label>
              <input
                type="number"
                value={ac}
                onChange={(e) => setAc(+e.target.value)}
                className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 16"
              />
            </div>
          </>
        )}

        {/* Notes - Only show for Lair Actions */}
        {type === "Lair Action" && (
          <div className="md:col-span-3">
            <label className="block text-sm text-gray-300 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-900 text-gray-100 px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter lair action details..."
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={combatantCount >= 50}
        className={`w-full ${primaryButton} disabled:opacity-50`}
      >
        Add Combatant
      </button>

      {combatantCount >= 50 && (
        <p className="text-sm text-red-400 text-center">Combatant limit reached (50 max)</p>
      )}
    </form>
  );
}
