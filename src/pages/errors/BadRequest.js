import React from 'react';
import ErrorPage from '../../components/ErrorPage';

const BadRequest = () => (
  <ErrorPage
    statusCode={400}
    title="Bad Request"
    message="The request could not be understood by the server due to malformed syntax."
  />
);

export default BadRequest;