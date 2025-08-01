"use client";

import { useAdminRole } from '@/hooks/useAdminRole';
import { useState, useEffect } from 'react';
import { primaryButton, secondaryButton, smallDanger } from '@/styles/buttonStyles';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SystemStats {
  totalUsers: number;
  totalCombats: number;
  activeUsers: number;
  storageUsed: string;
}

interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  createdAt: string;
  lastSignIn?: string;
}

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const { isAdmin, isSuperAdmin } = useAdminRole();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'stats' | 'system'>('users');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    if (isOpen && isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isOpen, isAdmin]);

  if (!isAdmin || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-600 relative max-w-6xl w-full h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-400">
                <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819L3.05 7.05a1.875 1.875 0 00-.819 2.282l.382 1.017c.043.116.032.284-.083.45a7.493 7.493 0 00-.57.986c-.088.182-.228.277-.348.297L.567 12.25c-.904.151-1.567.933-1.567 1.85v1.8c0 .917.663 1.699 1.567 1.85l1.072.178c.12.02.26.115.348.297.18.331.374.65.57.986.115.166.126.334.083.45l-.382 1.017a1.875 1.875 0 00.819 2.282l.723.723c.77.77 2.019.77 2.788 0l.723-.723a1.875 1.875 0 002.282-.819l.382-1.017c.043-.116.032-.284-.083-.45a7.493 7.493 0 00-.57-.986c-.088-.182-.228-.277-.348-.297L12.25 16.433c-.904-.151-1.567-.933-1.567-1.85v-1.8c0-.917.663-1.699 1.567-1.85l1.072-.178c.12-.02.26-.115.348-.297.18-.331.374-.65.57-.986.115-.166.126-.334.083-.45l-.382-1.017a1.875 1.875 0 00-.819-2.282L12.4 5.5a1.875 1.875 0 00-2.282.819l-.382 1.017c-.043.116-.032.284.083.45.18.331.374.65.57.986.088.182.228.277.348.297l1.072.178c.904.151 1.567.933 1.567 1.85v1.8z" clipRule="evenodd" />
              </svg>
              <h2 className="text-xl font-semibold text-blue-400">Admin Panel (Under Development)</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'system'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              System
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full">
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">User Management</h3>
                <button
                  onClick={fetchUsers}
                  className={secondaryButton}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-400">Loading users...</div>
                </div>
              ) : (
                <div className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 text-gray-300 font-semibold text-sm">
                    <div>User</div>
                    <div>Role</div>
                    <div>Joined</div>
                    <div>Actions</div>
                  </div>
                  <div className="divide-y divide-gray-700">
                    {users.map((user) => (
                      <div key={user.id} className="grid grid-cols-4 gap-4 p-4 items-center">
                        <div>
                          <div className="text-white font-medium">
                            {user.firstName || user.lastName 
                              ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                              : user.email
                            }
                          </div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                        <div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' || user.role === 'super_admin'
                              ? 'bg-blue-900 text-blue-200'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {isSuperAdmin && user.role !== 'super_admin' && (
                            <button
                              className={secondaryButton}
                              onClick={() => {/* TODO: Role management */}}
                            >
                              Edit Role
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Statistics</h3>
              
              {stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-400">{stats.totalUsers}</div>
                    <div className="text-sm text-gray-400">Total Users</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{stats.totalCombats}</div>
                    <div className="text-sm text-gray-400">Total Combats</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400">{stats.activeUsers}</div>
                    <div className="text-sm text-gray-400">Active Users</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-400">{stats.storageUsed}</div>
                    <div className="text-sm text-gray-400">Storage Used</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">Loading statistics...</div>
              )}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">System Management</h3>
              
              <div className="grid gap-4">
                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Database Operations</h4>
                  <div className="flex gap-2">
                    <button className={secondaryButton}>
                      View Logs
                    </button>
                    <button className={secondaryButton}>
                      Export Data
                    </button>
                    {isSuperAdmin && (
                      <button className={smallDanger}>
                        Maintenance Mode
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-900 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Content Management</h4>
                  <div className="flex gap-2">
                    <button className={secondaryButton}>
                      Featured Combats
                    </button>
                    <button className={secondaryButton}>
                      Content Reports
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
