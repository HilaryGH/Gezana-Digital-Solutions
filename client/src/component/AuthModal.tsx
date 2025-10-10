import React from "react";
import LoginForm from "./LoginForm";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Transparent background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Modal content */}
      <div 
        className="relative z-10 w-full max-w-md pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-orange-500 text-white p-8 rounded-2xl shadow-xl">
          <LoginForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
