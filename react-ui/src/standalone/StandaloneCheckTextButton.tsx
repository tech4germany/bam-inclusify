import React, { FC } from "react";
import styled from "styled-components";
import { CheckIcon } from "../icons";
import { Colors } from "../common/Colors";

interface CheckTextButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  disabled?: boolean;
}
export const StandaloneCheckTextButton: FC<CheckTextButtonProps> = ({ onClick, disabled }) => (
  <CheckTextButtonContainer onClick={onClick} disabled={disabled} title="Text überprüfen">
    <CheckTextButtonIconContainer>
      <CheckIcon />
    </CheckTextButtonIconContainer>
    <CheckTextButtonTextContainer>PRÜFEN</CheckTextButtonTextContainer>
  </CheckTextButtonContainer>
);

const CheckTextButtonContainer = styled.button`
  background: transparent linear-gradient(68deg, ${Colors.mediumGreen} 0%, ${Colors.brightGreen} 100%) 0% 0% no-repeat
    padding-box;
  border: none;
  border-radius: 0px 0px 8px 8px;
  color: white;
  font-size: 20px;
  padding: 8px 10px;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 1;

  &[disabled] {
    opacity: 0.7;
  }

  &:not([disabled]) {
    cursor: pointer;
    &:hover {
      background: ${Colors.brightGreen};
    }
    &:active {
      background: ${Colors.darkGreen};
    }
  }
`;

const CheckTextButtonIconContainer = styled.div`
  background: white;
  height: 28px;
  width: 28px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckTextButtonTextContainer = styled.div`
  margin-right: 6px;
`;
