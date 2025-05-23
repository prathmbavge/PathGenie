import { showErrorToast } from './toastUtils';

/**
 * Handles API requests with loading state and error handling.
 *
 * @async
 * @function requestHandler
 * @param {Function} apiCall - The API call function to be executed.
 * @param {Function} [setLoading] - Optional function to set loading state.
 * @param {Function} onSuccess - Callback function to be called on successful API response.
 * @throws Will throw an error if the API call fails.
 */
export const requestHandler = async (apiCall, setLoading, onSuccess) => {
  setLoading && setLoading(true);

  try {
    const response = await apiCall();
    if (response?.success) {
      onSuccess(response);
    }
  } catch (error) {
    showErrorToast(error?.response?.data?.error || 'Something went wrong ! ');
  } finally {
    setLoading && setLoading(false);
  }
};

/**
 * Check if the code is running in a browser environment.
 *
 * @constant
 * @type {boolean}
 */
export const isBrowser = typeof window !== 'undefined';