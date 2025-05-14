import axios from 'axios';
import costants from '../../constants'

/**
 * Create an Axios instance with custom configuration.
 *
 * The Axios instance is configured to:
 * - Include credentials in requests.
 * @module axiosInstance
 * @returns {AxiosInstance} The configured Axios instance.
 */
const axiosInstance = axios.create({
  baseURL: costants.serverUrl,
  withCredentials: true
});

export default axiosInstance;