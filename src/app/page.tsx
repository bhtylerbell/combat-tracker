"use client";

import { useState } from "react";
import AddCombatantForm from "@/components/AddCombatantForm";
import CombatantCard from "@/components/CombatantCard";
import { Combatant } from "@/types/combatant";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/next";

export default function CombatPage() {
  // Form state
  const STORAGE_KEY = "combat_tracker_state";
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [diceResult, setDiceResult] = useState<string>("");
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState<number>(0);
  const version = "07/23/2025";

  // Timer state loaded from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("combat_timer");
    if (saved) setTimer(parseInt(saved, 10));
  }, []);

  // Controls whether timer is running
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Save timer to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("combat_timer", timer.toString());
  }, [timer]);

  // Handle ticking timer when running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Formats time in HH:MM:SS for timer display
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  };

  // Add combatant to initiative list in initiative order
  const addCombatant = (newC: Combatant) => {
    const updated = [...combatants, newC].sort(
      (a, b) => b.initiative - a.initiative
    );
    setCombatants(updated);
  };

  // Check if sidebar is expanded or not
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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

  // Load previous combat session if one exists
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

  // Set net turn
  const nextTurn = () => {
    const nextIndex = (turnIndex + 1) % combatants.length;

    if (nextIndex === 0) {
      setRound((r) => r + 1); // Will only run once
    }

    setTurnIndex(nextIndex);
  };

  // Set previous turn
  const previousTurn = () => {
    setTurnIndex((prev) => {
      const newIndex = (prev - 1 + combatants.length) % combatants.length;

      // If we're wrapping around to the end of the list, decrement the round
      if (prev === 0) {
        setRound((r) => Math.max(1, r - 1));
      }

      return newIndex;
    });
  };

  // Update combatant initiative live
  const updateCombatant = (updated: Combatant) => {
    setCombatants((prev) =>
      [...prev.map((c) => (c.id === updated.id ? updated : c))].sort(
        (a, b) => b.initiative - a.initiative
      )
    );
  };

  // Remove combatant from initiative list
  const removeCombatant = (id: string) => {
    setCombatants((prev) => prev.filter((c) => c.id !== id));
  };

  // Dice roller
  const rollDice = (sides: number) => {
    const roll = Math.floor(Math.random() * sides) + 1;
    setDiceResult(`d${sides}: ${roll}`);
  };

  return (
    <div className="min-h-screen flex">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white px-3 py-2 rounded-md shadow hover:bg-gray-700 focus:outline-none"
      >
        {isSidebarOpen ? "← Hide" : "→ Show"}
      </button>

      <Analytics />
      {/* Sidebar */}

      <aside
        className={`transition-all duration-300 ${
          isSidebarOpen
            ? "w-full md:w-1/3 lg:w-1/4 p-4"
            : "w-0 p-0 overflow-hidden"
        } sticky top-0 h-screen border-r border-gray-700 bg-gray-900`}
      >
        {isSidebarOpen && (
          <>
            <div className="flex-1 overflow-y-auto">
              {/* Round Tracker */}
              <div className="mb-6 text-center">
                <h2 className="text-lg font-semibold text-blue-400 mb-2">
                  Round Tracker
                </h2>
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRound((r) => Math.max(1, r - 1))}
                    className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    -1
                  </button>
                  <span className="text-white text-xl font-bold">{round}</span>
                  <button
                    type="button"
                    onClick={() => setRound((r) => r + 1)}
                    className="px-2 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    +1
                  </button>
                </div>
              </div>

              <AddCombatantForm
                onAdd={addCombatant}
                combatantCount={combatants.length}
              />
            </div>

            {/* Combat Timer */}
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 space-y-3">
              <h2 className="text-lg font-semibold text-blue-400">
                Combat Timer
              </h2>
              <p className="text-white text-2xl text-center font-mono">
                {formatTime(timer)}
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(true)}
                  className="px-2 py-1 text-sm bg-green-600/50 text-white rounded hover:bg-green-500"
                >
                  Start
                </button>
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="px-2 py-1 text-sm bg-yellow-600/50 text-white rounded hover:bg-yellow-500"
                >
                  Stop
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimer(0);
                  }}
                  className="px-2 py-1 text-sm bg-red-600/50 text-white rounded hover:bg-red-500"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Dice Roller */}
            <div className="mt-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 space-y-3">
              <h2 className="text-lg font-semibold text-blue-400">
                Dice Roller
              </h2>
              <div className="flex flex-wrap gap-2">
                {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                  <button
                    key={sides}
                    onClick={() => rollDice(sides)}
                    className="px-2 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
                  >
                    d{sides}
                  </button>
                ))}
              </div>
              {diceResult && (
                <p className="text-white text-sm">Result: {diceResult}</p>
              )}
            </div>

            <div className="relative md:fixed bottom-4">
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className="mt-4 text-sm text-red-300 hover:text-red-400"
              >
                Clear Combat
              </button>
              <div className="mt-10 text-xs text-white-300 w-full">
                Follow the project on{" "}
                <a
                  href="https://github.com/bhtylerbell/combat-tracker.git"
                  className="text-red-300 hover:text-red-400"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
                <br />
                Build Date: {version}
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Main Combat Area */}
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-white mb-4">Initiative Order</h1>

        {combatants.length === 0 && (
          <p className="text-gray-400">
            No combatants yet. Add some on the left!
          </p>
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
              <h2 className="text-lg font-semibold text-red-400 mb-2">
                Clear Combat?
              </h2>
              <p className="text-gray-300 text-sm mb-4">
                This will remove all combatants and reset the round. Are you
                sure?
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
      {/* Navigation Buttons */}
      {combatants.length >= 2 && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-50">
          <button
            onClick={previousTurn}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md shadow"
          >
            Previous Turn
          </button>
          <button
            onClick={nextTurn}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md shadow"
          >
            Next Turn
          </button>
        </div>
      )}
    </div>
  );
}
