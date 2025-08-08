import React from 'react';
import { BrowserRouter } from 'react-router-dom';

export const AllTheProviders = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};
