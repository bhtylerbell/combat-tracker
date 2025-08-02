"use client";

import { UserProfile } from '@clerk/nextjs';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-600 relative max-w-5xl w-full h-[95vh] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Profile Content */}
        <div className="h-full overflow-y-auto">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-semibold text-blue-400 mb-4 text-center">Account Settings</h2>
          </div>
          
          <div className="flex justify-center pb-6">
            <div className="w-full max-w-4xl px-6">
              <UserProfile 
                appearance={{
                  baseTheme: undefined,
                  elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none",
                  navbar: "bg-gray-700 border-gray-600",
                  navbarButton: "text-gray-300 hover:text-white hover:bg-gray-600",
                  navbarButtonActive: "text-blue-400 bg-gray-600",
                  pageScrollBox: "bg-transparent",
                  profileSectionTitleText: "text-white",
                  profileSectionContent: "text-gray-300",
                  formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                  formFieldInput: "bg-gray-700 border-gray-600 text-white",
                  formFieldLabel: "text-gray-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-400",
                  fileDropAreaBox: "bg-gray-700 border-gray-600",
                  fileDropAreaButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                  accordionTriggerButton: "text-white hover:bg-gray-700",
                  accordionContent: "bg-gray-800",
                  menuButton: "text-gray-300 hover:text-white hover:bg-gray-700",
                  menuList: "bg-gray-800 border-gray-600",
                  menuItem: "text-gray-300 hover:text-white hover:bg-gray-700",
                  badge: "bg-blue-600 text-white",
                  alertText: "text-gray-300",
                  dividerLine: "bg-gray-600",
                  dividerText: "text-gray-400",
                }
              }}
              routing="hash"
            />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}