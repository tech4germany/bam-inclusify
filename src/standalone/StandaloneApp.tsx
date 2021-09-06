import React, { FC } from "react";
import styled from "styled-components";

export const StandaloneApp: FC = () => (
  <div>
    <StandaloneHeading>Standalone Page</StandaloneHeading>
    <p>This page is the standalone entrypoint</p>
  </div>
);

const StandaloneHeading = styled.h1`
  color: darkblue;
`;
