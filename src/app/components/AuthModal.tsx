"use client";

import { SignIn, SignUp } from '@clerk/nextjs';
import { secondaryButton } from '@/styles/buttonStyles';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'sign-in' | 'sign-up';
  onSwitchMode: (mode: 'sign-in' | 'sign-up') => void;
}

export default function AuthModal({ isOpen, onClose, mode, onSwitchMode }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-600 relative max-w-md w-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>

        <div className="mt-4">
          {mode === 'sign-in' ? (
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-4 text-center">Sign In</h2>
              <SignIn 
                appearance={{
                  baseTheme: undefined,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    formFieldInput: "bg-gray-700 border-gray-600 text-white",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton: "text-blue-400",
                  }
                }}
                routing="hash"
                signUpUrl="#sign-up"
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => onSwitchMode('sign-up')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-blue-400 mb-4 text-center">Create Account</h2>
              <SignUp 
                appearance={{
                  baseTheme: undefined,
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white",
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    formFieldInput: "bg-gray-700 border-gray-600 text-white",
                    identityPreviewText: "text-white",
                    identityPreviewEditButton: "text-blue-400",
                  }
                }}
                routing="hash"
                signInUrl="#sign-in"
              />
              <div className="mt-4 text-center">
                <button
                  onClick={() => onSwitchMode('sign-in')}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
