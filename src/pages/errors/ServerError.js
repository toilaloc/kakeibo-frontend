import React from 'react';
import ErrorPage from '../../components/ErrorPage';

const ServerError = () => (
  <ErrorPage
    statusCode={500}
    title="Internal Server Error"
    message="Something went wrong on our end. Please try again later."
  />
);

export default ServerError;