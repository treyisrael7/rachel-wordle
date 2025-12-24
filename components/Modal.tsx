'use client';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  message,
  buttonText,
  onButtonClick,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
        <p className="text-gray-700 mb-6 text-center">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={() => {
              onButtonClick();
              onClose();
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}

