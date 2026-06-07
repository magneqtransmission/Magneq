import React from "react";
import { IoMdClose } from "react-icons/io";
import Button from "../buttons/Button";

/**
 * Units Update Confirmation Dialog
 * 
 * A dialog component for confirming how to update finished good units.
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {function} props.onClose - Function to close the dialog
 * @param {function} props.onConfirm - Function called with the selected option ('add' or 'set')
 * @param {number} props.previousQty - Previous quantity value
 * @param {number} props.enteredQty - Entered quantity value
 * @param {string} props.modelNumber - Model number of the finished good
 */
const UnitsUpdateConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  previousQty,
  enteredQty,
  modelNumber,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAdd = () => {
    onConfirm("add");
    onClose();
  };

  const handleSet = () => {
    onConfirm("set");
    onClose();
  };

  const newTotal = previousQty + enteredQty;

  return (
    <div
      className="fixed inset-0 bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Confirm Units Update
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close dialog"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Model Number:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {modelNumber || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Previous Quantity:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {previousQty}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Entered Quantity:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {enteredQty}
              </span>
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {enteredQty > previousQty ? (
                <>
                  The entered quantity ({enteredQty}) is greater than the previous quantity ({previousQty}).
                  How would you like to proceed?
                </>
              ) : enteredQty < previousQty ? (
                <>
                  The entered quantity ({enteredQty}) is less than the previous quantity ({previousQty}).
                  How would you like to proceed?
                </>
              ) : (
                <>
                  The entered quantity ({enteredQty}) is equal to the previous quantity ({previousQty}).
                  How would you like to proceed?
                </>
              )}
            </p>

            {/* Option 1: Add to Previous */}
            <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Add to Previous Stock
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Add the entered quantity to the existing stock.
                  </p>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">Calculation: </span>
                    {previousQty} + {enteredQty} = <span className="text-blue-600 dark:text-blue-400 font-bold">{newTotal}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    New total quantity will be <strong>{newTotal}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Set as Whole */}
            <div className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Set as Final Quantity
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Replace the previous quantity with the entered value.
                  </p>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">Final quantity: </span>
                    <span className="text-green-600 dark:text-green-400 font-bold">{enteredQty}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Previous quantity ({previousQty}) will be replaced
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add to Previous ({newTotal})
            </Button>
            <Button
              variant="primary"
              onClick={handleSet}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Set as Final ({enteredQty})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitsUpdateConfirmDialog;

