"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from '@clerk/nextjs';
import AddCombatantForm from "@/components/AddCombatantForm";
import CombatantCard from "@/components/CombatantCard";
import AuthModal from "@/components/AuthModal";
import UserProfile from "@/components/UserProfile";
import UserProfileModal from "@/components/UserProfileModal";
import AdminPanel from "@/components/AdminPanel";
import SavedCombats from "@/components/SavedCombats";
import ToastContainer from "@/components/ToastContainer";
import { Combatant } from "@/types/combatant";
import { CombatState } from "@/types/database";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useCombatSync } from "@/utils/useCombatSync";
import { useToast } from "@/hooks/useToast";
import {
  primaryButton,
  secondaryButton,
  dangerButton,
  smallSuccess,
  smallWarning,
  smallDanger,
  smallSecondary,
} from "@/styles/buttonStyles";

export default function CombatPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { toasts, showSuccess, showError, showInfo, removeToast } = useToast();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [diceResult, setDiceResult] = useState<string>("");
  const [combatants, setCombatants] = useState<Combatant[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [timer, setTimer] = useState<number>(0);
  const version = "07/31/2025";

  const { saveCombatState, loadCombatState, isLoading, error } = useCombatSync();

  // Controls whether timer is running
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Check if sidebar is expanded or not
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Import/Export modal state
  const [showExportImport, setShowExportImport] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');

  // Saved combats modal state
  const [showSavedCombats, setShowSavedCombats] = useState(false);

  // User profile modal states
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Track currently loaded combat for overwrite functionality
  const [currentlyLoadedCombatId, setCurrentlyLoadedCombatId] = useState<string | null>(null);

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
  const formatTime = useCallback(
    (seconds: number) => {
      const hrs = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    },
    []
  );

  // Add combatant to initiative list in initiative order
  const addCombatant = useCallback(
    (newC: Combatant) => {
      setCombatants((prev) => {
        const updated = [...prev, newC].sort(
          (a, b) => b.initiative - a.initiative
        );
        return updated;
      });
    },
    []
  ); // Empty dependency array since we're using the function form of setCombatants

  // Load combat state
  useEffect(() => {
    async function loadState() {
      try {
        const state = await loadCombatState();
        if (state && Array.isArray(state.combatants)) {
          setCombatants(state.combatants);
          setTurnIndex(state.turnIndex ?? 0);
          setRound(state.round ?? 1);
          setTimer(state.timer ?? 0);
        }
      } catch (error) {
        console.error("Failed to load combat state:", error);
      } finally {
        setHasLoaded(true);
      }
    }

    if (!isLoading) {
      loadState();
    }
  }, [isLoading, loadCombatState]); // Only run on initial load

  // Save combat state
  useEffect(() => {
    if (!hasLoaded) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await saveCombatState({
          combatants,
          turnIndex,
          round,
          timer,
        });
      } catch (error) {
        console.error("Failed to save combat state:", error);
      }
    }, 1000); // Increased debounce time

    return () => clearTimeout(saveTimeout);
  }, [hasLoaded, combatants, turnIndex, round, timer, saveCombatState]);

  // Combat turn management
  const nextTurn = useCallback(() => {
    const nextIndex = (turnIndex + 1) % combatants.length;
    if (nextIndex === 0) {
      setRound((r: number) => r + 1);
    }
    setTurnIndex(nextIndex);
  }, [combatants.length, turnIndex]);

  const previousTurn = useCallback(() => {
    setTurnIndex((prev: number) => {
      const newIndex = (prev - 1 + combatants.length) % combatants.length;
      if (prev === 0) {
        setRound((r: number) => Math.max(1, r - 1));
      }
      return newIndex;
    });
  }, [combatants.length]);

  // Combatant management
  const updateCombatant = useCallback(
    (updated: Combatant) => {
      setCombatants((prev: Combatant[]) =>
        [...prev.map((c) => (c.id === updated.id ? updated : c))].sort(
          (a, b) => b.initiative - a.initiative
        )
      );
    },
    []
  );

  const removeCombatant = useCallback(
    (id: string) => {
      setCombatants((prev: Combatant[]) => prev.filter((c) => c.id !== id));
    },
    []
  );

  // Dice roller
  const rollDice = useCallback((sides: number, count: number = 1) => {
    const rolls = Array(count).fill(0).map(() => 
      Math.floor(Math.random() * sides) + 1
    );
    
    if (count === 2 && sides === 20) {
      // For advantage/disadvantage rolls, show both numbers
      setDiceResult(`2d20: ${rolls[0]}, ${rolls[1]}`);
    } else {
      const total = rolls.reduce((sum, roll) => sum + roll, 0);
      setDiceResult(`${count}d${sides}: ${total}`);
    }
  }, []);

  // Export combat state
  const exportCombat = useCallback(() => {
    const combatState = {
      combatants,
      turnIndex,
      round,
      timer,
      exportDate: new Date().toISOString(),
      version
    };
    
    const dataStr = JSON.stringify(combatState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `combat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [combatants, turnIndex, round, timer, version]);

  // Import combat state
  const importCombat = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target?.result as string;
        const importedState = JSON.parse(jsonString);
        
        // Validate the imported data structure
        if (!importedState.combatants || !Array.isArray(importedState.combatants)) {
          alert('Invalid combat file format');
          return;
        }
        
        // Set the imported state
        setCombatants(importedState.combatants);
        setTurnIndex(importedState.turnIndex ?? 0);
        setRound(importedState.round ?? 1);
        setTimer(importedState.timer ?? 0);
        
        // Save to localStorage
        await saveCombatState({
          combatants: importedState.combatants,
          turnIndex: importedState.turnIndex ?? 0,
          round: importedState.round ?? 1,
          timer: importedState.timer ?? 0,
        });
        
        setShowExportImport(false);
        alert(`Combat imported successfully! ${importedState.combatants.length} combatants loaded.`);
      } catch (error) {
        console.error('Failed to import combat:', error);
        alert('Failed to import combat file. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  }, [saveCombatState]);

  // Load saved combat
  const loadSavedCombat = useCallback(async (combatState: CombatState, combatId?: string) => {
    setCombatants(combatState.combatants);
    setTurnIndex(combatState.turnIndex);
    setRound(combatState.round);
    setTimer(combatState.timer);
    
    // Track which combat was loaded for overwrite functionality
    setCurrentlyLoadedCombatId(combatId || null);
    
    // Save to localStorage
    await saveCombatState(combatState);
  }, [saveCombatState]);

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <SpeedInsights/>
      <Analytics />
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`fixed top-4 left-4 z-50 ${secondaryButton} focus:outline-none`}
          aria-label="Show Sidebar"
        >
          → Show
        </button>
      )}
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ${
          isSidebarOpen
            ? "w-full md:w-1/3 lg:w-1/4"
            : "w-0 p-0 overflow-hidden"
        } sticky top-0 h-screen border-r border-gray-700 bg-gray-900`}
      >
        {isSidebarOpen && (
          <div className="h-full flex flex-col relative">
            <div className="flex-1 overflow-y-auto p-4 pb-40">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`mb-4 ${secondaryButton} focus:outline-none`}
                aria-label="Hide Sidebar"
              >
                ← Hide
              </button>

              {/* Authentication Section */}
              {isLoaded && (
                <div className="mb-6">
                  {isSignedIn ? (
                    <UserProfile 
                      onManageCombats={() => setShowSavedCombats(true)}
                      onShowProfile={() => setShowUserProfileModal(true)}
                      onShowAdmin={() => setShowAdminPanel(true)}
                    />
                  ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-sm p-3">
                      <h3 className="text-base font-semibold text-blue-400 mb-2">Save Your Combats</h3>
                      <p className="text-xs text-gray-400 mb-3">
                        Create an account to save and manage your combat encounters.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setAuthMode('sign-up');
                            setShowAuthModal(true);
                          }}
                          className={smallSecondary}
                        >
                          Sign Up
                        </button>
                        <button
                          onClick={() => {
                            setAuthMode('sign-in');
                            setShowAuthModal(true);
                          }}
                          className={smallSecondary}
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <AddCombatantForm
                onAdd={addCombatant}
                combatantCount={combatants.length}
              />

              {/* Combat Timer */}
              <div className="mt-6 mb-6 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 space-y-3">
                <h2 className="text-lg font-semibold text-blue-400 flex items-center justify-between">
                  <span>Combat Timer</span>
                  {isTimerRunning ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-400">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-400">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </h2>
                <p className="text-white text-2xl text-center font-mono">
                  {formatTime(timer)}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={isTimerRunning ? smallWarning : smallSuccess}
                  >
                    {isTimerRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimer(0);
                    }}
                    className={smallDanger}
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Dice Roller */}
              <div className="mt-6 mb-24 bg-gray-800 border border-gray-700 rounded-xl shadow-lg p-4 space-y-4">
                <h2 className="text-lg font-semibold text-blue-400 flex items-center gap-2">
                  Dice Roller
                </h2>
                
                {/* Dice Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {[4, 6, 8, 10, 12, 20, 100].map((sides) => (
                    <button
                      key={sides}
                      onClick={() => rollDice(sides)}
                      className={`
                        relative group h-12 
                        bg-gray-700/50 hover:bg-gray-600/50 
                        border border-gray-600 hover:border-gray-500
                        rounded-lg transition-all duration-200
                        flex items-center justify-center
                        ${diceResult?.includes(`d${sides}:`) ? 'ring-2 ring-blue-500/50' : ''}
                      `}
                    >
                      <span className="text-sm font-bold">d{sides}</span>
                      {/* Hover Effect */}
                      <div className="absolute -top-8 scale-0 group-hover:scale-100 transition-transform duration-200">
                        <div className="bg-gray-900 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                          Roll 1d{sides}
                        </div>
                      </div>
                    </button>
                  ))}
                  {/* Quick Roll Multiple Dice */}
                  <button
                    onClick={() => rollDice(20, 2)}
                    className="col-span-4 mt-2 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 hover:border-gray-500 rounded-lg h-12 flex items-center justify-center gap-2 group transition-all duration-200"
                  >
                    <span className="text-sm font-bold">2d20</span>
                    <span className="text-xs text-gray-400 group-hover:text-gray-300">(Advantage/Disadvantage)</span>
                  </button>
                </div>

                {/* Results Display */}
                {diceResult && (
                  <div className="mt-4 bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 text-sm font-semibold">Result</span>
                        <span className="text-xl font-bold">{diceResult.split(': ')[1]}</span>
                      </div>
                      <span className="text-gray-500 text-sm">{diceResult.split(': ')[0]}</span>
                    </div>
                  </div>
                )}

                
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 pt-6 bg-gray-900 border-t border-gray-700">
              {/* Export/Import Buttons */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setShowExportImport(true)}
                  className={`${smallSecondary} flex-1 flex items-center justify-center gap-2`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                  </svg>
                  Export/Import
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                className={`${smallDanger} w-full mb-4`}
              >
                Clear Combat
              </button>
              <div className="text-xs text-gray-400">
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
                <div className="mt-2 text-[10px] text-gray-500">
                  <p>
          This website uses content from the SRD and is licensed under the{" "}
          <a
            href="https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Open Gaming License Version 1.0a
          </a>
        </p>
        <p className="mt-1">
          Dungeons & Dragons, D&D, their respective logos, and all Wizards titles
          and characters are property of Wizards of the Coast LLC in the U.S.A. and
          other countries. ©2024 Wizards.
        </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Combat Area */}
      <main className="flex-1 p-6 space-y-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Initiative Order</h1>

          {/* Round Tracker */}
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-semibold">Round</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRound((r) => Math.max(1, r - 1))}
                className={smallSecondary}
              >
                -1
              </button>
              <span className="text-white font-bold min-w-[2ch] text-center">
                {round}
              </span>
              <button
                type="button"
                onClick={() => setRound((r) => r + 1)}
                className={smallSecondary}
              >
                +1
              </button>
            </div>
          </div>
        </div>

        {combatants.length === 0 && (
          <p className="text-gray-400">No combatants yet. Add some on the left!</p>
        )}

        <div className="space-y-3 z-30">
          {combatants.map((c, idx) => (
            <CombatantCard
              // Use both id and initiative for a more stable key
              key={`${c.id}-${c.initiative}`}
              combatant={c}
              isActive={idx === turnIndex}
              onUpdate={updateCombatant}
              onRemove={removeCombatant}
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
                  className={secondaryButton}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setCombatants([]);
                    setTurnIndex(0);
                    setRound(1);
                    setTimer(0);
                    setCurrentlyLoadedCombatId(null); // Clear loaded combat ID
                    await saveCombatState({
                      combatants: [],
                      turnIndex: 0,
                      round: 1,
                      timer: 0,
                    });
                    setShowConfirmClear(false);
                  }}
                  className={dangerButton}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Export/Import Modal */}
        {showExportImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md border border-gray-600">
              <h2 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                Export & Import Combat
              </h2>
              
              <div className="space-y-4">
                {/* Export Section */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Export Current Combat</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Save your current combat state as a JSON file to share or backup.
                  </p>
                  <button
                    onClick={() => {
                      exportCombat();
                      setShowExportImport(false);
                    }}
                    className={`${primaryButton} w-full flex items-center justify-center gap-2`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                    Download Combat File
                  </button>
                </div>

                {/* Import Section */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Import Combat</h3>
                  <p className="text-xs text-gray-400 mb-3">
                    Load a previously exported combat file. This will replace your current combat.
                  </p>
                  <div className="space-y-2">
                    <label className={`${secondaryButton} w-full flex items-center justify-center gap-2 cursor-pointer`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M11.47 13.28a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06L12.75 10.94V1.5a.75.75 0 00-1.5 0v9.44L8.03 7.72a.75.75 0 00-1.06 1.06l4.5 4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                      </svg>
                      Choose Combat File
                      <input
                        type="file"
                        accept=".json"
                        onChange={importCombat}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowExportImport(false)}
                    className={secondaryButton}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          mode={authMode}
          onSwitchMode={setAuthMode}
        />

        {/* Saved Combats Modal */}
        {isSignedIn && (
          <SavedCombats
            isOpen={showSavedCombats}
            onClose={() => setShowSavedCombats(false)}
            onLoadCombat={loadSavedCombat}
            currentCombatState={{
              combatants,
              turnIndex,
              round,
              timer,
            }}
            currentlyLoadedCombatId={currentlyLoadedCombatId}
            showSuccess={showSuccess}
            showError={showError}
          />
        )}
      </main>
      
      {/* Navigation Buttons */}
      {combatants.length >= 2 && (
        <div className="fixed bottom-4 right-4 flex gap-2 z-40">
          <button onClick={previousTurn} className={secondaryButton}>
            Previous Turn
          </button>
          <button onClick={nextTurn} className={primaryButton}>
            Next Turn
          </button>
        </div>
      )}
      
      {/* Modals - Rendered at page level to avoid stacking context issues */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        onSwitchMode={setAuthMode}
      />

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
      />

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />

      {/* Saved Combats Modal */}
      {isSignedIn && (
        <SavedCombats
          isOpen={showSavedCombats}
          onClose={() => setShowSavedCombats(false)}
          onLoadCombat={loadSavedCombat}
          currentCombatState={{
            combatants,
            turnIndex,
            round,
            timer,
          }}
          currentlyLoadedCombatId={currentlyLoadedCombatId}
          showSuccess={showSuccess}
          showError={showError}
        />
      )}
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
