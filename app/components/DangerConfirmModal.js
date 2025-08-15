"use client";

import { useState } from "react";

export default function DangerConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() === "confirm") {
      setIsDeleting(true);
      try {
        await onConfirm();
        onClose();
      } catch (error) {
        console.error("Delete failed:", error);
      } finally {
        setIsDeleting(false);
        setConfirmText("");
      }
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const isConfirmValid = confirmText.toLowerCase() === "confirm";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-6 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{message}</p>
          <p className="text-sm font-medium text-gray-900 mb-4">
            <span className="font-semibold">"{itemName}"</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            This action cannot be undone. Please type{" "}
            <span className="font-semibold text-red-600">confirm</span> to
            proceed.
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'confirm' to delete"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            disabled={isDeleting}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmValid || isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
