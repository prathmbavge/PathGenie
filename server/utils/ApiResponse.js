export default class ApiResponse {
  /**
   * Constructor for ApiResponse class.
   *
   * @param {number} status - The status code of the response.
   * @param {any} data - The data to be included in the response.
   * @param {string} [message='Success'] - The message associated with the response.
   */
  constructor(status, data, message = 'Success') {
    this.status = status;
    this.data = data;
    this.message = message;
    this.success = status < 400;
  }
}

