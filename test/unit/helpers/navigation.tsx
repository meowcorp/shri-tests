import React from "react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";

export const wrapWithNavigationProvider = (
  children: React.ReactChild,
  props: MemoryRouterProps = {}
) => {
  return <MemoryRouter {...props}>{children}</MemoryRouter>;
};
