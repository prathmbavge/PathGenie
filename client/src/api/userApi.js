import axiosInstance from './axiosInstance';

/**
 * Fetches the user's profile data from the server.
 *
 * @async
 * @function getUserProfile
 * @returns {Promise<Object>} The user's profile data.
 * @throws Will throw an error if the request fails.
 */

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/user/profile');
  return response.data;
};

/**
 * Updates the user's profile data on the server.
 *
 * @async
 * @function updateUserProfile
 * @param {Object} data The profile data to update.
 * @returns {Promise<Object>} The updated user's profile data.
 * @throws Will throw an error if the request fails.
 */
export const updateUserProfile = async (data) => {
  const response = await axiosInstance.put('/user/profile', data);
  return response.data;
};