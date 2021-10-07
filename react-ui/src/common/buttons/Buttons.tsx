import React, { FC } from "react";
import styled from "styled-components";
import { CheckIcon } from "../../icons";
import { Colors } from "../Colors";

export const BaseButton = styled.button`
  font-size: 14px;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  color: white;
  box-shadow: 0px 3px 6px #00000029;
`;

const CheckTextButtonContainer = styled.button`
  font-size: 20px;
  border: none;
  border-radius: 0px 0px 8px 8px;
  padding: 8px 16px;
  color: white;
  z-index: 1000;
  cursor: pointer;
  background: transparent linear-gradient(68deg, ${Colors.mediumGreen} 0%, ${Colors.brightGreen} 100%) 0% 0% no-repeat
    padding-box;
  &:hover {
    background: ${Colors.brightGreen};
  }
  &:active {
    background: ${Colors.darkGreen};
  }
`;

export const CheckTextButton: FC<{ onClick: React.MouseEventHandler<HTMLButtonElement> | undefined }> = ({
  onClick,
}) => (
  <CheckTextButtonContainer onClick={onClick}>
    <CheckIcon />
    Überprüfen
  </CheckTextButtonContainer>
);
