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

const CheckTextButtonContainer = styled.button<{ topCornersFlush?: boolean }>`
  background: transparent linear-gradient(68deg, ${Colors.mediumGreen} 0%, ${Colors.brightGreen} 100%) 0% 0% no-repeat
    padding-box;
  border: none;
  border-radius: ${(props) => (!!props.topCornersFlush ? "0px 0px 8px 8px" : "8px 8px")};
  color: white;
  cursor: pointer;
  font-size: 20px;
  padding: 8px 10px;
  z-index: 1000;

  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${Colors.brightGreen};
  }
  &:active {
    background: ${Colors.darkGreen};
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

interface CheckTextButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  topCornersFlush?: boolean;
}
export const CheckTextButton: FC<CheckTextButtonProps> = ({ onClick, topCornersFlush }) => (
  <CheckTextButtonContainer topCornersFlush={topCornersFlush} onClick={onClick}>
    <CheckTextButtonIconContainer>
      <CheckIcon />
    </CheckTextButtonIconContainer>
    <CheckTextButtonTextContainer>Überprüfen</CheckTextButtonTextContainer>
  </CheckTextButtonContainer>
);
