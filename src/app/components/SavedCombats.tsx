"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { SavedCombat, CombatState } from '@/types/database';
import { clientCombatDB } from '@/utils/clientCombatDB';
import { primaryButton, secondaryButton, smallDanger, smallSecondary } from '@/styles/buttonStyles';

interface SavedCombatsProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadCombat: (combat: CombatState) => void;
  currentCombatState: CombatState;
  showSuccess: (message: string, duration?: number) => string;
  showError: (message: string, duration?: number) => string;
}

export default function SavedCombats({ 
  isOpen, 
  onClose, 
  onLoadCombat, 
  currentCombatState,
  showSuccess,
  showError 
}: SavedCombatsProps) {
  const { user } = useUser();
  const [savedCombats, setSavedCombats] = useState<SavedCombat[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [showMigration, setShowMigration] = useState(false);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchSavedCombats();
      // Check if there's localStorage data to migrate
      checkForLocalStorageData();
    }
  }, [isOpen, user]);

  const checkForLocalStorageData = async () => {
    if (!user) return;
    try {
      const localData = await clientCombatDB.getUserCombats(user.id);
      if (localData && localData.length > 0) {
        setShowMigration(true);
      }
    } catch (err) {
      console.log('No local data to migrate');
    }
  };

  const migrateLocalStorageData = async () => {
    if (!user) return;
    
    setMigrating(true);
    try {
      // Get existing localStorage data
      const localData = await clientCombatDB.getUserCombats(user.id);
      
      if (localData.length === 0) {
        setShowMigration(false);
        return;
      }
      
      // Migrate each combat to the database
      for (const combat of localData) {
        await fetch('/api/combats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: combat.name,
            description: combat.description,
            combat_data: combat.combat_data,
          }),
        });
      }
      
      // Clear localStorage after successful migration
      localStorage.removeItem(`saved_combats_${user.id}`);
      setShowMigration(false);
      fetchSavedCombats();
      showSuccess(`Successfully migrated ${localData.length} combat(s) to the cloud!`);
    } catch (error) {
      console.error('Migration failed:', error);
      showError('Failed to migrate local data');
    } finally {
      setMigrating(false);
    }
  };

  const fetchSavedCombats = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/combats');
      if (response.ok) {
        const combats = await response.json();
        setSavedCombats(combats);
      } else {
        showError('Failed to load saved combats');
      }
    } catch (err) {
      showError('Error loading saved combats');
      console.error('Error fetching saved combats:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveCombat = async () => {
    if (!saveName.trim() || !user) {
      showError('Combat name is required');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/combats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: saveName.trim(),
          description: saveDescription.trim() || undefined,
          combat_data: currentCombatState,
        }),
      });

      if (response.ok) {
        setSaveName('');
        setSaveDescription('');
        setShowSaveForm(false);
        fetchSavedCombats();
        showSuccess('Combat saved successfully!');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Failed to save combat');
      }
    } catch (err) {
      showError('Error saving combat');
      console.error('Error saving combat:', err);
    } finally {
      setSaving(false);
    }
  };

  const deleteCombat = async (id: string) => {
    if (!confirm('Are you sure you want to delete this combat?') || !user) return;

    try {
      const response = await fetch(`/api/combats?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSavedCombats();
        showSuccess('Combat deleted successfully!');
      } else {
        showError('Failed to delete combat');
      }
    } catch (err) {
      showError('Error deleting combat');
      console.error('Error deleting combat:', err);
    }
  };

  const loadCombat = (combat: SavedCombat) => {
    onLoadCombat(combat.combat_data);
    showSuccess(`Loaded "${combat.name}" successfully!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col border border-gray-600">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
              <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
            </svg>
            My Saved Combats
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Migration Section */}
        {showMigration && (
          <div className="mb-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">Local Data Found</h3>
            <p className="text-sm text-yellow-200 mb-3">
              We found saved combats in your browser's local storage. Would you like to migrate them to the cloud database?
            </p>
            <div className="flex gap-2">
              <button
                onClick={migrateLocalStorageData}
                disabled={migrating}
                className={primaryButton}
              >
                {migrating ? 'Migrating...' : 'Migrate to Cloud'}
              </button>
              <button
                onClick={() => setShowMigration(false)}
                className={secondaryButton}
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Save Current Combat Section */}
        <div className="mb-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-300">Save Current Combat</h3>
            <button
              onClick={() => setShowSaveForm(!showSaveForm)}
              className={smallSecondary}
            >
              {showSaveForm ? 'Cancel' : 'Save Combat'}
            </button>
          </div>
          
          {showSaveForm && (
            <div className="space-y-3 mt-3">
              <input
                type="text"
                placeholder="Combat name (required)"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveCombat}
                  disabled={saving}
                  className={primaryButton}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setShowSaveForm(false)}
                  className={secondaryButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Saved Combats List */}
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-300 mb-3">Saved Combats</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : savedCombats.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">No saved combats yet</div>
              <div className="text-sm text-gray-500 mt-2">Save your current combat to get started</div>
            </div>
          ) : (
            <div className="space-y-3">
              {savedCombats.map((combat) => (
                <div key={combat.id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{combat.name}</h4>
                      {combat.description && (
                        <p className="text-sm text-gray-400 mt-1">{combat.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <div>
                          {combat.combat_data.combatants.length} combatant{combat.combat_data.combatants.length !== 1 ? 's' : ''} • 
                          Round {combat.combat_data.round}
                        </div>
                        <div>Saved: {new Date(combat.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => loadCombat(combat)}
                        className={smallSecondary}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteCombat(combat.id)}
                        className={smallDanger}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={secondaryButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
