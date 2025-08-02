"use client";

import { useState } from 'react';
import { primaryButton, secondaryButton, dangerButton } from '@/styles/buttonStyles';

interface RoleManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    banned?: boolean;
  };
  currentUserRole: string;
  onRoleUpdated: () => void;
}

export default function RoleManagementModal({ 
  isOpen, 
  onClose, 
  user, 
  currentUserRole,
  onRoleUpdated 
}: RoleManagementModalProps) {
  const [selectedRole, setSelectedRole] = useState(user.role || 'user');
  const [updating, setUpdating] = useState(false);
  const [banning, setBanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { value: 'user', label: 'User', description: 'Regular user access' },
    { value: 'moderator', label: 'Moderator', description: 'Can moderate content' },
    { value: 'admin', label: 'Admin', description: 'Full admin access' },
  ];

  // Filter roles based on current user permissions
  const availableRoles = roles.filter(role => {
    if (currentUserRole === 'super_admin') return true;
    if (currentUserRole === 'admin') return role.value !== 'admin';
    return false;
  });

  const handleUpdateRole = async () => {
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setUpdating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: user.id,
          newRole: selectedRole,
        }),
      });

      if (response.ok) {
        onRoleUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update role');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setUpdating(false);
    }
  };

  const handleBanToggle = async () => {
    setBanning(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/user-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: user.id,
          action: user.banned ? 'unban' : 'ban',
        }),
      });

      if (response.ok) {
        onRoleUpdated();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update user status');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setBanning(false);
    }
  };

  if (!isOpen) return null;

  const displayName = user.firstName || user.lastName 
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : user.email;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000] p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-600 relative max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-blue-400">Manage User</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="text-white font-medium">{displayName}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                Current role: <span className="text-blue-400">{user.role || 'user'}</span>
              </span>
              {user.banned && (
                <span className="px-2 py-0.5 bg-red-900 text-red-200 text-xs rounded-full">
                  Banned
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Role Management */}
          <div className="space-y-3 mb-6">
            <label className="text-sm font-medium text-gray-300">Role:</label>
            {availableRoles.map((role) => (
              <label key={role.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                />
                <div>
                  <div className="text-white font-medium">{role.label}</div>
                  <div className="text-xs text-gray-400">{role.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {/* Role Update */}
            <div className="flex gap-2">
              <button
                onClick={handleUpdateRole}
                disabled={updating || selectedRole === user.role}
                className={primaryButton}
              >
                {updating ? 'Updating...' : 'Update Role'}
              </button>
            </div>

            {/* Ban/Unban */}
            {user.role !== 'super_admin' && (
              <div className="pt-3 border-t border-gray-700">
                <button
                  onClick={handleBanToggle}
                  disabled={banning}
                  className={user.banned ? secondaryButton : dangerButton}
                >
                  {banning ? 'Processing...' : user.banned ? 'Unban User' : 'Ban User'}
                </button>
                <div className="text-xs text-gray-500 mt-1">
                  {user.banned ? 'This user is currently banned from the platform' : 'Banning will prevent the user from accessing the platform'}
                </div>
              </div>
            )}

            {/* Cancel */}
            <div className="pt-2">
              <button
                onClick={onClose}
                className={secondaryButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
