// mindmapApi.js
import axiosInstance from './axiosInstance';

export const getAllMindmaps = async () => {
  const response = await axiosInstance.get('/mindmaps');
  return response.data;
};

export const createMindmap = async (title) => {
  const response = await axiosInstance.post('/mindmaps', { title });
  return response.data;
};

export const getMindmap = async (mindmapId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}`);
  return response.data;
};

export const expandNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.post(`/mindmaps/${mindmapId}/nodes/${nodeId}/expand`);
  return response.data;
};

export const getNodeResources = async (mindmapId, nodeId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}/nodes/${nodeId}/resources`);
  return response.data;
};

export const updateNode = async (mindmapId, nodeId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}/nodes/${nodeId}`, data);
  return response.data;
};

export const deleteNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.delete(`/mindmaps/${mindmapId}/nodes/${nodeId}`);
  return response.data;
};

export const updateMindmap = async (mindmapId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}`, data);
  return response.data;
};

export const downloadResources = async (nodeId, format, signal) => {
  const response = await axiosInstance.post(
    `/mindmaps/nodes/${nodeId}/download-resources`,
    { format },
    {
      responseType: 'blob', // Ensure the response is treated as a blob
      signal, // Pass the AbortController signal for request cancellation
    }
  );
  return response; // Return the full response to access headers
};

export const deleteMindmap = async (mindmapId) => {
  const response = await axiosInstance.delete(`/mindmaps/${mindmapId}`);
  return response.data;
};