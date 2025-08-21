import React from 'react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportName?: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reportName
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-md w-[400px] shadow-[0px_18px_34px_0px_rgba(14,30,62,0.12)] border border-white border-opacity-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-[#e6e9ec]">
          <div className="px-6 py-5">
            <h2 className="text-[20px] leading-[28px] font-medium text-[#092540] font-dm-sans">
              Delete this report?
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pt-4 pb-6">
          <p className="text-[16px] leading-[22px] font-normal text-[#3a5166] font-dm-sans">
            Are you sure you want to delete this? You won't be able to get it back.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-[#e6e9ec] px-6 py-3 flex items-center justify-between">
          <button
            className="px-4 py-2 rounded-[18px] text-[14px] leading-[20px] font-medium text-[#195afe] font-dm-sans hover:bg-gray-50 transition-colors duration-150"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-[18px] text-[14px] leading-[20px] font-bold text-white bg-[#e60061] hover:bg-[#d1005a] active:bg-[#bc0051] font-dm-sans transition-colors duration-150"
            onClick={onConfirm}
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
