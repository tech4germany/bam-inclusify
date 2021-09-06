import React, { FC } from "react";
import styled from "styled-components";

export const TaskpaneApp: FC = () => (
  <div>
    <TaskpaneHeading>Taskpane Page</TaskpaneHeading>
    <p>This page is the TASKPANE entrypoint</p>
  </div>
);

const TaskpaneHeading = styled.h1`
  color: darkgreen;
`;
