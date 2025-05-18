import axios from 'axios';
import costants from '../../constants'
const axiosInstance = axios.create({
  baseURL: `${costants.serverUrl}/api`,
  withCredentials: true
});

export default axiosInstance;