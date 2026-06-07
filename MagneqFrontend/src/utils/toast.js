import { toast } from 'react-hot-toast';

// Success notifications
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-center',
  });
};

// Error notifications
export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-center',
  });
};

// Info notifications
export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-center',
  });
};

// Warning notifications
export const showWarning = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-center',
    icon: '⚠️',
  });
};

// Loading notifications
export const showLoading = (message) => {
  return toast.loading(message, {
    position: 'top-center',
  });
};

// Dismiss loading toast
export const dismissLoading = (toastId) => {
  toast.dismiss(toastId);
};

// Success with loading
export const showSuccessWithLoading = (toastId, message) => {
  toast.success(message, {
    id: toastId,
    duration: 3000,
  });
};

// Error with loading
export const showErrorWithLoading = (toastId, message) => {
  toast.error(message, {
    id: toastId,
    duration: 4000,
  });
}; 