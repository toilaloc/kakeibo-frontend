import React from 'react';
import ErrorPage from '../../components/ErrorPage';

const NotFound = () => (
  <ErrorPage
    statusCode={404}
    title="Page Not Found"
    message="The page you're looking for doesn't exist or has been moved."
  />
);

export default NotFound;