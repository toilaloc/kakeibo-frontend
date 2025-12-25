// HTTP status code error mapping
export const handleHttpError = async (response) => {
  if (!response.ok) {
    let errorMessage = 'An error occurred';
    let errorType = 'Unknown';

    switch (response.status) {
      case 400:
        errorType = 'BadRequest';
        errorMessage = 'Bad Request';
        break;
      case 401:
        errorType = 'Unauthorized';
        errorMessage = 'Unauthorized';
        break;
      case 403:
        errorType = 'Forbidden';
        errorMessage = 'Forbidden';
        break;
      case 404:
        errorType = 'NotFound';
        errorMessage = 'Not Found';
        break;
      case 422:
        errorType = 'UnprocessableEntity';
        errorMessage = 'Unprocessable Entity';
        break;
      case 500:
        errorType = 'ServerError';
        errorMessage = 'Internal Server Error';
        break;
      case 502:
        errorType = 'ServerError';
        errorMessage = 'Bad Gateway';
        break;
      case 503:
        errorType = 'ServerError';
        errorMessage = 'Service Unavailable';
        break;
      default:
        errorMessage = `HTTP ${response.status}`;
    }

    // Check for JSON error response
    try {
      const errorData = await response.json();
      if (errorData.error === 'Unauthorized') {
        errorType = 'Unauthorized';
        errorMessage = 'Unauthorized';
      }
    } catch (e) {
      // If not JSON, use the status-based error
    }

    const error = new Error(errorMessage);
    error.statusCode = response.status;
    error.type = errorType;
    throw error;
  }
};