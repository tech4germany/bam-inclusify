import { FC } from "react";
import styled from "styled-components";
import { Colors } from "../common/styles/Colors";
import { CheckIcon } from "../common/icons";

interface CheckTextButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
  topCornersFlush?: boolean;
  disabled?: boolean;
}
export const AddinCheckTextButton: FC<CheckTextButtonProps> = ({ onClick, topCornersFlush, disabled }) => (
  <AddinCheckTextButtonContainer onClick={onClick} disabled={disabled} title="Text überprüfen">
    <AddinTextButtonIconContainer>
      <CheckIcon viewBox="0 0 14 16" width={20} height={20} fill={Colors.mediumGreen} />
    </AddinTextButtonIconContainer>
    <AddinCheckTextButtonTextContainer>PRÜFEN</AddinCheckTextButtonTextContainer>
  </AddinCheckTextButtonContainer>
);

const AddinCheckTextButtonContainer = styled.button`
  background: transparent linear-gradient(222deg, ${Colors.brightGreen} 0%, ${Colors.mediumGreen} 100%) 0% 0% no-repeat
    padding-box;
  border-radius: 8px;
  border: none;
  color: white;
  font-size: 15px;
  padding: 5px 10px;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 13px;
  opacity: 1;

  min-width: 84px;

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
const AddinTextButtonIconContainer = styled.div`
  background: white;
  height: 35px;
  width: 35px;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
`;
const AddinCheckTextButtonTextContainer = styled.div``;
