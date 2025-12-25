import React from 'react';
import ErrorPage from '../../components/ErrorPage';

const UnprocessableEntity = () => (
  <ErrorPage
    statusCode={422}
    title="Validation Error"
    message="The data provided is invalid or incomplete. Please check your input and try again."
  />
);

export default UnprocessableEntity;