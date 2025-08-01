"use client";

import { useUser, SignOutButton } from '@clerk/nextjs';
import { useState } from 'react';
import UserProfileModal from '@/components/UserProfileModal';
import AdminPanel from '@/components/AdminPanel';
import { useAdminRole } from '@/hooks/useAdminRole';
import { smallSecondary, smallDanger } from '@/styles/buttonStyles';

interface UserProfileProps {
  onManageCombats: () => void;
}

export default function UserProfile({ onManageCombats }: UserProfileProps) {
  const { user, isLoaded } = useUser();
  const { isAdmin } = useAdminRole();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (!isLoaded || !user) return null;

  const displayName = user.firstName || user.username || user.emailAddresses[0]?.emailAddress || 'User';

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-2 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors w-full"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white truncate">{displayName}</div>
            {isAdmin && (
              <span className="px-1.5 py-0.5 bg-red-800 text-white text-xs font-medium rounded-full">
                Admin
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400 truncate">
            {user.emailAddresses[0]?.emailAddress}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
        >
          <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10">
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                onManageCombats();
                setShowDropdown(false);
              }}
              className={`${smallSecondary} w-full flex items-center justify-start gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" />
                <path d="M12.971 1.816A5.23 5.23 0 0114.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 013.434 1.279 9.768 9.768 0 00-6.963-6.963z" />
              </svg>
              My Saved Combats
            </button>
            <button
              onClick={() => {
                setShowProfileModal(true);
                setShowDropdown(false);
              }}
              className={`${smallSecondary} w-full flex items-center justify-start gap-2`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
              Account Settings
            </button>
            {isAdmin && (
              <button
                onClick={() => {
                  setShowAdminPanel(true);
                  setShowDropdown(false);
                }}
                className={`${smallSecondary} w-full flex items-center justify-start gap-2`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819L3.05 7.05a1.875 1.875 0 00-.819 2.282l.382 1.017c.043.116.032.284-.083.45a7.493 7.493 0 00-.57.986c-.088.182-.228.277-.348.297L.567 12.25c-.904.151-1.567.933-1.567 1.85v1.8c0 .917.663 1.699 1.567 1.85l1.072.178c.12.02.26.115.348.297.18.331.374.65.57.986.115.166.126.334.083.45l-.382 1.017a1.875 1.875 0 00.819 2.282l.723.723c.77.77 2.019.77 2.788 0l.723-.723a1.875 1.875 0 002.282-.819l.382-1.017c.043-.116.032-.284-.083-.45a7.493 7.493 0 00-.57-.986c-.088-.182-.228-.277-.348-.297L12.25 16.433c-.904-.151-1.567-.933-1.567-1.85v-1.8c0-.917.663-1.699 1.567-1.85l1.072-.178c.12-.02.26-.115.348-.297.18-.331.374-.65.57-.986.115-.166.126-.334.083-.45l-.382-1.017a1.875 1.875 0 00-.819-2.282L12.4 5.5a1.875 1.875 0 00-2.282.819l-.382 1.017c-.043.116-.032.284.083.45.18.331.374.65.57.986.088.182.228.277.348.297l1.072.178c.904.151 1.567.933 1.567 1.85v1.8z" clipRule="evenodd" />
                </svg>
                Admin Panel
              </button>
            )}
            <SignOutButton>
              <button className={`${smallDanger} w-full flex items-center justify-start gap-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5a1.5 1.5 0 001.5 1.5h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm10.72 4.72a.75.75 0 011.06 0l3 3a.75.75 0 010 1.06l-3 3a.75.75 0 11-1.06-1.06l1.72-1.72H9a.75.75 0 010-1.5h10.94l-1.72-1.72a.75.75 0 010-1.06z" clipRule="evenodd" />
                </svg>
                Sign Out
              </button>
            </SignOutButton>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <UserProfileModal 
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      {/* Admin Panel */}
      <AdminPanel 
        isOpen={showAdminPanel}
        onClose={() => setShowAdminPanel(false)}
      />
    </div>
  );
}
