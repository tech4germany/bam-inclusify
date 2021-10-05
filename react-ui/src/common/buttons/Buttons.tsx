import React, { FC } from "react";
import styled from "styled-components";
import { Colors } from "../Colors";

export const BaseButton = styled.button`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  box-shadow: 0px 3px 6px #00000029;
`;

const CheckTextButtonContainer = styled(BaseButton)`
  background: transparent linear-gradient(68deg, ${Colors.brightCyan} 0%, ${Colors.mediumCyan} 100%) 0% 0% no-repeat
    padding-box;
  &:hover {
    background: ${Colors.darkCyan};
  }
`;

export const CheckTextButton: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
}) => <CheckTextButtonContainer onClick={onClick}>Prüfen</CheckTextButtonContainer>;
