import toast from 'react-hot-toast';

/**
 * Handles API requests with toast-based loader and success/error notifications.
 *
 * @async
 * @function requestHandler
 * @param {() => Promise<any>} apiCall - The asynchronous API call function.
 * @param {(loading: boolean) => void} [setLoading] - Optional setter to manage local loading state.
 * @param {string} [message='Please wait…'] - Message to show while loading.
 * @param {(response: any) => void} [onSuccess] - Callback on successful response.
 * @param {(error: any) => void} [onError] - Callback on failure.
 * @param {boolean} [isDisplaySuccess=true] - Flag to control success toast display.
 * @param {boolean} [isDisplayError=true] - Flag to control error toast display.
 * @returns {Promise<void>}
 */
export const requestHandler = async (
  apiCall,
  setLoading,
  message = 'Please wait…',
  onSuccess,
  onError,
  isDisplaySuccess = true,
  isDisplayError = true,
) => {
  // 1️⃣ Set local loading state (if provided)
  setLoading?.(true);

  try {
    const response = await toast.promise(apiCall(), {
      loading: message,
      success: (response) => {

        const successMsg = response?.message || 'Operation successful!';
        onSuccess?.(response);
        return isDisplaySuccess ? successMsg : null;
      },
      error: (err) => {
        const errorMsg =
          err?.response?.data?.error || err?.message || 'Something went wrong!';
        onError?.(err);
        return isDisplayError ? errorMsg : null;
      },
    });

    // Handle non-success responses (e.g., success: false or status >= 400)
    const success = response?.success ?? response?.status < 400;
    if (!success) {
      const errorMsg =
        response?.message ||
        response?.data?.error ||
        'Unexpected response from server.';
      onError?.(response);
      if (isDisplayError) {
        toast.error(errorMsg);
      }
    }
  } catch (err) {
    onError?.(err);
  } finally {
    setLoading?.(false); // 5️⃣ End loading state
  }
};