import axiosInstance from './axiosInstance';

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/api/user/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axiosInstance.put('/api/user/profile', data);
  return response.data;
};