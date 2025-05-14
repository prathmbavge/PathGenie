// src/utils/toastUtils.js

import { toast } from 'react-hot-toast';

/**
 * Displays a success toast message.
 *
 * @function showSuccessToast
 * @param {string} message - The message to display in the success toast.
 */
export const showSuccessToast = (message) => {
  toast.success(message);
};

/**
 * Displays an error toast message.
 *
 * @function showErrorToast
 * @param {string} message - The message to display in the error toast.
 */
export const showErrorToast = (message) => {
  toast.error(message);
};

/**
 * Displays an info toast message.
 *
 * @function showInfoToast
 * @param {string} message - The message to display in the info toast.
 */
export const showInfoToast = (message) => {
  toast(message); // Default toast for info
};