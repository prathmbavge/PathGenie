import axiosInstance from './axiosInstance';

export const getUserProfile = async () => {
  const response = await axiosInstance.get('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await axiosInstance.put('/user/profile', data);
  return response.data;
};