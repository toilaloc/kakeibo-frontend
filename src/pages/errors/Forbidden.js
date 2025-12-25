import React from 'react';
import ErrorPage from '../../components/ErrorPage';

const Forbidden = () => (
  <ErrorPage
    statusCode={403}
    title="Access Forbidden"
    message="You don't have permission to access this resource."
  />
);

export default Forbidden;