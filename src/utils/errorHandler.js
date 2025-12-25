/**
 * Common error handler utility for navigating to appropriate error pages
 * @param {string} error - The error type
 * @param {function} navigate - React Router navigate function
 */
export const handleApiError = (error, navigate) => {
  if (!error) return;

  switch (error) {
    case 'Unauthorized':
      navigate('/unauthorized');
      break;
    case 'Forbidden':
      navigate('/forbidden');
      break;
    case 'NotFound':
      navigate('/not-found');
      break;
    case 'BadRequest':
      navigate('/bad-request');
      break;
    case 'UnprocessableEntity':
      navigate('/unprocessable-entity');
      break;
    case 'ServerError':
      navigate('/server-error');
      break;
    default:
      // For unknown errors, stay on the page or show generic error
      console.warn('Unknown error type:', error);
      break;
  }
};