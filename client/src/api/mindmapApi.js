// mindmapApi.js
import axiosInstance from './axiosInstance';

/**
 * Fetches all mindmaps from the server, regardless of their owner.
 *
 * @returns {Promise<Object[]>} A promise that resolves to an array of mindmap objects,
 *                              each containing the mindmap's ID, title, node count, and the ID of its owner.
 */
export const getAllMindmaps = async () => {
  const response = await axiosInstance.get('/mindmaps');
  return response.data;
};

/**
 * Creates a new mindmap with the given title.
 *
 * @param {string} title - The title of the mindmap to be created.
 * @returns {Promise<Object>} A promise that resolves to the created mindmap object,
 *                            containing details such as the mindmap's ID and title.
 */

export const createMindmap = async (title) => {
  const response = await axiosInstance.post('/mindmaps', { title });
  return response.data;
};

/**
 * Fetches the specified mindmap from the server.
 *
 * @param {string} mindmapId - The ID of the mindmap to be fetched.
 * @returns {Promise<Object>} A promise that resolves to the mindmap object,
 *                            containing details such as the mindmap's ID, title, and node count.
 */
export const getMindmap = async (mindmapId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}`);
  return response.data;
};

/**
 * Expands a node in the given mindmap, adding new nodes to the graph
 * if the node is not a leaf node.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node to be expanded.
 * @param {string} nodeId - The ID of the node to be expanded.
 * @returns {Promise<Object>} A promise that resolves to the updated mindmap object,
 *                            containing the expanded node and any new nodes added to the graph.
 */
export const expandNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.post(`/mindmaps/${mindmapId}/nodes/${nodeId}/expand`);
  return response.data;
};

/**
 * Fetches resources associated with a node in a mindmap.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node.
 * @param {string} nodeId - The ID of the node to fetch resources for.
 * @returns {Promise<Object>} A promise that resolves to an object containing the
 *                            resources associated with the specified node, keyed by
 *                            resource type.
 */
export const getNodeResources = async (mindmapId, nodeId) => {
  const response = await axiosInstance.get(`/mindmaps/${mindmapId}/nodes/${nodeId}/resources`);
  return response.data;
};

/**
 * Updates the specified node in the given mindmap with the given data.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node to be updated.
 * @param {string} nodeId - The ID of the node to be updated.
 * @param {Object} data - The data to update the node with, containing the fields to update.
 * @returns {Promise<Object>} A promise that resolves to the updated node object.
 */
export const updateNode = async (mindmapId, nodeId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}/nodes/${nodeId}`, data);
  return response.data;
};

/**
 * Deletes the specified node from the given mindmap.
 *
 * @param {string} mindmapId - The ID of the mindmap containing the node to be deleted.
 * @param {string} nodeId - The ID of the node to be deleted.
 * @returns {Promise<Object>} A promise that resolves to the updated mindmap object.
 */

export const deleteNode = async (mindmapId, nodeId) => {
  const response = await axiosInstance.delete(`/mindmaps/${mindmapId}/nodes/${nodeId}`);
  return response.data;
};

/**
 * Updates the specified mindmap with the given data.
 *
 * @param {string} mindmapId - The ID of the mindmap to be updated.
 * @param {Object} data - The data to update the mindmap with, containing the fields to update.
 * @returns {Promise<Object>} A promise that resolves to the updated mindmap object.
 */
export const updateMindmap = async (mindmapId, data) => {
  const response = await axiosInstance.put(`/mindmaps/${mindmapId}`, data);
  return response.data;
};

/**
 * Downloads resources associated with the given node in the given format.
 *
 * @param {string} nodeId - The ID of the node whose resources are to be downloaded.
 * @param {string} format - The format of the resources to be downloaded (e.g. 'pdf', 'zip').
 * @param {AbortSignal} signal - An AbortController signal for request cancellation.
 * @returns {Promise<AxiosResponse<Blob>>} A promise that resolves to the response containing the downloaded resources.
 */
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

/**
 * Deletes the specified mindmap from the server.
 *
 * @param {string} mindmapId - The ID of the mindmap to be deleted.
 * @returns {Promise<Object>} A promise that resolves to the deleted mindmap object.
 */
export const deleteMindmap = async (mindmapId) => {
  const response = await axiosInstance.delete(`/mindmaps/${mindmapId}`);
  return response.data;
};